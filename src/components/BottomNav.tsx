"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabId = "world" | "home" | "friends" | "shop" | "user";
const TABS: { href: string; label: string; icon: TabId }[] = [
  { href: "/world", label: "월드", icon: "world" },
  { href: "/friends", label: "친구", icon: "friends" },
  { href: "/home", label: "홈", icon: "home" },
  { href: "/shop", label: "상점", icon: "shop" },
  { href: "/profile", label: "마이", icon: "user" },
];

// 큐트한 filled 아이콘 (마스코트 톤). currentColor로 색 상속.
function NavIcon({ name, size = 24 }: { name: TabId; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
      {name === "world" && (
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8ZM12.1 7l2.6 4.4-2.6 5.2-2.6-5.2Z" />
      )}
      {name === "home" && (
        <path d="M12 3.5a1.5 1.5 0 0 0-1 .35L3.8 10.1A1.4 1.4 0 0 0 3.3 11.2V19a1.8 1.8 0 0 0 1.8 1.8H9V15.4A1.4 1.4 0 0 1 10.4 14h3.2A1.4 1.4 0 0 1 15 15.4v5.4h3.9A1.8 1.8 0 0 0 20.7 19v-7.8a1.4 1.4 0 0 0-.5-1.1L13 3.85A1.5 1.5 0 0 0 12 3.5Z" />
      )}
      {name === "friends" && (
        <g>
          <circle cx="8.3" cy="9" r="3.3" />
          <path d="M2.4 19.5a5.9 5.9 0 0 1 11.8 0 1.1 1.1 0 0 1-1.1 1.1H3.5a1.1 1.1 0 0 1-1.1-1.1Z" />
          <circle cx="16.6" cy="8" r="2.8" />
          <path d="M15.4 12.1a6 6 0 0 1 6.2 6.4 1 1 0 0 1-1 .9H16.6a7.3 7.3 0 0 0-2-6.7 6 6 0 0 1 .8-.6Z" />
        </g>
      )}
      {name === "shop" && (
        <g>
          <path d="M9 7V6.2a3 3 0 0 1 6 0V7" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M5.6 8h12.8a1 1 0 0 1 1 1.1l-.8 10.1A1.8 1.8 0 0 1 16.8 20.9H7.2a1.8 1.8 0 0 1-1.8-1.7L4.6 9.1A1 1 0 0 1 5.6 8Z" />
        </g>
      )}
      {name === "user" && (
        <g>
          <circle cx="12" cy="8" r="4.2" />
          <path d="M4.3 20.4a7.7 7.7 0 0 1 15.4 0 1 1 0 0 1-1 1.1H5.3a1 1 0 0 1-1-1.1Z" />
        </g>
      )}
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/room/")) return null;

  return (
    <nav className="shrink-0 w-full z-40">
      <div className="mx-3 mb-3 rounded-[28px] bg-cream-50/95 backdrop-blur border border-cream-200 shadow-card px-2 py-2 flex justify-around">
        {TABS.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-colors ${
                active ? "bg-brand/10" : ""
              }`}
            >
              <span className={active ? "text-brand-dark" : "text-ink-700/35"}>
                <NavIcon name={t.icon} size={active ? 25 : 23} />
              </span>
              <span
                className={`text-[11px] font-extrabold tracking-tight ${
                  active ? "text-brand-dark" : "text-ink-700/40"
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
