"use client";

import type { Appearance, FaceStyle, HatStyle, GlassesStyle, CostumeStyle } from "@/lib/appearance";

export type Dir = "down" | "up" | "left" | "right";

// 코스튬별 본체 색 (디자인 가이드)
const COSTUME_BODY: Record<Exclude<CostumeStyle, "none">, string> = {
  witch: "#7B6BD6",
  plaid: "#C6D8F0",
  star: "#F4EDB0",
  fries: "#E8443C",
};

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
  // 코스튬이 있으면 본체 룩을 덮어씀
  const cos = a.costume && a.costume !== "none" ? a.costume : null;
  const body = cos ? COSTUME_BODY[cos] : a.outfit || "#7B5EE6";
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

        {cos === "fries" ? (
          // 감자튀김 — 빨간 박스 + 튀김
          <>
            <ellipse cx="41" cy="103" rx="8" ry="6.5" fill="#B5392F" />
            <ellipse cx="59" cy="103" rx="8" ry="6.5" fill="#B5392F" />
            <FriesSticks />
            <path d="M22 44 L78 44 L72 102 Q72 106 68 106 L32 106 Q28 106 28 102 Z" fill={`url(#${gid})`} />
            <rect x="26" y="58" width="48" height="9" fill="#fff" opacity="0.85" />
            <text x="50" y="66" fontFamily="Arial" fontSize="9" fontWeight="900" fill="#E0A92E" textAnchor="middle">DIG</text>
            <FaceCore hair={hair} face={a.face} />
          </>
        ) : (
          <>
            {/* 발 */}
            <ellipse cx="41" cy="103" rx="8" ry="6.5" fill={foot} />
            <ellipse cx="59" cy="103" rx="8" ry="6.5" fill={foot} />
            {/* 별 잠옷 라벤더 팔 (몸통 뒤) */}
            {cos === "star" && (
              <>
                <ellipse cx="16" cy="80" rx="8" ry="11" fill="#B9C4E8" />
                <ellipse cx="84" cy="80" rx="8" ry="11" fill="#B9C4E8" />
              </>
            )}
            {/* 후드 양옆 귀(퍼프) */}
            <circle cx="15" cy="47" r="10" fill={ear} />
            <circle cx="85" cy="47" r="10" fill={ear} />
            {/* 온지 본체(하단) */}
            <ellipse cx="50" cy="83" rx="30" ry="26" fill={`url(#${gid})`} />
            {/* 후드(머리) */}
            <circle cx="50" cy="47" r="30" fill={`url(#${gid})`} />

            {/* 코스튬 패턴 */}
            {cos === "plaid" && <PlaidPattern />}
            {cos === "star" && <StarPattern />}

            {/* 얼굴 + 앞머리 */}
            <FaceCore hair={hair} face={a.face} />

            {/* 마녀 — 빨간 망토 칼라 + 벨트 */}
            {cos === "witch" && (
              <g>
                <path d="M30 72 Q50 80 70 72 L72 80 Q50 90 28 80 Z" fill="#D8483C" />
                <rect x="30" y="88" width="40" height="7" rx="2" fill="#C53A30" />
                <rect x="46" y="87" width="8" height="9" rx="1.5" fill="#E8B84A" />
              </g>
            )}

            {/* 목도리 (코스튬 없을 때만) */}
            {!cos && scarf !== "none" && (
              <path d="M34 73 Q50 79 66 73 L66 77 Q50 83 34 77 Z" fill={scarf} />
            )}
          </>
        )}

        {/* 안경 (상점 악세서리) */}
        <Glasses kind={a.glasses} />
        {/* 마녀 모자 / 일반 모자 */}
        {cos === "witch" ? (
          <g transform="rotate(-6 50 22)">
            <ellipse cx="50" cy="24" rx="30" ry="7" fill="#5A4AAE" />
            <path d="M34 24 Q44 -8 60 2 L58 24 Z" fill="#6E5CC8" />
            <rect x="36" y="19" width="28" height="5" rx="2" fill="#4A3C96" />
            <circle cx="55" cy="11" r="2.5" fill="#E8B84A" />
          </g>
        ) : (
          !cos && <Hat kind={a.hat} accent={hair} />
        )}
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

