import type { GenreId } from "@/lib/genres";

// 장르별 라인 아이콘 (이모지 대체). Icon.tsx와 동일한 라인 스타일.
const PATHS: Record<GenreId, React.ReactNode> = {
  // 마이크 (보컬/아이돌)
  kpop: (
    <>
      <rect x="9.2" y="2.5" width="5.6" height="11" rx="2.8" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V21M8.5 21h7" />
    </>
  ),
  // 캡 모자
  hiphop: (
    <>
      <path d="M5 14a7 7 0 0 1 14 0H5Z" />
      <path d="M19 14h2.4a.6.6 0 0 1 .2 1.16L18 16.6" />
    </>
  ),
  // 하트 (감성)
  rnb: <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />,
  // 음표 (발라드)
  ballad: (
    <>
      <circle cx="7.5" cy="17.5" r="2.6" />
      <path d="M10.1 17.5V5l6.4 2.3" />
      <path d="M16.5 7.3c1.5.6 2.1 1.9 1.6 3.4" />
    </>
  ),
  // 기타 (인디)
  indie: (
    <>
      <circle cx="8" cy="16" r="4.6" />
      <circle cx="8" cy="16" r="1.3" />
      <path d="M11.3 12.7 16.5 7.5" />
      <path d="M15.7 6.7l2 2-1.3 1.3-2-2z" />
    </>
  ),
  // 별 (팝)
  pop: <path d="m12 3 2.4 6.2 6.6.3-5.2 4.1 1.8 6.4L12 16.7 6.6 20.3l1.8-6.4L3.2 9.5l6.6-.3L12 3Z" />,
  // 번개 (EDM)
  edm: <path d="M13 2 5 13h5.5l-1 9 8.5-11.5H12l1-8.5Z" />,
  // 도시 스카이라인 (시티팝)
  citypop: (
    <>
      <path d="M3 21V9.5l4-2v13.5M9 21V5l5-2.5V21M16 21v-9.5l5 2V21" />
      <path d="M2.5 21h19" />
    </>
  ),
};

export default function GenreIcon({
  genre,
  size = 18,
  className,
  strokeWidth = 1.9,
}: {
  genre: GenreId;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[genre] ?? PATHS.pop}
    </svg>
  );
}
