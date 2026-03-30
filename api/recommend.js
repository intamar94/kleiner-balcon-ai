export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { query } = req.body;

    // 🧠 1. IA: interpretar intención + presupuesto
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
            content: `
Extrae de la búsqueda:
1. palabras clave de productos
2. presupuesto máximo si existe

Responde SOLO en JSON:
{
  "keywords": "...",
  "budget": number | null
}
`
          },
          {
            role: "user",
            content: query
          }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const parsed = JSON.parse(aiData.choices[0].message.content);

    const keywords = parsed.keywords || query;
    const budget = parsed.budget;

    // 🛒 2. Shopify query
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
            products(first: 20, query: "${keywords}") {
              edges {
                node {
                  title
                  handle
                  images(first:1){
                    edges{ node{ url } }
                  }
                  variants(first:1){
                    edges{
                      node{
                        price{ amount }
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

    let products = shopifyData.data.products.edges.map(e => e.node);

    // 🎯 3. FILTRO POR PRESUPUESTO
    if (budget) {
      products = products.filter(p => {
        const price = parseFloat(p.variants.edges[0].node.price.amount);
        return price <= budget;
      });
    }

    // 🎯 4. SOLO 3 RESULTADOS
    const result = products.slice(0, 3);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
