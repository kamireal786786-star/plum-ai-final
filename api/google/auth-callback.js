// api/google/auth-callback.js
export default async function handler(req, res) {
  try {
    const code = req.query.code;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const base = process.env.BASE_URL || `https://${req.headers.host}`;
    const redirectUri = `${base}/api/google/auth-callback`;

    if (!code) return res.status(400).send("Missing code in query.");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenRes.json();

    // tokenData may include access_token, expires_in, refresh_token (only on first consent)
    // Instruct admin to copy refresh_token to Vercel env var GOOGLE_REFRESH_TOKEN
    // For safety we return only a short HTML page prompting the admin what to do.
    const refresh = tokenData.refresh_token || null;
    const partial = {
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      refresh_token: refresh ? "(RECEIVED)" : "(NOT RETURNED - maybe previously consented)"
    };

    return res.status(200).send(`
      <html>
        <body style="font-family:Inter,system-ui,Arial,sans-serif;line-height:1.6;padding:20px;">
          <h2>Google OAuth completed</h2>
          <p>Copy the <strong>refresh_token</strong> below into your Vercel environment variable <code>GOOGLE_REFRESH_TOKEN</code>.</p>
          <pre style="background:#f5f5f5;padding:12px;border-radius:6px;">${refresh ? refresh : "No refresh_token returned. If you previously consented, try selecting 'Add account' -> 'Use another account' and ensure 'prompt=consent' is used."}</pre>
          <p><strong>Next steps:</strong></p>
          <ol>
            <li>Go to your Vercel Project → Settings → Environment Variables.</li>
            <li>Add <code>GOOGLE_REFRESH_TOKEN</code> with the value above.</li>
            <li>Also set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in Vercel (if not set already).</li>
            <li>After adding the refresh token, remove or protect this endpoint (it returns secrets).</li>
          </ol>
          <p><a href="/">Back to site</a></p>
          <hr />
          <pre>${JSON.stringify(partial, null, 2)}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("auth-callback error", err);
    return res.status(500).send("OAuth callback error: " + (err.message || err));
  }
}
