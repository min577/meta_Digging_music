"use client";

import type { Appearance, HairStyle, HatStyle } from "@/lib/appearance";

export type Dir = "down" | "up" | "left" | "right";

// 동물의 숲 느낌의 2D 입체 아바타 (페이퍼돌). 큰 머리 + 부드러운 음영으로 입체감.
export default function Avatar({
  appearance,
  size = 72,
  walking = false,
  dir = "down",
  bob = true,
}: {
  appearance: Appearance;
  size?: number;
  walking?: boolean;
  dir?: Dir;
  bob?: boolean;
}) {
  const a = appearance;
  const flip = dir === "left";
  const back = dir === "up"; // 뒤돌면 얼굴 숨김
  // SVG id에 #가 들어가면 무효 → 색에서 # 제거한 안전한 id
  const oid = `o${a.outfit.replace("#", "")}`;
  const sid = `s${a.skin.replace("#", "")}`;

  return (
    <div
      style={{
        width: size,
        height: size * 1.2,
        transform: flip ? "scaleX(-1)" : undefined,
        animation: walking
          ? "avatarWalk 0.5s ease-in-out infinite"
          : bob
          ? "avatarIdle 2.6s ease-in-out infinite"
          : undefined,
      }}
      className="relative select-none"
    >
      <svg viewBox="0 0 100 120" width={size} height={size * 1.2}>
        <defs>
          <radialGradient id={`body-${oid}`} cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor={lighten(a.outfit, 24)} />
            <stop offset="100%" stopColor={a.outfit} />
          </radialGradient>
          <radialGradient id={`head-${sid}`} cx="38%" cy="30%" r="85%">
            <stop offset="0%" stopColor={lighten(a.skin, 14)} />
            <stop offset="100%" stopColor={a.skin} />
          </radialGradient>
        </defs>

        {/* 그림자 */}
        <ellipse cx="50" cy="115" rx="24" ry="5" fill="rgba(0,0,0,0.16)" />

        {/* 다리 (걷기 시 교차) */}
        <g>
          <rect
            x="38"
            y="92"
            width="10"
            height="18"
            rx="5"
            fill={a.pants}
            style={{
              transformBox: "fill-box",
              transformOrigin: "top center",
              animation: walking ? "legL 0.5s ease-in-out infinite" : undefined,
            }}
          />
          <rect
            x="52"
            y="92"
            width="10"
            height="18"
            rx="5"
            fill={a.pants}
            style={{
              transformBox: "fill-box",
              transformOrigin: "top center",
              animation: walking ? "legR 0.5s ease-in-out infinite" : undefined,
            }}
          />
        </g>

        {/* 몸통 */}
        <rect x="30" y="66" width="40" height="34" rx="14" fill={`url(#body-${oid})`} />
        {/* 팔 */}
        <rect x="24" y="70" width="9" height="22" rx="4.5" fill={a.outfit} />
        <rect x="67" y="70" width="9" height="22" rx="4.5" fill={a.outfit} />

        {/* 뒷머리 (헤어가 머리 뒤를 감쌈) */}
        <BackHair style={a.hair} color={a.hairColor} />

        {/* 머리 */}
        <circle cx="50" cy="40" r="26" fill={`url(#head-${sid})`} />

        {/* 얼굴 (정면/측면만) */}
        {!back && (
          <g>
            <circle cx="40" cy="42" r="3.2" fill="#2A251D" />
            <circle cx="60" cy="42" r="3.2" fill="#2A251D" />
            <circle cx="40.8" cy="41" r="1" fill="#fff" />
            <circle cx="60.8" cy="41" r="1" fill="#fff" />
            <path d="M44 50 Q50 55 56 50" stroke="#2A251D" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="33" cy="48" r="3.5" fill="#ff9bb0" opacity="0.6" />
            <circle cx="67" cy="48" r="3.5" fill="#ff9bb0" opacity="0.6" />
          </g>
        )}

        {/* 앞머리 + 헤어 */}
        <FrontHair style={a.hair} color={a.hairColor} back={back} />

        {/* 모자 */}
        <Hat style={a.hat} />
      </svg>
    </div>
  );
}

function BackHair({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "long":
      return <path d="M22 36 Q22 78 32 86 L68 86 Q78 78 78 36 Z" fill={shade(color, -12)} />;
    case "ponytail":
      return <path d="M66 30 Q86 36 80 64 Q76 74 70 60 Q74 44 64 38 Z" fill={shade(color, -10)} />;
    case "bun":
      return <circle cx="50" cy="16" r="9" fill={shade(color, -8)} />;
    case "curly":
      return (
        <g fill={shade(color, -10)}>
          <circle cx="26" cy="40" r="9" />
          <circle cx="74" cy="40" r="9" />
          <circle cx="30" cy="56" r="7" />
          <circle cx="70" cy="56" r="7" />
        </g>
      );
    default:
      return null;
  }
}

