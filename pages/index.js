import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import styles2 from "../styles/Home.module.scss";
import hello from "./api/hello";

export default function Home(datos) {
  // { invertido = 0, ganancia = 0, monedas = [] }
  const [{ monedas, ganancia, invertido }, setValores] = useState(datos);

  // useEffect(() => {
  //   setInterval(async () => {
  //     const res = await fetch(
  //       "https://us-central1-mc-remesas.cloudfunctions.net/obtainCurrency"
  //     );
  //     const {
  //       data: { data, invertido, ganancia },
  //     } = await res.json();

  //     setValores({ monedas: data, invertido, ganancia });
  //   }, 15000);
  // });

  return (
    <div className={styles.container}>
      <Head>
        <title>Spot DANIEL NAVA</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Bienvenido al SPOT de <a href="#">Daniel Nava!</a>
        </h1>
        <div className={styles2.contentTable}>
          <table>
            <tr>
              <td className={styles2.header}>MONEDA</td>
              <td className={styles2.header}>INVERTIDO</td>
              <td className={styles2.header}>CANTIDAD</td>
              <td className={styles2.header}>PRECIO</td>

              <td className={styles2.header}>BALANCE</td>
            </tr>
            {monedas.map((moneda, i) => {
              return (
                <tr key={i}>
                  <td className={styles2.mainCell}>{moneda.token}</td>
                  <td className={styles2.cell}>{moneda.invertido}</td>
                  <td className={styles2.cell}>{moneda.qt}</td>
                  <td className={styles2.cell}>{moneda.precioVenta}</td>{" "}
                  <td
                    className={styles2.cell}
                    style={{
                      fontWeight: 600,
                      fontSize: "1.1em",
                      color: moneda.ganancia > 0 ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {Math.round(moneda.ganancia * 100) / 100}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className={styles2.mainCell}>TOTAL</td>
              <td colSpan={2} style={{ textAlign: "center" }}>
                {Math.round(invertido * 100) / 100} USD
              </td>
              <td
                colSpan={2}
                style={{
                  fontWeight: 600,
                  fontSize: "1.3em",
                  color: ganancia > 0 ? "#2e7d32" : "#c62828",
                }}
                className={styles2.cellFinal}
              >
                {Math.round(ganancia * 100) / 100} USD
              </td>
            </tr>
          </table>
        </div>
      </main>

      <footer className={styles.footer}>Powered by Daniel Nava</footer>
    </div>
  );
}

Home.getInitialProps = async (ctx) => {
  const res = await fetch(
    "https://us-central1-mc-remesas.cloudfunctions.net/obtainCurrency"
  );
  const {
    data: { data, invertido, ganancia },
  } = await res.json();

  return { invertido, ganancia, monedas: data };
};
