const Binance = require("binance-api-node").default;
// CONSTANTES

const BASE = "USDT";
const client = Binance({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.SECRET_KEY,
});
export default async function binance(req, res) {
  //   DATOS GENERALES DE LA CUENTA
  const DATOS_CUENTA = await client.accountInfo({ useServerTime: true });
  // BALANCES DE LA CUENTA (EXEPTO STAKING BLOQUEADO)
  const balances = DATOS_CUENTA.balances
    .filter((item) => item.free > 0.001)
    .filter((item) => {
      if (process.env.IGNORE) {
        const IGNORES = JSON.parse(process.env.IGNORE);

        if (IGNORES.find((item2) => item2 === item.asset)) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    });
  //   BALANCES GENERALES
  const balancesGenerales = await normalizarDatos(balances);

  // BUSCAR INVERSION
  const balancesInversion = await buscarInversiones(balancesGenerales);

  res.status(200).json(balancesInversion);
}

// NORMALIZAR BALANCES Y RECUPERAR PRECIO ACTUAL!
const normalizarDatos = async (datos) => {
  let balancesGenerales = [];

  datos.forEach((currency) => {
    const code = currency.asset.startsWith("LD")
      ? currency.asset.slice(2, currency.asset.length)
      : currency.asset;

    if (code === BASE) {
      return;
    }
    const indice = balancesGenerales.findIndex((cu) => cu.asset === code);

    if (indice === -1) {
      balancesGenerales.push({
        asset: code,
        qt: parseFloat(currency.free),
        inv: 0,
      });
    } else {
      balancesGenerales[indice].qt =
        parseFloat(balancesGenerales[indice].qt) + parseFloat(currency.free);
    }
  });

  let balancesConPrecio = [];
  balancesGenerales.forEach((cu) => {
    const SYMBOL = `${cu.asset}${BASE}`;
    balancesConPrecio.push(
      new Promise((resolve, reject) => {
        client.prices({ symbol: SYMBOL }).then((e) => {
          resolve({
            ...cu,
            precio: parseFloat(e[SYMBOL]),
            symbol: SYMBOL,
          });
        });
      })
    );
  });

  const resultados = await Promise.all(balancesConPrecio);

  return resultados.filter((currency) =>
    currency.qt * currency.precio > 1 ? true : false
  );
};

const buscarInversiones = async (datos) => {
  let inversiones = [];

  //   INVERSIONES TRADES
  datos.forEach((cu) => {
    inversiones.push(
      new Promise((resolve, reject) => {
        client
          .myTrades({ symbol: cu.symbol, useServerTime: true })
          .then((e) => {
            resolve({ ...cu, inversiones: e });
          });
      })
    );
  });

  inversiones = await Promise.all(inversiones);
  //   calcular inversion

  inversiones = inversiones.map((cu) => {
    const invertido = cu.inversiones.reduce((a, b) => {
      return b.isBuyer
        ? a + parseFloat(b.quoteQty)
        : a - parseFloat(b.quoteQty);
    }, 0);

    const INITIAL = process.env.INITIALS
      ? JSON.parse(process.env.INITIALS).find(
          (item) => item.symbol === cu.asset
        )
      : null;

    return {
      ...cu,
      invertido: INITIAL ? INITIAL.initial + invertido : invertido,
      qt: INITIAL ? cu.qt + INITIAL.qt : cu.qt,
    };
  });

  return inversiones
    .map((cu) => {
      return { ...cu, balance: cu.qt * cu.precio - cu.invertido };
    })
    .sort((a, b) => b.balance - a.balance);
};
