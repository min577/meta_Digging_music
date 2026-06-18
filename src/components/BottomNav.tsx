"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "홈", icon: "home" },
  { href: "/charts", label: "차트", icon: "music" },
  { href: "/friends", label: "친구", icon: "friends" },
  { href: "/shop", label: "상점", icon: "shop" },
  { href: "/profile", label: "프로필", icon: "user" },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/room/")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40">
      <div className="mx-3 mb-3 rounded-[26px] bg-cream-50/95 backdrop-blur border border-cream-200 shadow-card px-2 py-1.5 flex justify-around">
        {TABS.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl transition-colors"
            >
              {active && (
                <span className="absolute -top-0.5 h-1 w-6 rounded-full bg-brand" />
              )}
              <Icon
                name={t.icon}
                size={23}
                strokeWidth={active ? 2.3 : 1.9}
                className={active ? "text-brand-dark" : "text-ink-700/45"}
              />
              <span
                className={`text-[11px] font-bold ${
                  active ? "text-brand-dark" : "text-ink-700/45"
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
