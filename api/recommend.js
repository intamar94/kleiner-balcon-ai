export default async function handler(req, res) {
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

  const BASE_URL = "https://kleiner-balkon.myshopify.com";

  const products = [
    {
      name: "Set Kräuter Küche",
      price: "19,99€",
      description: "Frische Kräuter für kleine Balkone",
      tags: ["klein", "küche", "pflanzen"],
      link: BASE_URL + "/products/kraeuter-set"
    },
    {
      name: "Set Kompakte Gemüse",
      price: "29,99€",
      description: "Ideal für kleine Balkone",
      tags: ["klein", "gemüse"],
      link: BASE_URL + "/products/gemuese-set"
    },
    {
      name: "Set Balkon Zen Lounge",
      price: "49,99€",
      description: "Perfekt zum Entspannen",
      tags: ["relax", "komfort"],
      link: BASE_URL + "/products/zen-set"
    },
    {
      name: "Set Café Balkon",
      price: "39,99€",
      description: "Kaffeegenuss draußen",
      tags: ["cafe", "entspannen"],
      link: BASE_URL + "/products/cafe-set"
    },
    {
      name: "Set Beleuchtung Ambiente",
      price: "34,99€",
      description: "Atmosphäre für den Abend",
      tags: ["licht", "abend"],
      link: BASE_URL + "/products/licht-set"
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
Du bist ein Verkaufsberater für Balkon-Produkte.

User Anfrage:
"${message}"

Produkte:
${JSON.stringify(products)}

Regeln:
- Wähle IMMER 3 Produkte
- Priorisiere Relevanz (Thema + Budget)
- Wenn unklar → zeige Bestseller
- Schreibe auf Deutsch
- Grund kurz und verkaufsstark

Antwortformat (nur JSON):

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

    let text = data.output?.[0]?.content?.[0]?.text || "";

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      // fallback inteligente (SIEMPRE 3)
      parsed = {
        results: products.slice(0, 3).map(p => ({
          name: p.name,
          price: p.price,
          reason: "Beliebte Wahl für viele Kunden",
          link: p.link
        }))
      };
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(200).json({
      results: products.slice(0, 3).map(p => ({
        name: p.name,
        price: p.price,
        reason: "Empfohlene Standard-Auswahl",
        link: p.link
      }))
    });
  }
}
