import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#141618] selection:bg-[#141618] selection:text-[#FAFAF7] flex flex-col justify-between">
      {/* Top Minimal Clinical Header */}
      <header className="border-b border-[#141618] px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-xs uppercase font-bold tracking-widest text-[#141618] hover:opacity-75 transition-opacity"
          >
            CLINICARE
          </Link>
          <span className="text-[#D8D4CC]">/</span>
          <span className="text-xs font-mono text-[#5A5D61]">SECURE GATEWAY</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#5A5D61]">
          <Lock className="size-3 text-[#141618]" />
          <span>TLS 1.3 ENCRYPTED</span>
        </div>
      </header>

      {/* Centered Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="border-t border-[#D8D4CC] px-4 py-3 sm:px-6 flex items-center justify-between text-[11px] font-mono text-[#5A5D61]">
        <span>CLINICARE PRACTICE MANAGEMENT SYSTEM</span>
        <span>AUDITED CLINICAL ENCRYPTED SESSION</span>
      </footer>
    </div>
  );
}
