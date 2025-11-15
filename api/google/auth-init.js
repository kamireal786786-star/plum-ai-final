// api/google/auth-init.js
export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const base = process.env.BASE_URL || `https://${req.headers.host}`;
  const redirectUri = `${base}/api/google/auth-callback`;
  const scope = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
    "openid",
    "email",
    "profile"
  ].join(" ");

  if (!clientId) return res.status(500).send("Missing GOOGLE_CLIENT_ID in environment.");

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    "?response_type=code" +
    "&access_type=offline" + // IMPORTANT — asks for refresh token
    "&prompt=consent" + // force consent to ensure refresh token returned
    `&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  return res.redirect(url);
}
