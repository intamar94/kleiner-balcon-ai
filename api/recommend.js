export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = '';

    await new Promise((resolve) => {
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', resolve);
    });

    const { message } = JSON.parse(body || '{}');

    return res.status(200).json({
      recommendation: `Recomendación para: ${message || 'sin mensaje'}`
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal error',
      detail: error.message
    });
  }
}
