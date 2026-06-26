"use client";

import type { Appearance, FaceStyle, HatStyle, GlassesStyle, CostumeStyle } from "@/lib/appearance";

export type Dir = "down" | "up" | "left" | "right";

const HAIR_BROWN = "#3A2A26";
// 후드형 코스튬 본체 색 (plaid/star). witch/fries는 전용 룩으로 그림.
const COSTUME_BODY: Record<"plaid" | "star", string> = {
  plaid: "#C2D6F2",
  star: "#F4EEB2",
};

// 디깅타운 마스코트 2D — 후드 온지(귀+크림얼굴+앞머리). 코스튬은 본체 룩을 덮어씀.
// 후드(본체)=outfit · 목도리=pants · 앞머리=hairColor · 표정=face. 모자/안경/코스튬=상점.
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
  const a = appearance || ({} as Appearance);
  const flip = dir === "left";
  const cos = a.costume && a.costume !== "none" ? a.costume : null;
  const hoodBody = cos === "plaid" || cos === "star" ? COSTUME_BODY[cos] : a.outfit || "#7B5EE6";
  const ear = shade(hoodBody, -8);
  const foot = shade(hoodBody, -30);
  const scarf = a.pants || "none";
  const hair = a.hairColor || "#2A251D";
  const gid = "bd" + hoodBody.replace(/[^a-zA-Z0-9]/g, "");

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
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={lighten(hoodBody, 16)} />
            <stop offset="1" stopColor={shade(hoodBody, -24)} />
          </linearGradient>
          <linearGradient id="wBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8E7EE6" /><stop offset="1" stopColor="#6A58C2" />
          </linearGradient>
          <linearGradient id="fBox" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F05642" /><stop offset="0.55" stopColor="#E2483A" /><stop offset="1" stopColor="#C73A30" />
          </linearGradient>
        </defs>

        {aura && (
          <g>
            <ellipse cx="50" cy="110" rx="34" ry="11" fill={aura} opacity="0.18" />
            <ellipse cx="50" cy="110" rx="24" ry="7.5" fill={aura} opacity="0.28" />
          </g>
        )}
        <ellipse cx="50" cy="114" rx="22" ry="5" fill="rgba(0,0,0,0.18)" />

        {cos === "witch" ? (
          <WitchLook face={a.face} />
        ) : cos === "fries" ? (
          <FriesLook face={a.face} />
        ) : (
          <HoodedLook gid={gid} ear={ear} foot={foot} hair={hair} face={a.face} cos={cos} scarf={scarf} />
        )}

        {/* 안경 (코스튬과 공존) */}
        <Glasses kind={a.glasses} />
        {/* 모자 (코스튬 없을 때만) */}
        {!cos && <Hat kind={a.hat} accent={hair} />}
      </svg>
    </div>
  );
}

// ---- 룩(후드형: 기본/체크/별) ----
function HoodedLook({
  gid, ear, foot, hair, face, cos, scarf,
}: {
  gid: string; ear: string; foot: string; hair: string; face: FaceStyle; cos: string | null; scarf: string;
}) {
  return (
    <>
      <ellipse cx="41" cy="103" rx="8" ry="6.5" fill={foot} />
      <ellipse cx="59" cy="103" rx="8" ry="6.5" fill={foot} />
      {/* 별 잠옷 라벤더 팔 */}
      {cos === "star" && (
        <>
          <ellipse cx="15" cy="82" rx="8.5" ry="12" fill="#AEBBEA" />
          <ellipse cx="85" cy="82" rx="8.5" ry="12" fill="#AEBBEA" />
        </>
      )}
      <circle cx="15" cy="47" r="10" fill={ear} />
      <circle cx="85" cy="47" r="10" fill={ear} />
      <ellipse cx="50" cy="83" rx="30" ry="26" fill={`url(#${gid})`} />
      <circle cx="50" cy="47" r="30" fill={`url(#${gid})`} />

      {cos === "plaid" && <PlaidPattern />}
      {cos === "star" && <StarPattern />}

      {/* 얼굴 + 앞머리 */}
      <ellipse cx="50" cy="54" rx="21" ry="22" fill="#F8E2C5" />
      <path d="M28 53 Q28 30 50 30 Q72 30 72 53 Q61 49 50 50 Q39 49 28 53 Z" fill={hair} />
      <BeanFace face={face} />

      {!cos && scarf !== "none" && (
        <path d="M34 73 Q50 79 66 73 L66 77 Q50 83 34 77 Z" fill={scarf} />
      )}
    </>
  );
}

// 머리가 얼굴을 감싸는 헤드 (마녀/감자튀김 — 후드 없음)
function HairHead({ face }: { face: FaceStyle }) {
  return (
    <>
      <ellipse cx="50" cy="49" rx="24" ry="26" fill={HAIR_BROWN} />
      <ellipse cx="50" cy="54" rx="19.5" ry="21" fill="#F8E2C5" />
      <path d="M30 52 Q30 30 50 30 Q70 30 70 52 Q60 47 50 48 Q40 47 30 52 Z" fill={HAIR_BROWN} />
      <BeanFace face={face} />
    </>
  );
}

