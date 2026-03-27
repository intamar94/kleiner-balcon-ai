export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  let recommendations = [];

  if (message.toLowerCase().includes('pequeño')) {
    recommendations.push({
      name: "Set Vegetales Compactos",
      price: "29.99€",
      reason: "Perfecto para balcones pequeños"
    });
  }

  if (message.toLowerCase().includes('relax')) {
    recommendations.push({
      name: "Set Balcony Zen Lounge",
      price: "49.99€",
      reason: "Ideal para descansar"
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      name: "Set Hierbas de Cocina",
      price: "24.99€",
      reason: "Recomendación base"
    });
  }

  res.status(200).json({ recommendations });
}
