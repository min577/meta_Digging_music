// 깔끔한 라인 SVG 아이콘 (이모지 대체). stroke=currentColor.
export type IconName =
  | "home" | "shop" | "friends" | "user" | "music" | "search" | "plus"
  | "back" | "trophy" | "sparkle" | "heart" | "play" | "headphones"
  | "pin" | "coin" | "gem" | "settings" | "x" | "compass" | "build" | "chat" | "target" | "quest";

const P: Record<IconName, React.ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />,
  shop: <><path d="M4 8h16l-1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L4 8Z" /><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" /></>,
  friends: <><circle cx="9" cy="9" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 6.5a3 3 0 0 1 0 5.8M20.5 20a5.5 5.5 0 0 0-4-5.3" /></>,
  chat: <path d="M4 5h16v11H8l-4 3.5V5Z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  music: <><circle cx="7" cy="18" r="2.6" /><circle cx="18" cy="16" r="2.6" /><path d="M9.6 18V6l11-2v12" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.6-3.6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="M15 5 8 12l7 7" />,
  trophy: <><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 20h6M12 14v6" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />,
  heart: <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />,
  play: <path d="M8 5v14l11-7L8 5Z" />,
  headphones: <><path d="M5 14v-2a7 7 0 0 1 14 0v2" /><rect x="3.5" y="13" width="4" height="7" rx="1.5" /><rect x="16.5" y="13" width="4" height="7" rx="1.5" /></>,
  pin: <><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  coin: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 9.5h3.5a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3h4" /></>,
  gem: <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  build: <path d="M14 4l6 6-9 9-6 1 1-6 8-8Zm-2 2 4 4" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  quest: <><path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4Z" /><path d="M9 9h6M9 13h6M9 17h3" /></>,
};

export default function Icon({
  name,
  size = 22,
  className,
  strokeWidth = 1.9,
  fill = "none",
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  fill?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {P[name]}
    </svg>
  );
}
