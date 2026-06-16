"use client";

import React from "react";

// 아이소메트릭 3톤 음영 SVG 소품 (동물의 숲 같은 입체 블록 느낌).
// viewBox 0 0 64 72, 바닥 중앙 ≈ (32, 60). 광원은 좌상단 고정.
export type DecorKind =
  | "plant" | "tree" | "palm" | "sofa" | "chair" | "bed" | "table"
  | "lamp" | "floorlamp" | "tv" | "painting" | "bookshelf" | "window"
  | "cushion" | "candle" | "lantern" | "fountain" | "speaker" | "piano"
  | "guitar" | "drum" | "mic" | "disco" | "crystal" | "star" | "balloon"
  | "building" | "neon" | "column" | "cocktail" | "vinyl" | "arcade"
  | "treadmill" | "dumbbell" | "bench" | "locker" | "mirror" | "desk"
  | "globe" | "streetlamp" | "bicycle" | "tent" | "planeseat" | "cloud"
  | "car" | "counter";

export const DECOR_LABEL: Partial<Record<DecorKind, string>> = {
  plant: "화분", tree: "나무", palm: "야자수", sofa: "소파", chair: "의자",
  bed: "침대", table: "테이블", lamp: "램프", floorlamp: "플로어램프", tv: "TV",
  painting: "액자", bookshelf: "책장", window: "창문", cushion: "쿠션", candle: "촛불",
  lantern: "랜턴", fountain: "분수", speaker: "스피커", piano: "피아노", guitar: "기타",
  drum: "드럼", mic: "마이크", disco: "디스코볼", crystal: "크리스탈", star: "별",
  balloon: "풍선", building: "빌딩", neon: "네온사인", column: "기둥", cocktail: "칵테일",
  vinyl: "LP", arcade: "오락기",
};

// ---- 색 유틸 ----
function adj(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = clamp((n >> 16) + a), g = clamp(((n >> 8) & 0xff) + a), b = clamp((n & 0xff) + a);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
const clamp = (v: number) => Math.max(0, Math.min(255, v));
const lite = (h: string, a = 26) => adj(h, a);
const dark = (h: string, a = 24) => adj(h, -a);

// ---- 아이소메트릭 프리미티브 ----
const KX = 0.9; // 가로 기울기
const KY = 0.5; // 세로 기울기

// 입체 직육면체 (바닥중앙 cx,by / 가로w 깊이d 높이h)
function box(cx: number, by: number, w: number, d: number, h: number, col: string, key?: React.Key) {
  const ox = cx - (w / 2 - d / 2) * KX;
  const oy = by - (w / 2 + d / 2) * KY;
  const P = (x: number, y: number, z: number) =>
    `${(ox + (x - y) * KX).toFixed(1)},${(oy + (x + y) * KY - z).toFixed(1)}`;
  return (
    <g key={key}>
      {/* 오른면 (x=w) — 가장 어둡게 */}
      <polygon points={`${P(w, 0, 0)} ${P(w, d, 0)} ${P(w, d, h)} ${P(w, 0, h)}`} fill={dark(col, 30)} />
      {/* 왼면 (y=d) — 중간 */}
      <polygon points={`${P(0, d, 0)} ${P(w, d, 0)} ${P(w, d, h)} ${P(0, d, h)}`} fill={dark(col, 8)} />
      {/* 윗면 — 가장 밝게 */}
      <polygon points={`${P(0, 0, h)} ${P(w, 0, h)} ${P(w, d, h)} ${P(0, d, h)}`} fill={lite(col, 30)} />
    </g>
  );
}

// 원기둥 (바닥중앙 cx,by / 반지름 r / 높이 h)
function cyl(cx: number, by: number, r: number, h: number, col: string, key?: React.Key) {
  const ry = r * 0.5;
  const ty = by - h;
  return (
    <g key={key}>
      <ellipse cx={cx} cy={by} rx={r} ry={ry} fill={dark(col, 28)} />
      <rect x={cx - r} y={ty} width={r * 2} height={h} fill={col} />
      <rect x={cx} y={ty} width={r} height={h} fill={dark(col, 16)} />
      <ellipse cx={cx} cy={ty} rx={r} ry={ry} fill={lite(col, 26)} />
    </g>
  );
}

// 둥근 잎/공 (입체 구) — 메인 + 좌상단 하이라이트
function ball(cx: number, cy: number, r: number, col: string, key?: React.Key) {
  return (
    <g key={key}>
      <circle cx={cx} cy={cy} r={r} fill={col} />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.32} r={r * 0.62} fill={lite(col, 22)} />
      <circle cx={cx - r * 0.42} cy={cy - r * 0.45} r={r * 0.28} fill={lite(col, 40)} />
    </g>
  );
}

