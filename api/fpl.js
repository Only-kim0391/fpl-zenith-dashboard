export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let target = '';
  if (req.query.path) {
    target = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  } else if (req.url) {
    const u = req.url.split('?')[0];
    target = u.replace(/^\/api\/fpl\/?/, '').replace(/^\//, '');
  }
  const clean = (target || 'bootstrap-static').replace(/\/+$/, '');
  const url = `https://fantasy.premierleague.com/api/${clean}/`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FPLZenith/2.0)',
        'Accept': 'application/json'
      }
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: `FPL API returned ${r.status}`, url });
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Proxy fetch failed' });
  }
}
