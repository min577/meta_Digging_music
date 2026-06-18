"use client";

import { motion } from "framer-motion";
import { GENRES, type GenreId } from "@/lib/genres";

interface CharacterProps {
  genre: GenreId;
  baseType?: string;
  /** 0~3 진화 단계 — 단계가 오를수록 오라/장식 추가 */
  stage?: number;
  size?: number;
  /** BPM에 맞춰 까딱이는 idle 애니메이션 */
  animate?: boolean;
  bpm?: number;
}

// 장르별 액센트로 칠하는 큐트 블록 캐릭터(SVG). 기획서 4.3 취향 시각화.
export default function Character({
  genre,
  stage = 0,
  size = 88,
  animate = true,
  bpm,
}: CharacterProps) {
  const g = GENRES[genre];
  const beat = bpm ?? g.bpm;
  // BPM -> 한 박자 길이(초). 까딱 주기를 박자에 맞춤.
  const cycle = Math.max(0.3, 60 / beat);
  const body = g.color;

  return (
    <motion.div
      style={{ width: size, height: size }}
      className="relative select-none"
      animate={animate ? { y: [0, -size * 0.06, 0] } : undefined}
      transition={
        animate
          ? { duration: cycle, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
      aria-label={`${g.label} 캐릭터`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* 그림자 */}
        <ellipse cx="50" cy="92" rx="22" ry="5" fill="rgba(0,0,0,0.18)" />

        {/* 진화 오라 */}
        {stage >= 2 && (
          <circle
            cx="50"
            cy="52"
            r="40"
            fill="none"
            stroke={body}
            strokeOpacity="0.25"
            strokeWidth={stage >= 3 ? 4 : 2}
          />
        )}

        {/* 몸통 */}
        <rect x="34" y="50" width="32" height="34" rx="9" fill={body} />
        {/* 다리 */}
        <rect x="38" y="80" width="9" height="10" rx="3" fill={shade(body, -18)} />
        <rect x="53" y="80" width="9" height="10" rx="3" fill={shade(body, -18)} />
        {/* 머리 */}
        <rect x="32" y="22" width="36" height="34" rx="12" fill={shade(body, 18)} />
        {/* 볼터치 */}
        <circle cx="40" cy="44" r="3" fill="#ff9bb0" opacity="0.7" />
        <circle cx="60" cy="44" r="3" fill="#ff9bb0" opacity="0.7" />
        {/* 눈 */}
        <circle cx="43" cy="38" r="3" fill="#2A251D" />
        <circle cx="57" cy="38" r="3" fill="#2A251D" />

        {/* 장르별 액세서리 */}
        <Accessory genre={genre} />

        {/* 진화 단계별 별 */}
        {stage >= 1 &&
          Array.from({ length: stage }).map((_, i) => (
            <text
              key={i}
              x={36 + i * 10}
              y={18}
              fontSize="9"
              fill={body}
            >
              ★
            </text>
          ))}
      </svg>
    </motion.div>
  );
}

function Accessory({ genre }: { genre: GenreId }) {
  switch (genre) {
    case "kpop": // 글리터 하트 + 반짝
      return (
        <g>
          <text x="22" y="24" fontSize="10">💖</text>
          <text x="68" y="20" fontSize="8">✨</text>
        </g>
      );
    case "hiphop": // 스냅백 + 골드체인
      return (
        <g>
          <path d="M28 26 Q50 8 72 26 L72 30 L28 30 Z" fill="#1c1c24" />
          <path d="M68 28 Q84 27 82 34 L70 33 Z" fill="#1c1c24" />
          <rect x="30" y="22" width="40" height="3" fill="#F0A93A" />
          <path d="M40 58 Q50 66 60 58" stroke="#F0A93A" strokeWidth="2.4" fill="none" />
        </g>
      );
    case "rnb": // 무드등 + 칵테일
      return <text x="66" y="22" fontSize="11">🍸</text>;
    case "ballad": // 스탠드 마이크 + 스포트라이트
      return (
        <g>
          <path d="M30 8 L70 8 L60 20 L40 20 Z" fill="#ffe9a8" opacity="0.4" />
          <circle cx="32" cy="40" r="4" fill="#2A251D" />
          <rect x="31" y="40" width="2" height="16" fill="#555" />
        </g>
      );
    case "indie": // 어쿠스틱 기타 헤드 + 비니톤
      return (
        <g>
          <rect x="64" y="40" width="6" height="20" rx="2" fill="#9a6b3c" transform="rotate(18 67 50)" />
          <circle cx="70" cy="58" r="6" fill="#b5824a" transform="rotate(18 70 58)" />
          <path d="M30 30 Q50 16 70 30" stroke="#5BB073" strokeWidth="2" fill="none" opacity="0.7" />
        </g>
      );
    case "pop": // 헤드폰 + 별
      return (
        <g>
          <path d="M30 38 Q30 18 50 18 Q70 18 70 38" stroke="#FF8A5B" strokeWidth="4" fill="none" />
          <rect x="26" y="36" width="8" height="12" rx="3" fill="#FF8A5B" />
          <rect x="66" y="36" width="8" height="12" rx="3" fill="#FF8A5B" />
          <text x="68" y="18" fontSize="8">✨</text>
        </g>
      );
    case "edm": // 디스코 형광
      return (
        <g>
          <circle cx="50" cy="12" r="6" fill="#46D8C5" />
          <circle cx="50" cy="12" r="6" fill="none" stroke="#fff" strokeOpacity="0.6" />
          <line x1="50" y1="18" x2="50" y2="22" stroke="#46D8C5" strokeWidth="2" />
        </g>
      );
    case "citypop": // 선글라스 + 네온
      return (
        <g>
          <rect x="36" y="34" width="11" height="7" rx="2" fill="#1a1a2e" />
          <rect x="53" y="34" width="11" height="7" rx="2" fill="#1a1a2e" />
          <rect x="47" y="36" width="6" height="2" fill="#1a1a2e" />
          <rect x="30" y="6" width="40" height="3" rx="1.5" fill="#FF6EC7" opacity="0.8" />
        </g>
      );
    default:
      return null;
  }
}

// hex 밝기 조절
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) + amt;
  let gg = ((n >> 8) & 0xff) + amt;
  let b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  gg = Math.max(0, Math.min(255, gg));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (gg << 8) | b).toString(16).padStart(6, "0")}`;
}