function FrontHair({
  style,
  color,
  back,
}: {
  style: HairStyle;
  color: string;
  back: boolean;
}) {
  if (style === "bald") return null;
  const hi = lighten(color, 18);
  // 뒤통수일 땐 머리 전체를 덮는 캡
  if (back) return <path d="M24 40 Q24 14 50 14 Q76 14 76 40 Q76 50 72 52 L28 52 Q24 50 24 40 Z" fill={color} />;

  switch (style) {
    case "short":
      return (
        <g>
          <path d="M26 40 Q26 14 50 14 Q74 14 74 40 Q74 30 64 28 Q58 22 50 22 Q42 22 36 28 Q26 30 26 40 Z" fill={color} />
          <path d="M40 19 Q50 15 60 19" stroke={hi} strokeWidth="2" fill="none" />
        </g>
      );
    case "bob":
      return <path d="M24 44 Q24 12 50 12 Q76 12 76 44 L76 52 L66 50 Q66 30 50 28 Q34 30 34 50 L24 52 Z" fill={color} />;
    case "long":
      return <path d="M26 42 Q26 12 50 12 Q74 12 74 42 Q66 30 60 30 Q56 22 50 22 Q44 22 40 30 Q34 30 26 42 Z" fill={color} />;
    case "ponytail":
      return <path d="M28 40 Q28 14 50 14 Q72 14 72 40 Q64 28 58 28 Q54 22 50 22 Q44 22 40 30 Q32 30 28 40 Z" fill={color} />;
    case "spiky":
      return (
        <path
          d="M28 42 L32 22 L40 34 L46 18 L52 34 L58 20 L66 34 L72 24 L72 42 Q60 30 50 30 Q40 30 28 42 Z"
          fill={color}
        />
      );
    case "bun":
      return <path d="M28 40 Q28 16 50 16 Q72 16 72 40 Q62 30 50 30 Q38 30 28 40 Z" fill={color} />;
    case "curly":
      return (
        <g fill={color}>
          <circle cx="34" cy="24" r="10" />
          <circle cx="50" cy="18" r="11" />
          <circle cx="66" cy="24" r="10" />
          <circle cx="28" cy="36" r="8" />
          <circle cx="72" cy="36" r="8" />
        </g>
      );
    default:
      return null;
  }
}

function Hat({ style }: { style: HatStyle }) {
  switch (style) {
    case "cap":
      return (
        <g>
          <path d="M28 28 Q50 8 72 28 L72 32 L28 32 Z" fill="#FF5A5F" />
          <path d="M68 30 Q86 30 84 38 L70 36 Z" fill="#E0494E" />
          <circle cx="50" cy="14" r="2.5" fill="#fff" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M26 32 Q26 10 50 10 Q74 10 74 32 Z" fill="#46D8C5" />
          <rect x="26" y="30" width="48" height="6" rx="3" fill="#2FB3A2" />
          <circle cx="50" cy="9" r="4" fill="#2FB3A2" />
        </g>
      );
    case "headphones":
      return (
        <g fill="none">
          <path d="M26 42 Q26 12 50 12 Q74 12 74 42" stroke="#34495E" strokeWidth="5" />
          <rect x="20" y="38" width="11" height="16" rx="4" fill="#34495E" />
          <rect x="69" y="38" width="11" height="16" rx="4" fill="#34495E" />
          <rect x="22" y="41" width="7" height="10" rx="3" fill="#6C8AE4" />
          <rect x="71" y="41" width="7" height="10" rx="3" fill="#6C8AE4" />
        </g>
      );
    case "fedora":
      return (
        <g>
          <rect x="22" y="26" width="56" height="5" rx="2.5" fill="#4a3a2a" />
          <path d="M34 10 Q50 6 66 10 L66 27 L34 27 Z" fill="#5a4632" />
          <rect x="34" y="22" width="32" height="4" fill="#3a2d20" />
        </g>
      );
    case "flower":
      return <text x="62" y="22" fontSize="16">🌸</text>;
    default:
      return null;
  }
}

// 색 유틸
function adjust(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) + amt,
    g = ((n >> 8) & 0xff) + amt,
    b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
const lighten = (h: string, a: number) => adjust(h, a);
const shade = (h: string, a: number) => adjust(h, a);
