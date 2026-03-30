export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { query } = req.body;

    // 🧠 1. Interpretar intención con IA
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un asistente que convierte búsquedas en palabras clave de productos para ecommerce."
          },
          {
            role: "user",
            content: query
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const keywords = aiData.choices[0].message.content;

    // 🛒 2. Buscar productos en Shopify
    const shopifyResponse = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `
            {
              products(first: 10, query: "${keywords}") {
                edges {
                  node {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          price {
                            amount
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `
        })
      }
    );

    const shopifyData = await shopifyResponse.json();

    const products = shopifyData.data.products.edges.map(e => e.node);

    // 🎯 3. Limitar a 3 productos
    const result = products.slice(0, 3);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
