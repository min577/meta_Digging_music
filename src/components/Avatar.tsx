"use client";

import type { Appearance, FaceStyle, HatStyle, GlassesStyle } from "@/lib/appearance";

export type Dir = "down" | "up" | "left" | "right";

// 디깅타운 마스코트 "Bean"의 2D 버전 — 3D BeanAvatar3D와 동일 디자인.
// 본체=outfit · 목도리=pants · 안테나=hairColor · 표정=face. 모자/안경=상점 악세서리.
export default function Avatar({
  appearance,
  size = 72,
  walking = false,
  dir = "down",
  bob = true,
  aura,
}: {
  appearance: Appearance;
  size?: number;
  walking?: boolean;
  dir?: Dir;
  bob?: boolean;
  /** 발밑 취향 오라 색 (대표 장르) — 주면 부드러운 글로우를 깔아준다 */
  aura?: string;
}) {
  const a = appearance;
  const flip = dir === "left";
  const body = a.outfit || "#6C8AE4";
  const belly = lighten(body, 28);
  const foot = shade(body, -34);
  const arm = shade(body, -8);
  const scarf = a.pants || "#3E4A5E";
  const accent = a.hairColor || "#FF6EC7";

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
      aria-label="아바타"
    >
      <svg viewBox="0 0 100 120" width={size} height={size * 1.2}>
        {/* 발밑 취향 오라 (대표 장르 색) */}
        {aura && (
          <g>
            <ellipse cx="50" cy="110" rx="34" ry="11" fill={aura} opacity="0.18" />
            <ellipse cx="50" cy="110" rx="24" ry="7.5" fill={aura} opacity="0.28" />
          </g>
        )}
        {/* 그림자 */}
        <ellipse cx="50" cy="114" rx="22" ry="5" fill="rgba(0,0,0,0.18)" />

        {/* 안테나 (시그니처) */}
        <line x1="55" y1="26" x2="60" y2="11" stroke={shade(body, -20)} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="61" cy="9" r="4.4" fill={accent} />
        <circle cx="59.4" cy="7.4" r="1.3" fill="#fff" opacity="0.7" />

        {/* 발 */}
        <ellipse cx="39" cy="105" rx="8" ry="7" fill={foot} />
        <ellipse cx="61" cy="105" rx="8" ry="7" fill={foot} />
        {/* 팔 */}
        <ellipse cx="20" cy="72" rx="7" ry="8.5" fill={arm} />
        <ellipse cx="80" cy="72" rx="7" ry="8.5" fill={arm} />

        {/* 본체 (젤리빈) */}
        <ellipse cx="50" cy="64" rx="30" ry="40" fill={body} />
        {/* 배 패치 */}
        <ellipse cx="50" cy="82" rx="17" ry="19" fill={belly} />
        {/* 림 하이라이트 */}
        <ellipse cx="37" cy="46" rx="9" ry="12" fill="#fff" opacity="0.15" />

        {/* 목도리 (액센트) */}
        <path d="M25 58 Q50 70 75 58 L75 66 Q50 78 25 66 Z" fill={scarf} />
        <path d="M71 63 l7 15 l-8 -3 z" fill={shade(scarf, -16)} />

        {/* 얼굴 */}
        <BeanFace face={a.face} />

        {/* 안경 (상점 악세서리) */}
        <Glasses kind={a.glasses} />
        {/* 모자 (상점 악세서리) — 안테나 위/머리 위 */}
        <Hat kind={a.hat} accent={accent} />
      </svg>
    </div>
  );
}

