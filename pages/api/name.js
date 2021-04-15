export default async function binance(req, res) {
  res.status(200).json({ name: process.env.NOMBRE });
}
