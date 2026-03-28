export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  let response = {
    name: "Set Vegetales Compactos",
    price: "29,99€",
    reason: "Ideal para balcones pequeños",
    link: "https://kleinerbalkon.com/products/set-vegetales"
  };

  if (message.toLowerCase().includes("50")) {
    response = {
      name: "Set Balcony Zen Lounge",
      price: "49,99€",
      reason: "Perfecto para relajarte en tu balcón",
      link: "https://kleinerbalkon.com/products/zen-lounge"
    };
  }

  return res.status(200).json(response);
}
