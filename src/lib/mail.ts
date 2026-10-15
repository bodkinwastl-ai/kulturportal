import { CultureEvent } from "./types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Notion dates come as date-only, naive datetime or with offset. The server runs in UTC,
 * so naive values are formatted as written and offset values are shown in Vienna time.
 */
function formatWhen(dateStr: string): string {
  const opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("de-DE", { ...opts, timeZone: "UTC" });
  }
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(dateStr);
  const d = new Date(hasZone ? dateStr : `${dateStr}Z`);
  const tz = hasZone ? "Europe/Vienna" : "UTC";
  const date = d.toLocaleDateString("de-DE", { ...opts, timeZone: tz });
  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: tz });
  return `${date}, ${time} Uhr`;
}

const safeUrl = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : undefined);

export function buildTip(event: CultureEvent, message?: string) {
  const when = formatWhen(event.date);
  const place = [event.venue, event.city].filter(Boolean).join(", ");
  const desc = event.description && event.description.length > 280
    ? `${event.description.slice(0, 277)}…`
    : event.description;
  const url = safeUrl(event.url);
  const note = message?.trim();

  const subject = `Tipp: ${event.title}`.replace(/\s+/g, " ");

  const text = [
    note,
    note ? "" : null,
    event.title,
    when,
    place || null,
    event.price ? `Preis: ${event.price}` : null,
    desc ? `\n${desc}` : null,
    url ? `\nMehr Infos: ${url}` : null,
    "\n– gesendet über Kulturportal",
  ].filter((l) => l !== null).join("\n");

  const html = `<!doctype html><html lang="de"><body style="margin:0;background:#faf8f4;font-family:Helvetica,Arial,sans-serif;color:#1c1917">
<div style="max-width:520px;margin:0 auto;padding:24px 16px">
${note ? `<p style="font-size:16px;line-height:1.5;margin:0 0 20px;white-space:pre-wrap">${esc(note)}</p>` : ""}
<div style="background:#fff;border:1px solid #e7e2d9;border-radius:12px;padding:20px">
<h1 style="font-family:Georgia,serif;font-size:22px;line-height:1.3;margin:0 0 8px">${esc(event.title)}</h1>
<p style="margin:0;color:#57534e;font-size:15px">${esc(when)}</p>
${place ? `<p style="margin:2px 0 0;color:#57534e;font-size:15px">${esc(place)}</p>` : ""}
${event.price ? `<p style="margin:2px 0 0;font-size:15px"><strong>${esc(event.price)}</strong></p>` : ""}
${desc ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.5">${esc(desc)}</p>` : ""}
${url ? `<p style="margin:20px 0 0"><a href="${esc(url)}" style="display:inline-block;background:#1c1917;color:#fafaf9;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:15px">Zum Event</a></p>` : ""}
</div>
<p style="color:#78716c;font-size:12px;margin:16px 0 0">Gesendet über Kulturportal</p>
</div></body></html>`;

  return { subject, text, html };
}

export class MailNotConfiguredError extends Error {}

export async function sendEventTip(to: string, event: CultureEvent, message?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new MailNotConfiguredError("Mail-Versand nicht konfiguriert (RESEND_API_KEY fehlt)");

  const { subject, text, html } = buildTip(event, message);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Kulturportal <onboarding@resend.dev>",
      to: [to],
      ...(process.env.MAIL_REPLY_TO ? { reply_to: process.env.MAIL_REPLY_TO } : {}),
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `Resend antwortete mit ${response.status}`);
  }
}
