export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const text = message.toLowerCase();

    // 💰 presupuesto
    const numberMatch = text.match(/\d+/);
    const budget = numberMatch ? parseInt(numberMatch[0]) : 0;

    // 🧠 TODOS TUS SETS (alemán)
    const sets = [
      {
        name: "Kräuter-Set für kleine Balkone",
        price: "29,99€",
        tags: ["kräuter", "küche", "pflanzen"],
        link: "/products/kraeuter-set"
      },
      {
        name: "Set Kompakte Gemüse",
        price: "29,99€",
        tags: ["gemüse", "pflanzen", "klein"],
        link: "/products/gemuese-set"
      },
      {
        name: "Blumen & Bestäuber Set",
        price: "34,99€",
        tags: ["blumen", "bienen", "farben"],
        link: "/products/blumen-set"
      },
      {
        name: "Keimungs-Set",
        price: "19,99€",
        tags: ["keimung", "starter", "anfang"],
        link: "/products/keimung-set"
      },
      {
        name: "Vertikales Garten-Set",
        price: "59,99€",
        tags: ["vertikal", "wand", "platz sparen"],
        link: "/products/vertikal-set"
      },
      {
        name: "Ambientebeleuchtung Set",
        price: "39,99€",
        tags: ["licht", "abend", "stimmung"],
        link: "/products/licht-set"
      },
      {
        name: "Balcony Zen Lounge Set",
        price: "99,99€",
        tags: ["relax", "zen", "entspannen"],
        link: "/products/zen-set"
      },
      {
        name: "Café Balkon Set",
        price: "59,99€",
        tags: ["cafe", "frühstück", "lesen"],
        link: "/products/cafe-set"
      },
      {
        name: "Nacht Chill Set",
        price: "49,99€",
        tags: ["nacht", "chill", "abend"],
        link: "/products/chill-set"
      },
      {
        name: "Privatsphäre Set",
        price: "69,99€",
        tags: ["privat", "schutz", "sichtschutz"],
        link: "/products/privacy-set"
      },
      {
        name: "Ordnung & Lagerung Set",
        price: "39,99€",
        tags: ["ordnung", "lagerung"],
        link: "/products/storage-set"
      },
      {
        name: "Instagram Balkon Set",
        price: "49,99€",
        tags: ["instagram", "foto"],
        link: "/products/insta-set"
      },
      {
        name: "Pet Friendly Balkon Set",
        price: "44,99€",
        tags: ["haustier", "katze", "hund"],
        link: "/products/pet-set"
      },
      {
        name: "Picknick Balkon Set",
        price: "54,99€",
        tags: ["picknick", "essen"],
        link: "/products/picnic-set"
      },
      {
        name: "Medizinische Pflanzen Set",
        price: "34,99€",
        tags: ["medizin", "gesundheit"],
        link: "/products/medicinal-set"
      },
      {
        name: "Kreativer Balkon Set",
        price: "29,99€",
        tags: ["kreativ", "kunst"],
        link: "/products/creative-set"
      },
      {
        name: "Romantischer Balkon Set",
        price: "59,99€",
        tags: ["romantisch", "paar"],
        link: "/products/romantic-set"
      },
      {
        name: "Spaß & Themen Balkon Set",
        price: "49,99€",
        tags: ["party", "spaß"],
        link: "/products/fun-set"
      }
    ];

    let bestMatch = sets[0];

    // 🔍 buscar por intención
    for (let set of sets) {
      for (let tag of set.tags) {
        if (text.includes(tag)) {
          bestMatch = set;
        }
      }
    }

    // 💰 lógica por presupuesto
    if (budget >= 80) {
      bestMatch = sets.find(s => s.price.includes("99")) || bestMatch;
    } else if (budget >= 50) {
      bestMatch = sets.find(s => s.price.includes("59")) || bestMatch;
    }

    const response = {
      name: bestMatch.name,
      price: bestMatch.price,
      reason: "Empfohlen basierend auf deiner Suche",
      link: bestMatch.link
    };

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
