"use client";

import { useAppStore } from "@/store/useAppStore";
import Icon from "./Icon";

export default function TopBar({ title, sub }: { title: string; sub?: string }) {
  const user = useAppStore((s) => s.user);
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight font-extrabold text-ink-900 tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-ink-700/55 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 border border-cream-200 text-ink-800 text-xs font-bold px-2.5 py-1.5">
          <Icon name="coin" size={15} className="text-amber-500" /> {user?.coins ?? 0}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 border border-cream-200 text-ink-800 text-xs font-bold px-2.5 py-1.5">
          <Icon name="gem" size={14} className="text-brand" fill="currentColor" /> {user?.diggPoints ?? 0}
        </span>
      </div>
    </header>
  );
}
