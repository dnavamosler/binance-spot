import { useEffect, useMemo, useState } from "react";
import useSwr from "swr";
import Image from "next/image";
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home(datos) {
  const { data, error } = useSwr("/api/binance", fetcher, {
    refreshInterval: 3000,
  });

  const headers = ["TOKEN", "INV", "QT", "PRICE", "BALANCE"];

  const BALANCE = useMemo(() => {
    try {
      return Math.round(data.reduce((a, b) => a + b.balance, 0) * 10) / 10;
    } catch (error) {
      return 0;
    }
  }, [data]);

  const cargando = !data && !error;
  // const cargando = true;

  const { data: name } = useSwr("/api/name", fetcher);

  const getInvertido = (datos) =>
    Math.round(datos.reduce((acc, cu) => acc + cu.invertido, 0) * 100) / 100;

  const getPercentBalance = (invertido, balance) =>
    Math.round(((100 * balance) / invertido) * 100) / 100;

  return (
    <div className="flex justify-center flex-wrap bg-blue-200 absolute top-0 left-0 right-0 bottom-0">
      {cargando ? (
        <Loading />
      ) : (
        <div className="w-full max-w-lg  mt-16  ">
          <div className="mb-4 flex justify-center">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <span className="font-light text-center text-blue-600 text-lg">
                  Wallet
                </span>
                <span className="font-semibold text-center text-blue-800 text-2xl">
                  {name ? name.name : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 bg-white rounded-lg shadow-lg py-2">
            {headers.map((token) => (
              <div
                key={token}
                className="p-2 border-b-2 text-right border-blue-700 text-sm text-blue-600 font-semibold"
              >
                {token}
              </div>
            ))}
            {data.map((asset) => {
              return (
                <>
                  <div className="px-2 font-light border-b border-blue-200 text-right">
                    {asset.asset}
                  </div>
                  <div className="px-2 border-b border-blue-200 text-right">
                    {Math.round(asset.invertido * 100) / 100}
                  </div>
                  <div className="px-2 border-b border-blue-200 text-right">
                    {Math.round(asset.qt * 1000) / 1000}
                  </div>
                  <div className="px-2 border-b border-blue-200 text-right">
                    {Math.round(asset.precio * 1000) / 1000}
                  </div>
                  <div
                    className={`px-2 border-b border-blue-200 text-right font-black ${
                      asset.balance > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.round(asset.balance * 100) / 100}
                  </div>
                </>
              );
            })}
            <div className="px-2 font-medium border-b border-blue-200 text-right">
              Invertido:
            </div>
            <div className="px-2 font-bold border-b border-r border-blue-200 text-lg text-right">
              {getInvertido(data)}
            </div>
            <div className="px-2 font-medium border-b border-blue-200 text-right">
              Porcentaje:
            </div>
            <div
              className={`px-2 font-bold border-b  border-blue-200 text-lg text-right col-span-2 ${
                getPercentBalance(getInvertido(data), BALANCE) > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {getPercentBalance(getInvertido(data), BALANCE)} %
            </div>
          </div>

          <div className=" mt-10">
            <h1 className="text-center text-blue-700 font-semibold">
              BALANCE ACTUAL
            </h1>
            <p
              className={`text-center font-bold text-4xl ${
                BALANCE > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {BALANCE} USD
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const Loading = () => {
  return (
    <div className="flex justify-center items-center flex-col">
      <Image src="/cargando.svg" width={300} height={300} />
      <h3 className="text-blue-600 text-4xl">Cargando...</h3>
    </div>
  );
};
