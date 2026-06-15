"use client";

import { useAppStore } from "@/store/useAppStore";

export default function TopBar({ title, sub }: { title: string; sub?: string }) {
  const user = useAppStore((s) => s.user);
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
        {sub && <p className="text-sm text-ink-700/55 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="chip bg-cream-100 border border-cream-200 text-ink-800 flex items-center gap-1">
          🪙 {user?.coins ?? 0}
        </span>
        <span className="chip bg-cream-100 border border-cream-200 text-ink-800 flex items-center gap-1">
          💎 {user?.diggPoints ?? 0}
        </span>
      </div>
    </header>
  );
}
