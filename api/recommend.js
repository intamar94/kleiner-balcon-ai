export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  const text = message.toLowerCase();

  let response;

  // 💰 Detectar presupuesto
  if (text.includes("200")) {
    response = {
      name: "Set Balcony Zen Lounge",
      price: "99,99€",
      reason: "Perfecto para relajarte en tu balcón",
      link: "https://kleinerbalkon.com/products/set-zen"
    };
  } else if (text.includes("100")) {
    response = {
      name: "Set Café en Balcón",
      price: "59,99€",
      reason: "Ideal para desayunar o leer",
      link: "https://kleinerbalkon.com/products/set-cafe"
    };
  } else if (text.includes("50")) {
    response = {
      name: "Set Vegetales Compactos",
      price: "29,99€",
      reason: "Ideal para balcones pequeños",
      link: "https://kleinerbalkon.com/products/set-vegetales"
    };
  } else {
    response = {
      name: "Set Básico Balcón",
      price: "19,99€",
      reason: "Una opción simple para empezar",
      link: "https://kleinerbalkon.com/products/set-basico"
    };
  }

  res.status(200).json(response);
}
