export default async function handler(req, res) {
  // ✅ CORS (para que Shopify funcione)
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

    // 🧩 TUS SETS (puedes ampliar a los 18)
    const sets = [
      {
        name: "Set Hierbas de Cocina",
        price: "29,99€",
        tags: ["cocina", "hierbas"],
        link: "/products/set-hierbas"
      },
      {
        name: "Set Vegetales Compactos",
        price: "29,99€",
        tags: ["plantas", "vegetales", "pequeño"],
        link: "/products/set-vegetales"
      },
      {
        name: "Set Balcony Zen Lounge",
        price: "99,99€",
        tags: ["relax", "zen"],
        link: "/products/set-zen"
      },
      {
        name: "Set Café en Balcón",
        price: "59,99€",
        tags: ["cafe", "desayuno"],
        link: "/products/set-cafe"
      }
    ];

    let bestMatch = sets[0];

    // 🔍 buscar por intención
    for (let set of sets) {
      for (let tag of set.tags) {
        if (text.includes(tag)) {
          bestMatch = set;
        }
      }
    }

    // 💰 ajustar por presupuesto
    if (budget >= 100) {
      bestMatch = sets.find(s => s.name.includes("Zen")) || bestMatch;
    }

    const response = {
      name: bestMatch.name,
      price: bestMatch.price,
      reason: "Recomendado según tu búsqueda",
      link: bestMatch.link
    };

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
