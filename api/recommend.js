export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
    const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;

    const shopifyRes = await fetch(
      `https://${SHOP}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": TOKEN,
        },
        body: JSON.stringify({
          query: `
          {
            products(first: 30) {
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
      }
    );

    const data = await shopifyRes.json();

    const products = data?.data?.products?.edges?.map(e => e.node) || [];

    // 🔥 matching mejorado
    const q = query.toLowerCase();

    const scored = products.map(p => {
      const text = (p.title + " " + p.description).toLowerCase();

      let score = 0;

      if (text.includes(q)) score += 3;

      const words = q.split(" ");
      words.forEach(w => {
        if (text.includes(w)) score += 1;
      });

      return { ...p, score };
    });

    const sorted = scored
      .sort((a, b) => b.score - a.score)
      .filter(p => p.score > 0);

    const results =
      sorted.length > 0
        ? sorted.slice(0, 3)
        : products.slice(0, 3);

    res.status(200).json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
