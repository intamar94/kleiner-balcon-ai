export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { query } = req.body;

    // 🧠 EXTRAER PRESUPUESTO
    let budget = null;
    const match = query.match(/(\d+)/);
    if (match) {
      budget = parseFloat(match[1]);
    }

    // 🛒 TRAER PRODUCTOS
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

    // 🔍 FILTRO POR TEXTO
    const q = query.toLowerCase();
    let filtered = products.filter(p =>
      (p.title + " " + p.description).toLowerCase().includes(q)
    );

    // 🔥 SI NO HAY MATCH → usar todos
    if (filtered.length === 0) {
      filtered = products;
    }

    // 🎯 FILTRO REAL DE PRESUPUESTO
    if (budget) {
      const budgetFiltered = filtered.filter(p => {
        const price = parseFloat(p.variants.edges[0].node.price.amount);
        return price <= budget;
      });

      // ⚠️ SOLO aplicar si hay resultados válidos
      if (budgetFiltered.length > 0) {
        filtered = budgetFiltered;
      }
    }

    const result = filtered.slice(0, 3);

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
