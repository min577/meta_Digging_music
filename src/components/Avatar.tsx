"use client";

import type { Appearance, FaceStyle, HatStyle, GlassesStyle } from "@/lib/appearance";

export type Dir = "down" | "up" | "left" | "right";

// 디깅타운 마스코트 2D — 둥근 후드 온지(양옆 귀 + 크림 얼굴 + 둥근 앞머리). 디자인 레퍼런스 기준.
// 후드(본체)=outfit · 목도리=pants · 앞머리=hairColor · 표정=face. 모자/안경=상점 악세서리.
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
  /** 발밑 취향 오라 색 (대표 장르) */
  aura?: string;
}) {
  const a = appearance;
  const flip = dir === "left";
  const body = a.outfit || "#7B5EE6";
  const ear = shade(body, -8);
  const foot = shade(body, -30);
  const scarf = a.pants || "none";
  const hair = a.hairColor || "#2A251D";
  const gid = "bd" + body.replace(/[^a-zA-Z0-9]/g, "");

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
        <defs>
          {/* 상→하 그라데이션 (위 밝게, 아래 어둡게) */}
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={lighten(body, 16)} />
            <stop offset="1" stopColor={shade(body, -26)} />
          </linearGradient>
        </defs>

        {/* 발밑 취향 오라 */}
        {aura && (
          <g>
            <ellipse cx="50" cy="110" rx="34" ry="11" fill={aura} opacity="0.18" />
            <ellipse cx="50" cy="110" rx="24" ry="7.5" fill={aura} opacity="0.28" />
          </g>
        )}
        {/* 그림자 */}
        <ellipse cx="50" cy="114" rx="22" ry="5" fill="rgba(0,0,0,0.18)" />

        {/* 발 */}
        <ellipse cx="41" cy="103" rx="8" ry="6.5" fill={foot} />
        <ellipse cx="59" cy="103" rx="8" ry="6.5" fill={foot} />

        {/* 후드 양옆 귀(퍼프) */}
        <circle cx="15" cy="47" r="10" fill={ear} />
        <circle cx="85" cy="47" r="10" fill={ear} />

        {/* 온지 본체(하단) */}
        <ellipse cx="50" cy="83" rx="30" ry="26" fill={`url(#${gid})`} />
        {/* 후드(머리) */}
        <circle cx="50" cy="47" r="30" fill={`url(#${gid})`} />

        {/* 얼굴(크림) */}
        <ellipse cx="50" cy="54" rx="21" ry="22" fill="#F8E2C5" />
        {/* 앞머리(다크 둥근 마운드) */}
        <path
          d="M28 53 Q28 30 50 30 Q72 30 72 53 Q61 49 50 50 Q39 49 28 53 Z"
          fill={hair}
        />

        {/* 목도리 (선택) — 'none'이면 미표시 */}
        {scarf !== "none" && (
          <path d="M34 73 Q50 79 66 73 L66 77 Q50 83 34 77 Z" fill={scarf} />
        )}

        {/* 얼굴 표정 */}
        <BeanFace face={a.face} />

        {/* 안경 (상점 악세서리) */}
        <Glasses kind={a.glasses} />
        {/* 모자 (상점 악세서리) — 후드 위 */}
        <Hat kind={a.hat} accent={hair} />
      </svg>
    </div>
  );
}

