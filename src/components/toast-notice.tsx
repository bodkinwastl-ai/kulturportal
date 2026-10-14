"use client";

import { useEffect } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { Notice } from "@/lib/use-events";
import { cn } from "@/lib/utils";

export function ToastNotice({ notice, onDismiss }: { notice: Notice | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(onDismiss, notice.kind === "error" ? 10000 : 6000);
    return () => clearTimeout(t);
  }, [notice, onDismiss]);

  if (!notice) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6">
      <div
        role={notice.kind === "error" ? "alert" : "status"}
        className={cn(
          "pointer-events-auto flex max-w-md items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg",
          notice.kind === "error" ? "bg-red-700 text-white" : "bg-primary text-primary-foreground"
        )}
      >
        {notice.kind === "error" ? (
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span className="min-w-0">{notice.message}</span>
        {notice.undo && (
          <button
            type="button"
            onClick={() => {
              notice.undo?.();
              onDismiss();
            }}
            className="shrink-0 font-semibold underline underline-offset-4"
          >
            Rückgängig
          </button>
        )}
        <button type="button" onClick={onDismiss} aria-label="Schließen" className="shrink-0 opacity-80 hover:opacity-100">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