// 머리 위(본체 상단 y≈24) 악세서리
function Hat({ kind, accent }: { kind: HatStyle; accent: string }) {
  switch (kind) {
    case "cap":
      return (
        <g>
          <path d="M33 26 Q50 8 67 26 Z" fill="#ff5a5f" />
          <path d="M33 26 Q50 18 67 26 L67 28 L33 28 Z" fill="#e0494e" />
          <path d="M62 27 Q78 26 76 32 L64 31 Z" fill="#e0494e" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M32 27 Q50 6 68 27 Z" fill="#46d8c5" />
          <rect x="32" y="25" width="36" height="5" rx="2.5" fill="#2fb6a5" />
          <circle cx="50" cy="9" r="3.5" fill="#eafffb" />
        </g>
      );
    case "headphones":
      return (
        <g>
          <path d="M28 30 Q28 9 50 9 Q72 9 72 30" stroke="#C99A2E" strokeWidth="4" fill="none" />
          <rect x="23" y="28" width="9" height="13" rx="3" fill="#F2C14E" />
          <rect x="68" y="28" width="9" height="13" rx="3" fill="#F2C14E" />
        </g>
      );
    case "fedora":
      return (
        <g>
          <ellipse cx="50" cy="27" rx="22" ry="5" fill="#4a3a2a" />
          <path d="M38 27 Q38 12 50 12 Q62 12 62 27 Z" fill="#5a4632" />
          <rect x="38" y="22" width="24" height="3.5" fill="#33271b" />
        </g>
      );
    case "flower":
      return (
        <g transform="translate(70,18)">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={Math.cos((i / 5) * Math.PI * 2) * 4} cy={Math.sin((i / 5) * Math.PI * 2) * 4} r="3" fill="#ff6ec7" />
          ))}
          <circle cx="0" cy="0" r="2.4" fill="#ffd23a" />
        </g>
      );
    case "crown":
      return (
        <g>
          <path d="M34 26 L37 13 L44 21 L50 10 L56 21 L63 13 L66 26 Z" fill="#ffd23a" stroke="#e6ad17" strokeWidth="1" />
          <circle cx="50" cy="14" r="2" fill="#ff5a8a" />
          <circle cx="38" cy="15" r="1.6" fill="#5bd2ff" />
          <circle cx="62" cy="15" r="1.6" fill="#5bd2ff" />
        </g>
      );
    case "party":
      return (
        <g>
          <path d="M50 4 L60 27 L40 27 Z" fill={accent} />
          <path d="M50 4 L55 15.5 L45 15.5 Z" fill="#fff" opacity="0.4" />
          <circle cx="50" cy="4" r="3" fill="#ffd23a" />
          <circle cx="45" cy="20" r="1.6" fill="#fff" />
          <circle cx="55" cy="22" r="1.6" fill="#fff" />
        </g>
      );
    default:
      return null;
  }
}

// 눈(cx40/60, cy48) 위 안경
function Glasses({ kind }: { kind: GlassesStyle }) {
  switch (kind) {
    case "round":
      return (
        <g stroke="#3a2d20" strokeWidth="1.8" fill="none">
          <circle cx="40" cy="48" r="6" />
          <circle cx="60" cy="48" r="6" />
          <path d="M46 47 Q50 45 54 47" />
        </g>
      );
    case "sun":
      return (
        <g>
          <rect x="33" y="44" width="13" height="8.5" rx="3" fill="#16161e" />
          <rect x="54" y="44" width="13" height="8.5" rx="3" fill="#16161e" />
          <rect x="46" y="46" width="8" height="2.4" fill="#16161e" />
        </g>
      );
    case "star":
      return (
        <g fill="#ffd23a" stroke="#e6ad17" strokeWidth="0.6">
          <text x="35" y="52" fontSize="11">⭐</text>
          <text x="55" y="52" fontSize="11">⭐</text>
        </g>
      );
    case "heart":
      return (
        <g>
          <text x="34" y="53" fontSize="11">💗</text>
          <text x="54" y="53" fontSize="11">💗</text>
        </g>
      );
    default:
      return null;
  }
}

function BeanFace({ face }: { face: FaceStyle }) {
  const blush = (
    <>
      <circle cx="29" cy="55" r="3.6" fill="#ff9bb0" opacity="0.5" />
      <circle cx="71" cy="55" r="3.6" fill="#ff9bb0" opacity="0.5" />
    </>
  );
  const roundEye = (x: number) => (
    <g>
      <ellipse cx={x} cy="48" rx="5" ry="6.6" fill="#241d1a" />
      <circle cx={x - 1.8} cy="45" r="1.7" fill="#fff" />
      <circle cx={x + 1.4} cy="50" r="0.8" fill="#fff" opacity="0.8" />
    </g>
  );
  switch (face) {
    case "happy":
      return (
        <g>
          <path d="M33 49 Q39 43 45 49" stroke="#241d1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M55 49 Q61 43 67 49" stroke="#241d1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M42 56 Q50 64 58 56" stroke="#3a2d27" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {blush}
        </g>
      );
    case "wink":
      return (
        <g>
          {roundEye(40)}
          <path d="M55 49 Q61 45 67 49" stroke="#241d1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M44 57 Q50 61 56 56" stroke="#3a2d27" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {blush}
        </g>
      );
    case "cool":
      return (
        <g>
          <rect x="34" y="47" width="11" height="3.4" rx="1.7" fill="#241d1a" />
          <rect x="55" y="47" width="11" height="3.4" rx="1.7" fill="#241d1a" />
          <path d="M45 58 L55 58" stroke="#3a2d27" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case "cat":
      return (
        <g>
          {roundEye(40)}
          {roundEye(60)}
          <path d="M46 56 Q50 59 50 56 Q50 59 54 56" stroke="#3a2d27" strokeWidth="1.9" fill="none" strokeLinecap="round" />
          {blush}
        </g>
      );
    default: // smile
      return (
        <g>
          {roundEye(40)}
          {roundEye(60)}
          <path d="M45 57 Q50 62 55 57" stroke="#3a2d27" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {blush}
        </g>
      );
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
