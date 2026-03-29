export default async function handler(req, res) {
  try {
    const { query } = req.body;

    const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
    const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    const shopifyRes = await fetch(`https://${SHOP}/api/2024-01/graphql.json`, {
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
                id
                title
                description
                handle
                images(first:1){
                  edges{
                    node{
                      url
                    }
                  }
                }
                variants(first:1){
                  edges{
                    node{
                      price{
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `,
      }),
    });

    const data = await shopifyRes.json();

    const products = data.data.products.edges.map(e => e.node);

    // 🔥 FILTRO INTELIGENTE SIMPLE
    const filtered = products.filter(p =>
      (p.title + p.description).toLowerCase().includes(query.toLowerCase())
    );

    // fallback si no hay match
    const results = (filtered.length > 0 ? filtered : products).slice(0, 3);

    res.status(200).json(results);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
