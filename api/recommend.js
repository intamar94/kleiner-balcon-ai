export default async function handler(req, res) {

  // permitir POST desde Shopify
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { query } = req.body;

    const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
    const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    // 🔹 1. traer productos reales
    const response = await fetch(`https://${SHOP}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
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
                  edges{ node{ price{ amount } } }
                }
              }
            }
          }
        }
        `,
      }),
    });

    const data = await response.json();

    const products = data?.data?.products?.edges?.map(e => e.node) || [];

    // 🔹 2. filtro simple (estable)
    const q = query.toLowerCase();

    const filtered = products.filter(p =>
      (p.title + " " + p.description).toLowerCase().includes(q)
    );

    // 🔹 3. fallback SIEMPRE muestra algo
    const results = (filtered.length > 0 ? filtered : products).slice(0, 3);

    return res.status(200).json(results);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
