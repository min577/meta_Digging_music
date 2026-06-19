"use client";

import type { Appearance, FaceStyle } from "@/lib/appearance";

export type Dir = "down" | "up" | "left" | "right";

// 디깅타운 마스코트 "Bean"의 2D 버전 — 3D BeanAvatar3D와 동일 디자인.
// 본체=outfit · 목도리=pants · 안테나=hairColor · 표정=face.
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
      </svg>
    </div>
  );
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
