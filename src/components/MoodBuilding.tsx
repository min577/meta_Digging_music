"use client";

import { motion } from "framer-motion";
import { GENRES, type GenreId } from "@/lib/genres";

// Focustown의 National Library / Focus Plane 처럼, 무드 공간을 표현하는 아기자기한 건물 일러스트.
// 장르 색을 기반으로 한 단순화된 아이소메트릭 건물.
export default function MoodBuilding({
  genre,
  emoji,
  size = 120,
  float = true,
}: {
  genre: GenreId;
  emoji: string;
  size?: number;
  float?: boolean;
}) {
  const g = GENRES[genre];
  return (
    <motion.div
      style={{ width: size, height: size }}
      className="relative"
      animate={float ? { y: [0, -6, 0] } : undefined}
      transition={float ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <linearGradient id={`sky-${genre}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={g.bg[0]} />
            <stop offset="100%" stopColor={g.bg[1]} />
          </linearGradient>
        </defs>

        {/* 그림자 */}
        <ellipse cx="60" cy="106" rx="40" ry="7" fill="rgba(0,0,0,0.15)" />

        {/* 지면 */}
        <path d="M16 92 L60 70 L104 92 L60 114 Z" fill="#d9c9a6" />
        {/* 건물 좌면 */}
        <path d="M30 50 L60 66 L60 98 L30 84 Z" fill={g.bg[0]} />
        {/* 건물 우면 */}
        <path d="M90 50 L60 66 L60 98 L90 84 Z" fill={g.bg[1]} />
        {/* 지붕 */}
        <path d="M30 50 L60 36 L90 50 L60 64 Z" fill={g.color} />

        {/* 창문 (좌) */}
        <rect x="36" y="60" width="6" height="8" rx="1" fill="#ffe9a8" opacity="0.9" />
        <rect x="46" y="65" width="6" height="8" rx="1" fill="#ffe9a8" opacity="0.9" />
        {/* 창문 (우) */}
        <rect x="68" y="65" width="6" height="8" rx="1" fill="#fff2c2" opacity="0.85" />
        <rect x="78" y="60" width="6" height="8" rx="1" fill="#fff2c2" opacity="0.85" />

        {/* 깃발/사인 */}
        <circle cx="60" cy="34" r="3" fill={g.color} />
      </svg>
      {/* 무드 이모지 배지 */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 text-2xl"
        style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }}
      >
        {emoji}
      </div>
    </motion.div>
  );
}
