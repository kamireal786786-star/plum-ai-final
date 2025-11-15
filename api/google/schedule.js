// api/google/schedule.js
function toBase64Url(str) {
  return Buffer.from(str, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessTokenFromRefresh(refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("Failed to refresh access token: " + JSON.stringify(j));
  return j.access_token;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, email, date, time, duration } = req.body || {};
    if (!name || !email || !date || !time) return res.status(400).json({ error: "Missing required fields (name,email,date,time)." });

    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!refreshToken) return res.status(500).json({ error: "Server not configured with GOOGLE_REFRESH_TOKEN." });

    const accessToken = await getAccessTokenFromRefresh(refreshToken);

    const meetingDuration = duration ? Number(duration) : (process.env.DEFAULT_MEETING_DURATION ? Number(process.env.DEFAULT_MEETING_DURATION) : 30);
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + meetingDuration * 60000);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const event = {
      summary: `Meeting with ${name}`,
      description: `Discovery call with ${name} (${email}) scheduled via PlumBot.`,
      start: { dateTime: start.toISOString(), timeZone },
      end: { dateTime: end.toISOString(), timeZone },
      attendees: [{ email }, /* admin will be added by default below */ ],
    };

    // Create event
    const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });

    const calJson = await calRes.json();
    if (calRes.status < 200 || calRes.status >= 300) {
      console.error("Calendar create error", calJson);
      return res.status(500).json({ error: "Failed to create calendar event", detail: calJson });
    }

    // Send confirmation emails via Gmail API (two messages: client + admin)
    const adminEmail = process.env.ADMIN_EMAIL;
    const clientSubject = `Confirmation: Your Meeting with Plum AI on ${date}`;
    const clientBody = `Hi ${name},

This confirms your ${meetingDuration}-minute meeting with Plum AI.

Meeting details:
- Date: ${date}
- Time: ${time}
- Duration: ${meetingDuration} minutes

You will also receive a calendar invite.

Thanks,
Plum AI`;

    const adminSubject = `New Meeting Scheduled with ${name}`;
    const adminBody = `A new meeting has been scheduled via PlumBot.

Client:
- Name: ${name}
- Email: ${email}

Meeting:
- Date: ${date}
- Time: ${time}
- Duration: ${meetingDuration} minutes

Event link: ${calJson.htmlLink || "(no link provided)"}
`;

    const makeRaw = (to, from, subject, message) => {
      const email = [
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        `Content-Transfer-Encoding: 7bit`,
        `to: ${to}`,
        `from: ${from}`,
        `subject: =?utf-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
        ``,
        message
      ].join("\n");
      return toBase64Url(email);
    };

    // Send to client
    const rawClient = makeRaw(email, adminEmail || "me", clientSubject, clientBody);
    const sendClient = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: rawClient })
    });
    const sendClientJson = await sendClient.json();
    if (sendClient.status < 200 || sendClient.status >= 300) {
      console.error("Failed to send client email", sendClientJson);
      // Continue — calendar is created; we can warn but not block
    }

    // Send to admin (if admin email available)
    if (adminEmail) {
      const rawAdmin = makeRaw(adminEmail, adminEmail, adminSubject, adminBody);
      const sendAdmin = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw: rawAdmin })
      });
      const sendAdminJson = await sendAdmin.json();
      if (sendAdmin.status < 200 || sendAdmin.status >= 300) {
        console.error("Failed to send admin email", sendAdminJson);
      }
    }

    return res.status(200).json({ success: true, event: calJson });
  } catch (err) {
    console.error("schedule error", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
