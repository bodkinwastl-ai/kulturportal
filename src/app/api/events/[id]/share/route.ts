import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/notion";
import { sendEventTip, MailNotConfiguredError } from "@/lib/mail";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort per server instance; the proxy's Basic Auth is the real gate.
const sent: number[] = [];
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const to = typeof body.to === "string" ? body.to.trim() : "";
  const message = typeof body.message === "string" ? body.message : "";

  if (to.length > 254 || !EMAIL.test(to)) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: "Nachricht ist zu lang (max. 1000 Zeichen)" }, { status: 400 });
  }

  const now = Date.now();
  while (sent.length && now - sent[0] > WINDOW_MS) sent.shift();
  if (sent.length >= LIMIT) {
    return NextResponse.json({ error: "Zu viele Mails in der letzten Stunde" }, { status: 429 });
  }

  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event nicht gefunden" }, { status: 404 });

  try {
    await sendEventTip(to, event, message);
    sent.push(now);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MailNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Mail error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Mail konnte nicht gesendet werden" },
      { status: 502 }
    );
  }
}
