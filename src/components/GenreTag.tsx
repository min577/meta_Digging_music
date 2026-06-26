import { GENRES, GENRE_TAG, type GenreId } from "@/lib/genres";

// 디자인 가이드 장르 알약 칩 — 기울어진 둥근 태그 + 굵은 영문 라벨.
export default function GenreTag({
  genre,
  size = "md",
  tilt = true,
  className = "",
}: {
  genre: GenreId;
  size?: "sm" | "md";
  tilt?: boolean;
  className?: string;
}) {
  const g = GENRES[genre];
  const t = GENRE_TAG[genre];
  const pad = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3.5 py-1.5 text-sm";
  return (
    <span
      className={`inline-block rounded-2xl font-extrabold tracking-tight shadow-card ${pad} ${className}`}
      style={{
        background: g.color,
        color: t.ink,
        transform: tilt ? "rotate(-2.5deg)" : undefined,
      }}
    >
      {t.en}
    </span>
  );
}
