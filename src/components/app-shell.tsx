"use client";

import { Calendar, List, AlertCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Badge } from "./ui/badge";

interface AppShellProps {
  children: ReactNode;
  notionConnected?: boolean;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Überblick & Statistiken"
  },
  {
    name: "Events",
    href: "/events", 
    icon: Calendar,
    description: "Alle Veranstaltungen"
  },
  {
    name: "Quellen",
    href: "/sources",
    icon: List,
    description: "Datenquellen verwalten"
  },
];

export function AppShell({ children, notionConnected = false }: AppShellProps) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="enterprise-header border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              {/* Logo/Title */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Kultur Portal
                  </h1>
                  <p className="text-xs text-blue-200 leading-none">
                    Enterprise Dashboard
                  </p>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative group",
                        isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-blue-100 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {item.description}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Status & Info */}
            <div className="flex items-center space-x-4">
              {/* Notion Connection Status */}
              <Badge 
                variant={notionConnected ? "default" : "secondary"}
                className={cn(
                  "text-xs font-medium",
                  notionConnected 
                    ? "bg-green-600 hover:bg-green-700 text-white border-0" 
                    : "bg-amber-600 hover:bg-amber-700 text-white border-0"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  notionConnected ? "bg-green-200" : "bg-amber-200"
                )} />
                {notionConnected ? "Notion Live" : "Mock Daten"}
              </Badge>
              
              {/* Build Info */}
              <div className="text-xs text-blue-200 font-medium">
                v0.1.0
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-blue-800/30">
          <div className="px-4 py-3">
            <div className="flex space-x-2 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-blue-100 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      {/* Professional Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Kulturportal v0.1.0</span>
              <span>•</span>
              <span>Build {new Date().toLocaleDateString('de-DE')}</span>
              <span>•</span>
              <span>Austria Culture Radar</span>
            </div>
            <div className="flex items-center space-x-2">
              {notionConnected ? (
                <span className="text-green-600 font-medium">Notion Connected ✓</span>
              ) : (
                <span className="text-amber-600 font-medium">Fallback Mode</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}