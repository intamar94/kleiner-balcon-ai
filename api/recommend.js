export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const text = message.toLowerCase();

  let recommendation = {
    name: "Set Básico",
    price: "29.99€",
    reason: "Ideal para empezar"
  };

  if (text.includes("pequeño")) {
    recommendation = {
      name: "Set Vegetales Compactos",
      price: "29.99€",
      reason: "Perfecto para balcones pequeños"
    };
  }

  if (text.includes("relax")) {
    recommendation = {
      name: "Set Balcony Zen Lounge",
      price: "49
