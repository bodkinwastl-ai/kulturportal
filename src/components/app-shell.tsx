"use client";

import { Calendar, CalendarDays, List, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  notionConnected?: boolean;
}

const navigation = [
  { name: "Übersicht", href: "/", icon: LayoutDashboard },
  { name: "Woche", href: "/week", icon: CalendarDays },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Quellen", href: "/sources", icon: List },
];

export function AppShell({ children, notionConnected = false }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display text-xl font-semibold tracking-tight text-foreground">
              Kulturportal
            </Link>

            <nav aria-label="Hauptnavigation" className="hidden md:flex md:gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
              notionConnected
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                : "bg-amber-50 text-amber-900 ring-amber-200"
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", notionConnected ? "bg-emerald-600" : "bg-amber-600")}
              aria-hidden="true"
            />
            {notionConnected ? "Notion live" : "Demo-Daten"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>

      <footer className="mt-12 hidden border-t border-border md:block">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          Kulturportal · Austria Culture Radar
          {!notionConnected && " · Notion nicht verbunden, es werden Demo-Daten gezeigt"}
        </div>
      </footer>

      {/* Mobile: bottom navigation (3 items, thumb reach) */}
      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                    isActive ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
