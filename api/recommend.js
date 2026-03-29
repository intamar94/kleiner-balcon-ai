export default async function handler(req, res) {
  // CORS (MUY IMPORTANTE para Shopify)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  // 🔥 TODOS TUS SETS (puedes ampliar sin romper nada)
  const products = [
    {
      name: "Set Kräuter Küche",
      price: "19,99€",
      description: "Perfekt für frische Kräuter auf kleinen Balkonen",
      tags: ["klein", "küche", "kräuter", "anfänger"],
      link: "/products/kraeuter-set"
    },
    {
      name: "Set Kompakte Gemüse",
      price: "29,99€",
      description: "Ideal für kleine Balkone mit wenig Platz",
      tags: ["klein", "gemüse", "platzsparend"],
      link: "/products/gemuese-set"
    },
    {
      name: "Set Balkon Zen Lounge",
      price: "49,99€",
      description: "Perfekt zum Entspannen und Relaxen",
      tags: ["relax", "zen", "komfort"],
      link: "/products/zen-set"
    },
    {
      name: "Set Café Balkon",
      price: "39,99€",
      description: "Für gemütliche Kaffee-Momente draußen",
      tags: ["cafe", "kaffee", "entspannen"],
      link: "/products/cafe-set"
    },
    {
      name: "Set Beleuchtung Ambiente",
      price: "34,99€",
      description: "Schafft eine warme Atmosphäre am Abend",
      tags: ["licht", "abend", "romantik"],
      link: "/products/licht-set"
    }
  ];

  try {
    const prompt = `
Du bist ein Verkaufsberater für Balkon-Produkte.

User Anfrage:
"${message}"

Hier ist die Produktliste:
${JSON.stringify(products)}

Aufgabe:
- Wähle die 2 bis 3 besten Produkte
- Antworte auf Deutsch
- Priorisiere Relevanz (Preis, Zweck, Größe)

Antworte nur in JSON:

{
  "results": [
    {
      "name": "...",
      "price": "...",
      "reason": "...",
      "link": "..."
    }
  ]
}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: prompt
      })
    });

    const data = await response.json();

    const text = data.output[0].content[0].text;

    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: "AI error", detail: err.message });
  }
}
