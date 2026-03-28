export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body || {};
    const text = (message || "").toLowerCase();

    let recommendation = {
      name: "Set Básico",
      price: "29.99€",
      reason: "Ideal para empezar",
      link: "https://TU-TIENDA.myshopify.com/products/set-basico"
    };

    if (text.includes("pequeño") || text.includes("small")) {
      recommendation = {
        name: "Set Vegetales Compactos",
        price: "29.99€",
        reason: "Perfecto para balcones pequeños",
        link: "https://TU-TIENDA.myshopify.com/products/set-vegetales-compactos"
      };
    }

    if (text.includes("relax") || text.includes("zen")) {
      recommendation = {
        name: "Set Balcony Zen Lounge",
        price: "49.99€",
        reason: "Ideal para descansar",
        link: "https://TU-TIENDA.myshopify.com/products/zen-lounge"
      };
    }

    if (text.includes("luces") || text.includes("noche")) {
      recommendation = {
        name: "Set Iluminación Ambiente",
        price: "39.99€",
        reason: "Ambiente perfecto por la noche",
        link: "https://TU-TIENDA.myshopify.com/products/iluminacion"
      };
    }

    return res.status(200).json(recommendation);

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
