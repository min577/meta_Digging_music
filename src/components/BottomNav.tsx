"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "홈", icon: "🏠" },
  { href: "/shop", label: "상점", icon: "🛍️" },
  { href: "/friends", label: "친구", icon: "💬" },
  { href: "/profile", label: "프로필", icon: "🙂" },
];

export default function BottomNav() {
  const pathname = usePathname();
  // 룸 화면에서는 몰입을 위해 탭 숨김
  if (pathname?.startsWith("/room/")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40">
      <div className="mx-3 mb-3 rounded-3xl bg-cream-50/95 backdrop-blur border border-cream-200 shadow-card px-2 py-2 flex justify-around">
        {TABS.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition ${
                active ? "bg-brand/10" : ""
              }`}
            >
              <span className={`text-xl ${active ? "" : "opacity-50 grayscale"}`}>
                {t.icon}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  active ? "text-brand-dark" : "text-ink-700/50"
                }`}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
