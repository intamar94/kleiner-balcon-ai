export default async function handler(req, res) {
  // permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { query } = req.body;

    // 🔹 1. obtener productos de Shopify
    const shopRes = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
          {
            products(first: 20) {
              edges {
                node {
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node { url }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        price { amount }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        }),
      }
    );

    const shopData = await shopRes.json();
    const products = shopData.data.products.edges.map(e => e.node);

    // 🔹 2. IA (elige 3 productos)
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Elige 3 productos relevantes según la intención del usuario.",
          },
          {
            role: "user",
            content: `Usuario: ${query}
Productos: ${products.map(p => p.title).join(", ")}`,
          },
        ],
      }),
    });

    const aiData = await aiRes.json();
    const text = aiData.choices[0].message.content;

    // 🔹 3. filtrar productos
    const selected = products.filter(p =>
      text.toLowerCase().includes(p.title.toLowerCase())
    ).slice(0, 3);

    return res.status(200).json(selected);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