// ---- 마녀 ----
function WitchLook({ face }: { face: FaceStyle }) {
  return (
    <>
      <ellipse cx="40" cy="104" rx="8" ry="6.5" fill="#5A4AAE" />
      <ellipse cx="60" cy="104" rx="8" ry="6.5" fill="#5A4AAE" />
      <ellipse cx="50" cy="84" rx="30" ry="26" fill="url(#wBody)" />
      {/* 빨간 망토 칼라 */}
      <path d="M22 70 Q50 64 78 70 L84 86 Q50 78 16 86 Z" fill="#D24338" />
      <path d="M22 70 Q50 76 78 70 L78 73 Q50 80 22 73 Z" fill="#B5392F" />
      {/* 벨트 + 골드 버클 */}
      <rect x="30" y="92" width="40" height="7" rx="2" fill="#C12F26" />
      <rect x="45" y="90.5" width="10" height="10" rx="1.5" fill="#E8C24A" />
      <rect x="47.5" y="93" width="5" height="5" rx="1" fill="#C99A2E" />
      <HairHead face={face} />
      {/* 마녀 모자 */}
      <g transform="rotate(-7 50 20)">
        <ellipse cx="50" cy="22" rx="33" ry="7.5" fill="#5A4AAE" />
        <path d="M33 22 Q40 -10 52 -8 Q62 -6 58 22 Z" fill="url(#wBody)" />
        <path d="M35 19 L63 19 L62 24 L36 24 Z" fill="#E8C24A" />
        <rect x="46" y="18.5" width="8" height="6" rx="1" fill="#C99A2E" />
      </g>
    </>
  );
}

// ---- 감자튀김 ----
function FriesLook({ face }: { face: FaceStyle }) {
  const sticks: [number, number, number][] = [
    [30, 34, 7], [38, 44, 7], [46, 50, 7], [54, 46, 7], [62, 38, 7], [70, 30, 7], [34, 26, 6], [66, 24, 6],
  ];
  return (
    <>
      <ellipse cx="40" cy="105" rx="8" ry="6.5" fill="#A8332A" />
      <ellipse cx="60" cy="105" rx="8" ry="6.5" fill="#A8332A" />
      {/* 튀김 (뒤) */}
      {sticks.map(([fx, h, w], i) => (
        <g key={i}>
          <rect x={fx} y={46 - h} width={w} height={h} rx="2.5" fill="#F6C544" stroke="#E0A92E" strokeWidth="0.7" />
          <rect x={fx + 1} y={46 - h} width="2" height={h - 3} rx="1" fill="#FCE08A" opacity="0.6" />
        </g>
      ))}
      {/* 빨간 카톤 */}
      <path d="M20 46 L80 46 L73 104 Q73 108 69 108 L31 108 Q27 108 27 104 Z" fill="url(#fBox)" />
      <path d="M20 46 L27 46 L25 70 L20 70 Z" fill="#B5392F" opacity="0.5" />
      <path d="M80 46 L73 46 L75 70 L80 70 Z" fill="#B5392F" opacity="0.5" />
      <rect x="25" y="60" width="50" height="11" rx="1.5" fill="#fff" opacity="0.92" />
      <text x="50" y="69" fontFamily="Arial" fontSize="9" fontWeight="900" fill="#E2483A" textAnchor="middle">DIG</text>
      <HairHead face={face} />
    </>
  );
}

// 체크 잠옷 타탄 패턴 (본체에 클립)
function PlaidPattern() {
  const xs: number[] = [];
  for (let x = 8; x < 96; x += 12) xs.push(x);
  const ys: number[] = [];
  for (let y = 18; y < 114; y += 12) ys.push(y);
  return (
    <>
      <clipPath id="plaidClip">
        <circle cx="50" cy="47" r="30" />
        <ellipse cx="50" cy="83" rx="30" ry="26" />
      </clipPath>
      <g clipPath="url(#plaidClip)">
        {xs.map((x) => (
          <g key={"x" + x}>
            <line x1={x} y1="16" x2={x} y2="112" stroke="#ffffff" strokeWidth="4" opacity="0.6" />
            <line x1={x + 5} y1="16" x2={x + 5} y2="112" stroke="#8FB0E2" strokeWidth="1.6" opacity="0.7" />
          </g>
        ))}
        {ys.map((y) => (
          <g key={"y" + y}>
            <line x1="4" y1={y} x2="96" y2={y} stroke="#ffffff" strokeWidth="4" opacity="0.6" />
            <line x1="4" y1={y + 5} x2="96" y2={y + 5} stroke="#8FB0E2" strokeWidth="1.6" opacity="0.7" />
          </g>
        ))}
      </g>
    </>
  );
}

// 별 잠옷 패턴 (본체에 클립)
function StarPattern() {
  const pts: [number, number][] = [
    [24, 40], [50, 34], [76, 40], [33, 58], [67, 58], [30, 80], [70, 80], [50, 72], [22, 66], [78, 66], [42, 94], [58, 94], [50, 102],
  ];
  const star = (sx: number, sy: number) => {
    let d = "";
    for (let k = 0; k < 5; k++) {
      const a1 = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      const a2 = a1 + Math.PI / 5;
      d += `${k === 0 ? "M" : "L"}${(sx + Math.cos(a1) * 3.4).toFixed(1)} ${(sy + Math.sin(a1) * 3.4).toFixed(1)} L${(sx + Math.cos(a2) * 1.5).toFixed(1)} ${(sy + Math.sin(a2) * 1.5).toFixed(1)} `;
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
          <path key={i} d={star(sx, sy)} fill="#DFCC55" opacity="0.7" />
        ))}
      </g>
    </>
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

// 표정 — 단순 세로 오벌 눈. 눈 cy57.
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
    default:
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
