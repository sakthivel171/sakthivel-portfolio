export const prerender = false; // ✅ Bug 1 fix — MUST be here

export async function POST({ request }) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }, // ✅ Bug 4 fix
      });
    }

    const webhookURL = import.meta.env.DISCORD_WEBHOOK_URL; // ✅ Bug 2 fix — check this exists

    if (!webhookURL) {
      console.error("DISCORD_WEBHOOK_URL is not set in .env");
      return new Response(JSON.stringify({ success: false, error: "Server config error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const discordRes = await fetch(webhookURL, { // ✅ Bug 3 fix — check Discord response
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "📩 New Contact Message",
          color: 0x6366f1,
          fields: [
            { name: "Name",    value: name },
            { name: "Email",   value: email },
            { name: "Subject", value: subject || "—" },
            { name: "Message", value: message },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    if (!discordRes.ok) {
      console.error("Discord rejected the request:", discordRes.status);
      throw new Error("Discord error");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Contact API error:", err);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}