export default function DecorSprite({ kind, size = 56 }: { kind: DecorKind; size?: number }) {
  return (
    <svg width={size} height={size * 1.05} viewBox="0 0 64 72" className="block">
      {render(kind)}
    </svg>
  );
}

function render(kind: DecorKind): React.ReactNode {
  switch (kind) {
    case "plant":
      return (
        <>
          {box(32, 60, 16, 16, 10, "#c97a45")}
          {ball(28, 36, 9, "#5bb073")}
          {ball(38, 34, 8, "#4f9d63")}
          {ball(33, 28, 9, "#63bd7d")}
        </>
      );
    case "tree":
      return (
        <>
          {box(32, 60, 8, 8, 14, "#8a5a34")}
          {ball(32, 32, 13, "#4f9d62")}
          {ball(23, 36, 9, "#469058")}
          {ball(41, 36, 9, "#58ad6e")}
          {ball(32, 22, 10, "#63bd7d")}
        </>
      );
    case "palm":
      return (
        <>
          {box(32, 60, 7, 7, 22, "#9a6b3c")}
          {ball(24, 22, 8, "#3fae6a")}
          {ball(40, 22, 8, "#359a5c")}
          {ball(20, 30, 7, "#4fbe76")}
          {ball(44, 30, 7, "#4fbe76")}
          {ball(32, 18, 8, "#5cc784")}
        </>
      );
    case "sofa":
      return (
        <>
          {box(32, 62, 30, 16, 8, "#7177b8")}
          {box(22, 56, 8, 16, 14, "#6166a6")}
          {box(43, 50, 28, 5, 16, "#7d83c4")}
          {box(30, 54, 18, 12, 5, "#8a90cf")}
        </>
      );
    case "chair":
      return (
        <>
          {box(32, 60, 16, 16, 8, "#c2724a")}
          {box(38, 50, 16, 4, 16, "#b5654a")}
        </>
      );
    case "bed":
      return (
        <>
          {box(32, 62, 30, 20, 8, "#a9647f")}
          {box(40, 56, 28, 16, 5, "#e7b3c8")}
          {box(22, 56, 10, 14, 7, "#ffffff")}
          {box(20, 52, 6, 18, 14, "#8f5772")}
        </>
      );
    case "table":
      return (
        <>
          {box(24, 60, 4, 4, 14, "#8a6038")}
          {box(40, 58, 4, 4, 14, "#8a6038")}
          {box(32, 46, 26, 18, 4, "#caa46e")}
        </>
      );
    case "lamp":
      return (
        <>
          {box(32, 60, 12, 12, 3, "#6a5c40")}
          <rect x="31" y="40" width="2.5" height="18" fill="#8a7a5a" />
          {box(32, 42, 16, 16, 8, "#ffd98a")}
        </>
      );
    case "floorlamp":
      return (
        <>
          {box(32, 60, 12, 12, 3, "#6a5c40")}
          <rect x="31" y="20" width="2.5" height="38" fill="#7a6c50" />
          <path d="M24 22 h16 l-3 -12 h-10Z" fill="#ffe2a0" />
          <ellipse cx="32" cy="22" rx="8" ry="2.2" fill="#fff1c2" />
        </>
      );
    case "tv":
      return (
        <>
          {box(32, 60, 22, 12, 4, "#3a3a48")}
          {box(32, 54, 30, 5, 20, "#23232e")}
          <polygon points="20,30 44,30 41,44 23,44" fill="#5bc8e0" />
          <polygon points="20,30 44,30 42,35 22,35" fill="#7fd8ec" />
        </>
      );
    case "painting":
      return (
        <>
          {box(32, 60, 6, 14, 6, "#8a6038")}
          {box(32, 40, 22, 4, 18, "#caa46e")}
          <rect x="22" y="22" width="20" height="14" fill="#7fb5d8" />
          <path d="M22 36 l7 -8 5 5 5 -6 5 9Z" fill="#5a8a5c" />
        </>
      );
    case "bookshelf":
      return (
        <>
          {box(32, 62, 22, 12, 36, "#8a5e3a")}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="22" y={30 - i * 10} width="20" height="3" fill="#6a4628" />
              <rect x="23" y={22 - i * 10} width="3" height="8" fill="#d85a5a" />
              <rect x="27" y={22 - i * 10} width="3" height="8" fill="#5a9ad8" />
              <rect x="31" y={22 - i * 10} width="3" height="8" fill="#5ad88a" />
              <rect x="35" y={22 - i * 10} width="3" height="8" fill="#d8c25a" />
            </g>
          ))}
        </>
      );
    case "window":
      return (
        <>
          {box(32, 60, 24, 6, 38, "#7a5230")}
          <rect x="20" y="18" width="24" height="30" fill="#8fd0ec" />
          <polygon points="20,40 30,30 37,36 44,28 44,48 20,48" fill="#bfe6f4" opacity="0.6" />
          <rect x="31" y="18" width="2.5" height="30" fill="#7a5230" />
          <rect x="20" y="31" width="24" height="2.5" fill="#7a5230" />
        </>
      );
    case "cushion":
      return <>{box(32, 60, 22, 18, 7, "#e08a6a")}</>;
    case "candle":
      return (
        <>
          {cyl(32, 58, 6, 16, "#f0e6d2")}
          <path d="M32 30 q4 6 0 12 q-4 -6 0 -12Z" fill="#ffb13a" />
          <circle cx="32" cy="36" r="2.4" fill="#fff0b0" />
        </>
      );
    case "lantern":
      return (
        <>
          {box(32, 60, 16, 16, 26, "#d8632e")}
          <rect x="26" y="40" width="12" height="14" rx="2" fill="#ffd07a" />
        </>
      );
    case "fountain":
      return (
        <>
          {cyl(32, 60, 18, 6, "#8fb6cc")}
          <ellipse cx="32" cy="50" rx="14" ry="5" fill="#bfe6f4" />
          {cyl(32, 48, 4, 12, "#cfd6da")}
          <path d="M32 30 q-7 6 0 10 q7 -6 0 -10Z" fill="#bfe6f4" />
        </>
      );
    case "speaker":
      return (
        <>
          {box(32, 60, 18, 14, 40, "#2a2a34")}
          <ellipse cx="29" cy="40" rx="7" ry="8" fill="#43434f" />
          <ellipse cx="29" cy="40" rx="3" ry="3.5" fill="#16161c" />
          <circle cx="29" cy="24" r="3.5" fill="#43434f" />
        </>
      );
    case "piano":
      return (
        <>
          {box(32, 62, 26, 16, 16, "#26262e")}
          <polygon points="20,46 44,46 47,52 17,52" fill="#fff" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={21 + i * 5} y="46" width="2" height="5" fill="#26262e" />
          ))}
        </>
      );
    case "guitar":
      return (
        <>
          <ellipse cx="28" cy="44" rx="13" ry="15" fill="#c66a2e" />
          <ellipse cx="25" cy="40" rx="8" ry="9" fill="#d98548" />
          <circle cx="28" cy="44" r="4.5" fill="#5a3318" />
          <rect x="33" y="12" width="5" height="30" rx="2" transform="rotate(20 35 25)" fill="#7a4a28" />
        </>
      );
    case "drum":
      return (
        <>
          {cyl(32, 56, 18, 16, "#e0e6ea")}
          <path d="M14 40 l36 12 M50 40 l-36 12" stroke="#d85a5a" strokeWidth="2.5" />
        </>
      );
    case "mic":
      return (
        <>
          {box(32, 60, 14, 14, 3, "#3a3a46")}
          <rect x="31" y="28" width="2.5" height="30" fill="#8a8a96" />
          {ball(32, 22, 9, "#4a4a58")}
        </>
      );
    case "disco":
      return (
        <>
          <rect x="31" y="6" width="2" height="10" fill="#9aa" />
          {ball(32, 26, 14, "#9fb6c8")}
          <path d="M22 18 l20 16 M42 18 l-20 16 M18 26 h28 M32 12 v28" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" />
        </>
      );
    case "crystal":
      return (
        <>
          <polygon points="32,10 46,30 32,56 18,30" fill="#7fcfe0" />
          <polygon points="32,10 46,30 32,40" fill="#a9e6f2" />
          <polygon points="32,10 18,30 32,40" fill="#5fb6cc" />
          <polygon points="32,40 46,30 32,56" fill="#62bccf" />
        </>
      );
    case "star":
      return (
        <>
          <polygon points="32,12 38,28 55,29 41,40 46,56 32,46 18,56 23,40 9,29 26,28" fill="#ffd23a" />
          <polygon points="32,12 38,28 55,29 41,40 32,30" fill="#ffe27a" />
        </>
      );
    case "balloon":
      return (
        <>
          {ball(32, 26, 15, "#ff6ea0")}
          <path d="M32 41 l-2 4 h4Z" fill="#e0567f" />
          <path d="M32 45 q3 9 -2 17" stroke="#cfcfe0" strokeWidth="1.4" fill="none" />
        </>
      );
    case "building":
      return (
        <>
          {box(32, 64, 26, 22, 50, "#3f4670")}
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={20 + c * 7} y={20 + r * 10} width="4.5" height="6" fill={(r + c) % 3 ? "#ffd98a" : "#5a6090"} />
            ))
          )}
        </>
      );
    case "neon":
      return (
        <>
          {box(32, 62, 22, 8, 6, "#2a2a3a")}
          <rect x="14" y="20" width="36" height="26" rx="3" fill="#16161e" />
          <path d="M20 26 q6 -3 0 14" stroke="#ff5ea0" strokeWidth="2.6" fill="none" />
          <path d="M30 26 v14 M30 26 h7" stroke="#46d8c5" strokeWidth="2.6" fill="none" />
          <circle cx="43" cy="32" r="4" fill="none" stroke="#ffd23a" strokeWidth="2.6" />
        </>
      );
    case "column":
      return (
        <>
          {box(32, 62, 22, 14, 5, "#d8cba0")}
          {cyl(32, 56, 8, 36, "#e6dcbe")}
          {box(32, 22, 22, 14, 5, "#d8cba0")}
        </>
      );
    case "cocktail":
      return (
        <>
          {cyl(32, 58, 8, 3, "#cfd6da")}
          <rect x="31" y="40" width="2.5" height="16" fill="#cfd6da" />
          <path d="M20 24 h24 l-12 16Z" fill="#ff8fb0" />
          <path d="M20 24 h24 l-3 4 h-18Z" fill="#ffb0c8" />
          <circle cx="41" cy="22" r="3" fill="#ff5a5a" />
        </>
      );
    case "vinyl":
      return (
        <>
          {box(32, 60, 22, 22, 3, "#2a2a30")}
          <ellipse cx="32" cy="44" rx="16" ry="9" fill="#16161a" />
          <ellipse cx="32" cy="44" rx="6" ry="3.4" fill="#d85a5a" />
          <ellipse cx="32" cy="44" rx="13" ry="7.3" fill="none" stroke="#333" strokeWidth="1" />
        </>
      );
    case "arcade":
      return (
        <>
          {box(32, 62, 22, 16, 42, "#d8484f")}
          <rect x="22" y="20" width="20" height="14" rx="2" fill="#2a2a3a" />
          <rect x="24" y="22" width="16" height="10" fill="#5bc8e0" />
          <circle cx="27" cy="40" r="3" fill="#ffd23a" />
          <rect x="33" y="38" width="8" height="4" rx="2" fill="#3a3a48" />
        </>
      );
    default:
      return box(32, 60, 16, 16, 14, "#9aa0b5");
  }
}
