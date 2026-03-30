export default async function handler(req, res) {

  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { query } = req.body;

    // 🧠 1. IA → interpretar intención
    let keywords = query;
    let budget = null;

    try {
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
- palabras clave de productos (en alemán)
- presupuesto máximo si existe

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

      keywords = parsed.keywords || query;
      budget = parsed.budget;

    } catch (e) {
      console.log("IA fallback activado");
    }

    // 🛒 2. BUSCAR PRODUCTOS EN SHOPIFY
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

    let products = shopifyData?.data?.products?.edges?.map(e => e.node) || [];

    // 🎯 3. FILTRO POR PRESUPUESTO
    let filtered = products;

    if (budget) {
      filtered = products.filter(p => {
        const price = parseFloat(p.variants.edges[0].node.price.amount);
        return price <= budget;
      });
    }

    // 🔥 4. FALLBACK SI NO HAY RESULTADOS
    if (filtered.length === 0) {
      filtered = products;
    }

    // 🔥 5. FALLBACK TOTAL (traer productos sin filtro)
    if (filtered.length === 0) {

      const fallbackResponse = await fetch(
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
              products(first: 10) {
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

      const fallbackData = await fallbackResponse.json();
      filtered = fallbackData?.data?.products?.edges?.map(e => e.node) || [];
    }

    // 🎯 6. LIMITAR A 3 RESULTADOS
    const result = filtered.slice(0, 3);

    return res.status(200).json(result);

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
