// api/google/freebusy.js
// POST { timeMin: ISO, timeMax: ISO } -> returns [{start, end}, ...] busy slots for primary calendar

async function getAccessTokenFromRefresh() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error('Missing Google OAuth env vars.');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('Failed to refresh access token: ' + JSON.stringify(j));
  return j.access_token;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { timeMin, timeMax } = req.body || {};
    if (!timeMin || !timeMax) return res.status(400).json({ error: 'Missing timeMin or timeMax' });

    const accessToken = await getAccessTokenFromRefresh();

    const r = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: 'primary' }]
      })
    });

    const j = await r.json();
    if (r.status < 200 || r.status >= 300) {
      console.error('freebusy error', j);
      return res.status(500).json({ error: 'FreeBusy API error', detail: j });
    }

    const busy = j.calendars?.primary?.busy || [];
    // each busy entry has start/end
    return res.status(200).json(busy);
  } catch (err) {
    console.error('freebusy handler error', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
