export default async function handler(req, res) {
  // CORS
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

  const products = [
    {
      name: "Set Kräuter Küche",
      price: "19,99€",
      description: "Perfekt für frische Kräuter auf kleinen Balkonen",
      tags: ["klein", "küche", "kräuter"],
      link: "/products/kraeuter-set"
    },
    {
      name: "Set Kompakte Gemüse",
      price: "29,99€",
      description: "Ideal für kleine Balkone mit wenig Platz",
      tags: ["klein", "gemüse"],
      link: "/products/gemuese-set"
    },
    {
      name: "Set Balkon Zen Lounge",
      price: "49,99€",
      description: "Perfekt zum Entspannen",
      tags: ["relax", "komfort"],
      link: "/products/zen-set"
    },
    {
      name: "Set Café Balkon",
      price: "39,99€",
      description: "Für Kaffee und Genuss",
      tags: ["cafe", "entspannen"],
      link: "/products/cafe-set"
    }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `
Du bist ein Experte für Balkon-Produkte.

User Anfrage:
"${message}"

Produkte:
${JSON.stringify(products)}

Wähle die 2 besten Produkte.

Antworte NUR so (kein extra Text):

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
`
      })
    });

    const data = await response.json();

    // 🔥 solución robusta (NO rompe si IA añade texto)
    let text = data.output?.[0]?.content?.[0]?.text || "";

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    return res.status(200).json({
      results: [
        {
          name: "Set Kompakte Gemüse",
          price: "29,99€",
          reason: "Gute Standard-Empfehlung für deinen Balkon",
          link: "/products/gemuese-set"
        }
      ]
    });
  }
}
