export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {

    // 🔥 SOLO SHOPIFY (sin IA)
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
              products(first: 3) {
                edges {
                  node {
                    title
                    handle
                  }
                }
              }
            }
          `
        })
      }
    );

    const data = await shopifyResponse.json();

    return res.status(200).json(data);

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Shopify fail" });
  }
}
