export default async function handler(req, res) {

  // ✅ CORS (CLAVE)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔴 IMPORTANTE: manejar preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {

    const { query } = req.body;

    // 👉 TEST SIMPLE (luego metemos IA real)
    return res.status(200).json([
      {
        title: "Balkon Relax Set",
        handle: "balcony-relax-set",
        variants: { edges: [{ node: { price: { amount: 49.99 }}}]},
        images: { edges: [] }
      },
      {
        title: "Kräuter Set",
        handle: "krauter-set",
        variants: { edges: [{ node: { price: { amount: 29.99 }}}]},
        images: { edges: [] }
      },
      {
        title: "Lichter Balkon Set",
        handle: "lichter-set",
        variants: { edges: [{ node: { price: { amount: 19.99 }}}]},
        images: { edges: [] }
      }
    ]);

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