// 얼굴(크림) + 앞머리 + 표정 — 모든 룩 공통
function FaceCore({ hair, face }: { hair: string; face: FaceStyle }) {
  return (
    <>
      <ellipse cx="50" cy="54" rx="21" ry="22" fill="#F8E2C5" />
      <path d="M28 53 Q28 30 50 30 Q72 30 72 53 Q61 49 50 50 Q39 49 28 53 Z" fill={hair} />
      <BeanFace face={face} />
    </>
  );
}

// 감자튀김 — 박스 위로 솟은 튀김
function FriesSticks() {
  const sticks: [number, number][] = [
    [33, 30], [40, 38], [48, 42], [56, 38], [64, 32], [36, 24], [60, 24],
  ];
  return (
    <g>
      {sticks.map(([fx, h], i) => (
        <rect key={i} x={fx} y={42 - h} width="6.5" height={h} rx="2.5" fill="#F4C23A" stroke="#E0A92E" strokeWidth="0.6" />
      ))}
    </g>
  );
}

// 체크 잠옷 패턴 (본체에 클립)
function PlaidPattern() {
  const xs: number[] = [];
  for (let x = 14; x < 90; x += 11) xs.push(x);
  const ys: number[] = [];
  for (let y = 20; y < 112; y += 11) ys.push(y);
  return (
    <>
      <clipPath id="plaidClip">
        <circle cx="50" cy="47" r="30" />
        <ellipse cx="50" cy="83" rx="30" ry="26" />
      </clipPath>
      <g clipPath="url(#plaidClip)">
        {xs.map((x) => (
          <g key={"x" + x}>
            <line x1={x} y1="18" x2={x} y2="110" stroke="#ffffff" strokeWidth="3" opacity="0.55" />
            <line x1={x + 4} y1="18" x2={x + 4} y2="110" stroke="#9FB6E0" strokeWidth="1.5" opacity="0.5" />
          </g>
        ))}
        {ys.map((y) => (
          <g key={"y" + y}>
            <line x1="6" y1={y} x2="94" y2={y} stroke="#ffffff" strokeWidth="3" opacity="0.55" />
            <line x1="6" y1={y + 4} x2="94" y2={y + 4} stroke="#9FB6E0" strokeWidth="1.5" opacity="0.5" />
          </g>
        ))}
      </g>
    </>
  );
}

// 별 잠옷 패턴 (본체에 클립)
function StarPattern() {
  const pts: [number, number][] = [
    [26, 40], [70, 38], [34, 72], [64, 74], [50, 92], [22, 86], [78, 86], [40, 100], [60, 100],
  ];
  const star = (sx: number, sy: number) => {
    let d = "";
    for (let k = 0; k < 5; k++) {
      const a1 = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      const a2 = a1 + Math.PI / 5;
      const x1 = sx + Math.cos(a1) * 3.2, y1 = sy + Math.sin(a1) * 3.2;
      const x2 = sx + Math.cos(a2) * 1.4, y2 = sy + Math.sin(a2) * 1.4;
      d += `${k === 0 ? "M" : "L"}${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} `;
    }
    return d + "Z";
  };
  return (
    <>
      <clipPath id="starClip">
        <circle cx="50" cy="47" r="30" />
        <ellipse cx="50" cy="83" rx="30" ry="26" />
      </clipPath>
      <g clipPath="url(#starClip)">
        {pts.map(([sx, sy], i) => (
          <path key={i} d={star(sx, sy)} fill="#E8D86A" opacity="0.8" />
        ))}
      </g>
    </>
  );
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
