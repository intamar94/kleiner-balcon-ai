export default async function handler(req, res) {
  // 🔐 CORS (obligatorio para Shopify)
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

    // 🛒 FETCH PRODUCTOS DE SHOPIFY
    const shop = "kleiner-balkon.myshopify.com";
    const accessToken = process.env.SHOPIFY_ADMIN_TOKEN;

    const shopRes = await fetch(
      `https://${shop}/admin/api/2024-01/products.json?limit=20`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    const shopData = await shopRes.json();

    const products = shopData.products.map(p => ({
      title: p.title,
      price: p.variants[0].price + "€",
      link: `https://${shop}/products/${p.handle}`
    }));

    // 🤖 IA
    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `
User search: ${message}

Products:
${products.map(p => `${p.title} - ${p.price}`).join("\n")}

Pick the 3 BEST products for this user.
Respond ONLY in JSON:

{
  "results": [
    { "title": "...", "reason": "...", "price": "...", "link": "..." }
  ]
}
`
      })
    });

    const aiData = await openaiRes.json();

    const text = aiData.output[0].content[0].text;

    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