// 후드 상단(y≈16) 악세서리
function Hat({ kind, accent }: { kind: HatStyle; accent: string }) {
  switch (kind) {
    case "cap":
      return (
        <g>
          <path d="M33 25 Q50 7 67 25 Z" fill="#ff5a5f" />
          <path d="M33 25 Q50 17 67 25 L67 27 L33 27 Z" fill="#e0494e" />
          <path d="M62 26 Q78 25 76 31 L64 30 Z" fill="#e0494e" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M32 26 Q50 5 68 26 Z" fill="#46d8c5" />
          <rect x="32" y="24" width="36" height="5" rx="2.5" fill="#2fb6a5" />
          <circle cx="50" cy="8" r="3.5" fill="#eafffb" />
        </g>
      );
    case "headphones":
      return (
        <g>
          <path d="M28 29 Q28 8 50 8 Q72 8 72 29" stroke="#C99A2E" strokeWidth="4" fill="none" />
          <rect x="23" y="27" width="9" height="13" rx="3" fill="#F2C14E" />
          <rect x="68" y="27" width="9" height="13" rx="3" fill="#F2C14E" />
        </g>
      );
    case "fedora":
      return (
        <g>
          <ellipse cx="50" cy="26" rx="22" ry="5" fill="#4a3a2a" />
          <path d="M38 26 Q38 11 50 11 Q62 11 62 26 Z" fill="#5a4632" />
          <rect x="38" y="21" width="24" height="3.5" fill="#33271b" />
        </g>
      );
    case "flower":
      return (
        <g transform="translate(72,17)">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={Math.cos((i / 5) * Math.PI * 2) * 4} cy={Math.sin((i / 5) * Math.PI * 2) * 4} r="3" fill="#ff6ec7" />
          ))}
          <circle cx="0" cy="0" r="2.4" fill="#ffd23a" />
        </g>
      );
    case "crown":
      return (
        <g>
          <path d="M34 25 L37 12 L44 20 L50 9 L56 20 L63 12 L66 25 Z" fill="#ffd23a" stroke="#e6ad17" strokeWidth="1" />
          <circle cx="50" cy="13" r="2" fill="#ff5a8a" />
          <circle cx="38" cy="14" r="1.6" fill="#5bd2ff" />
          <circle cx="62" cy="14" r="1.6" fill="#5bd2ff" />
        </g>
      );
    case "party":
      return (
        <g>
          <path d="M50 3 L60 26 L40 26 Z" fill={accent} />
          <path d="M50 3 L55 14.5 L45 14.5 Z" fill="#fff" opacity="0.4" />
          <circle cx="50" cy="3" r="3" fill="#ffd23a" />
          <circle cx="45" cy="19" r="1.6" fill="#fff" />
          <circle cx="55" cy="21" r="1.6" fill="#fff" />
        </g>
      );
    default:
      return null;
  }
}

// 눈(cx41/59, cy57) 위 안경
function Glasses({ kind }: { kind: GlassesStyle }) {
  switch (kind) {
    case "round":
      return (
        <g stroke="#3a2d20" strokeWidth="1.8" fill="none">
          <circle cx="41" cy="57" r="6" />
          <circle cx="59" cy="57" r="6" />
          <path d="M47 56 Q50 54 53 56" />
        </g>
      );
    case "sun":
      return (
        <g>
          <rect x="34" y="53" width="13" height="8.5" rx="3" fill="#16161e" />
          <rect x="53" y="53" width="13" height="8.5" rx="3" fill="#16161e" />
          <rect x="46" y="55" width="8" height="2.4" fill="#16161e" />
        </g>
      );
    case "star":
      return (
        <g>
          <text x="35" y="61" fontSize="11">⭐</text>
          <text x="54" y="61" fontSize="11">⭐</text>
        </g>
      );
    case "heart":
      return (
        <g>
          <text x="34" y="62" fontSize="11">💗</text>
          <text x="54" y="62" fontSize="11">💗</text>
        </g>
      );
    default:
      return null;
  }
}

// 표정 — 레퍼런스의 단순 세로 오벌 눈 기반. 눈 cy57.
function BeanFace({ face }: { face: FaceStyle }) {
  const blush = (
    <>
      <ellipse cx="34" cy="63" rx="3.4" ry="2.6" fill="#ff9bb0" opacity="0.45" />
      <ellipse cx="66" cy="63" rx="3.4" ry="2.6" fill="#ff9bb0" opacity="0.45" />
    </>
  );
  const ovalEye = (x: number) => (
    <g>
      <ellipse cx={x} cy="57" rx="2.7" ry="4" fill="#2a2520" />
      <circle cx={x - 1} cy="55.2" r="1.1" fill="#fff" opacity="0.9" />
    </g>
  );
  switch (face) {
    case "happy":
      return (
        <g>
          <path d="M35 57 Q41 51 47 57" stroke="#2a2520" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M53 57 Q59 51 65 57" stroke="#2a2520" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M44 64 Q50 69 56 64" stroke="#3a2d27" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {blush}
        </g>
      );
    case "wink":
      return (
        <g>
          {ovalEye(41)}
          <path d="M53 58 Q59 54 65 58" stroke="#2a2520" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          {blush}
        </g>
      );
    case "cool":
      return (
        <g>
          <rect x="35" y="56" width="11" height="3.2" rx="1.6" fill="#2a2520" />
          <rect x="54" y="56" width="11" height="3.2" rx="1.6" fill="#2a2520" />
        </g>
      );
    case "cat":
      return (
        <g>
          {ovalEye(41)}
          {ovalEye(59)}
          <path d="M46 64 Q50 67 50 64 Q50 67 54 64" stroke="#3a2d27" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {blush}
        </g>
      );
    default: // smile — 레퍼런스 기본(오벌 눈 + 은은한 볼터치)
      return (
        <g>
          {ovalEye(41)}
          {ovalEye(59)}
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
