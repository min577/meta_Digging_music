import { GENRES, GENRE_TAG, type GenreId } from "@/lib/genres";

// 디자인 가이드 장르 알약 칩 — 둥근 pill, 일정한 높이/굵기. tilt는 단독 전시용.
export default function GenreTag({
  genre,
  size = "md",
  tilt = false,
  className = "",
}: {
  genre: GenreId;
  size?: "sm" | "md";
  tilt?: boolean;
  className?: string;
}) {
  const g = GENRES[genre];
  const t = GENRE_TAG[genre];
  const pad =
    size === "sm"
      ? "h-6 px-3 text-[11px]"
      : "h-8 px-4 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-extrabold tracking-tight leading-none whitespace-nowrap ${pad} ${className}`}
      style={{
        background: g.color,
        color: t.ink,
        transform: tilt ? "rotate(-2deg)" : undefined,
      }}
    >
      {t.en}
    </span>
  );
}
