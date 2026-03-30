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

    // 🛒 1. TRAER PRODUCTOS (SIN QUERY)
    const response = await fetch(
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
            products(first: 20) {
              edges {
                node {
                  title
                  handle
                  description
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

    const data = await response.json();

    let products = data?.data?.products?.edges?.map(e => e.node) || [];

    // 🔍 2. FILTRO INTELIGENTE (LOCAL)
    const q = query.toLowerCase();

    let filtered = products.filter(p =>
      (p.title + " " + p.description).toLowerCase().includes(q)
    );

    // 🔥 3. SI NO HAY MATCH → MOSTRAR IGUAL
    if (filtered.length === 0) {
      filtered = products;
    }

    // 🎯 4. SOLO 3 RESULTADOS
    const result = filtered.slice(0, 3);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
