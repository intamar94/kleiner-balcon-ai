export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const text = message.toLowerCase();

    // 🧠 detectar número (presupuesto)
    const numberMatch = text.match(/\d+/);
    const budget = numberMatch ? parseInt(numberMatch[0]) : 0;

    let response;

    // 🌿 lógica básica (luego ampliamos a los 18 sets)
    if (budget >= 120) {
      response = {
        name: "Set Balcony Zen Lounge",
        price: "99,99€",
        reason: "Perfecto para relajarte en tu balcón",
        link: "/products/set-zen"
      };
    } else if (budget >= 70) {
      response = {
        name: "Set Café en Balcón",
        price: "59,99€",
        reason: "Ideal para desayunar o leer",
        link: "/products/set-cafe"
      };
    } else if (budget >= 40) {
      response = {
        name: "Set Vegetales Compactos",
        price: "29,99€",
        reason: "Ideal para balcones pequeños",
        link: "/products/set-vegetales"
      };
    } else {
      response = {
        name: "Set Básico Balcón",
        price: "19,99€",
        reason: "Una opción simple para empezar",
        link: "/products/set-basico"
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
