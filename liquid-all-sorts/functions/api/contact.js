// Cloudflare Pages Function
// Route: POST /api/contact
//
// Forwards website enquiries straight to a Telegram chat via the Telegram
// Bot API. Set these two environment variables in the Cloudflare Pages
// dashboard (Settings -> Environment variables) once the bot exists:
//
//   TELEGRAM_BOT_TOKEN   e.g. 123456789:AAExampleTokenFromBotFather
//   TELEGRAM_CHAT_ID     the numeric chat/channel ID the bot should post to
//
// Until those are set, the function responds with ok:false so the front
// end can fall back to "please call us" messaging — nothing breaks.

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const name = clean(body.name);
  const phone = clean(body.phone);
  const email = clean(body.email);
  const service = clean(body.service);
  const area = clean(body.area);
  const message = clean(body.message);

  if (!name || !phone || !service) {
    return json({ ok: false, error: 'Missing required fields.' }, 400);
  }

  // Placeholder credentials — replace in Cloudflare Pages env vars.
  const token = env.TELEGRAM_BOT_TOKEN || '';
  const chatId = env.TELEGRAM_CHAT_ID || '';

  const text = [
    '🚗 *New enquiry — Liquid All Sorts*',
    '',
    `*Name:* ${escapeMd(name)}`,
    `*Phone:* ${escapeMd(phone)}`,
    email ? `*Email:* ${escapeMd(email)}` : null,
    `*Service:* ${escapeMd(service)}`,
    area ? `*Area / Postcode:* ${escapeMd(area)}` : null,
    message ? `*Details:* ${escapeMd(message)}` : null,
  ].filter(Boolean).join('\n');

  if (!token || !chatId) {
    // Telegram not wired up yet — tell the caller clearly rather than
    // silently pretending it worked.
    return json({ ok: false, error: 'Telegram is not configured yet.' }, 200);
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!tgRes.ok) {
      return json({ ok: false, error: 'Telegram delivery failed.' }, 200);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ ok: false, error: 'Telegram delivery failed.' }, 200);
  }
}

function clean(value) {
  return typeof value === 'string' ? value.trim().slice(0, 1000) : '';
}

function escapeMd(str) {
  return str.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
