"use client";

import { useId, useState } from "react";
import { CultureEvent } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Check, Loader2, Send } from "lucide-react";

const RECENT_KEY = "kulturportal.recentRecipients";

function loadRecent(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

interface ShareEventFormProps {
  event: CultureEvent;
  /** Called after a successful send so the recipient can be tracked as invited. */
  onInvited: (invitees: string) => void;
}

/** Compact: one row (address + send) is always visible; message is optional. */
export function ShareEventForm({ event, onInvited }: ShareEventFormProps) {
  const id = useId();
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [addInvitee, setAddInvitee] = useState(true);
  const [state, setState] = useState<{ kind: "idle" | "sending" | "ok" | "error"; text?: string }>({ kind: "idle" });
  const [recent, setRecent] = useState<string[]>(() => (typeof window === "undefined" ? [] : loadRecent()));

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = to.trim();
    setState({ kind: "sending" });
    try {
      const response = await fetch(`/api/events/${event.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: address, message }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Fehler ${response.status}`);

      const next = [address, ...recent.filter((r) => r !== address)].slice(0, 6);
      setRecent(next);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}

      if (addInvitee) {
        const current = (event.invitees || "").split(",").map((s) => s.trim()).filter(Boolean);
        if (!current.includes(address)) onInvited([...current, address].join(", "));
      }
      setState({ kind: "ok", text: `Mail an ${address} gesendet` });
      setTo("");
      setMessage("");
      setShowMessage(false);
    } catch (error) {
      setState({ kind: "error", text: error instanceof Error ? error.message : "Senden fehlgeschlagen" });
    }
  };

  return (
    <form onSubmit={send} className="space-y-2">
      <label htmlFor={`${id}-to`} className="text-sm font-medium text-foreground">
        Per Mail weiterleiten
      </label>
      <div className="flex gap-2">
        <Input
          id={`${id}-to`}
          type="email"
          required
          autoComplete="email"
          list={id}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="name@beispiel.at"
          className="min-w-0 flex-1"
        />
        <datalist id={id}>
          {recent.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
        <Button type="submit" disabled={state.kind === "sending"} className="shrink-0">
          {state.kind === "sending" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Senden
        </Button>
      </div>

      {showMessage ? (
        <Textarea
          aria-label="Persönliche Nachricht"
          value={message}
          maxLength={1000}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Persönliche Nachricht (optional)"
          rows={2}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowMessage(true)}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Nachricht hinzufügen
        </button>
      )}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={addInvitee} onChange={(e) => setAddInvitee(e.target.checked)} className="h-4 w-4" />
        Zu Einladungen hinzufügen
      </label>

      <div aria-live="polite">
        {state.kind === "ok" && (
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <Check className="h-4 w-4" aria-hidden="true" />
            {state.text}
          </p>
        )}
        {state.kind === "error" && <p className="text-sm text-red-700">Senden fehlgeschlagen: {state.text}</p>}
      </div>
    </form>
  );
}
