import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col justify-between">
      {/* Top Minimal Clinical Header */}
      <header className="border-b border-primary px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-xs uppercase font-bold tracking-widest text-foreground hover:opacity-75 transition-opacity"
          >
            CLINICARE
          </Link>
          <span className="text-neutral-border">/</span>
          <span className="text-xs font-mono text-text-muted">SECURE GATEWAY</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
          <Lock className="size-3 text-foreground" />
          <span>TLS 1.3 ENCRYPTED</span>
        </div>
      </header>

      {/* Centered Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="border-t border-neutral-border px-4 py-3 sm:px-6 flex items-center justify-between text-[11px] font-mono text-text-muted">
        <span>CLINICARE PRACTICE MANAGEMENT SYSTEM</span>
        <span>AUDITED CLINICAL ENCRYPTED SESSION</span>
      </footer>
    </div>
  );
}
