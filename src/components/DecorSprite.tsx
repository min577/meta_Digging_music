"use client";

// 이모지 대신 쓰는 SVG 소품 일러스트. viewBox 0 0 64 64, 바닥 중앙(=32,60) 기준.
export type DecorKind =
  | "plant"
  | "tree"
  | "palm"
  | "sofa"
  | "chair"
  | "bed"
  | "table"
  | "lamp"
  | "floorlamp"
  | "tv"
  | "painting"
  | "bookshelf"
  | "window"
  | "cushion"
  | "candle"
  | "lantern"
  | "fountain"
  | "speaker"
  | "piano"
  | "guitar"
  | "drum"
  | "mic"
  | "disco"
  | "crystal"
  | "star"
  | "balloon"
  | "building"
  | "neon"
  | "column"
  | "cocktail"
  | "vinyl"
  | "arcade";

export const DECOR_LABEL: Record<DecorKind, string> = {
  plant: "화분", tree: "나무", palm: "야자수", sofa: "소파", chair: "의자",
  bed: "침대", table: "테이블", lamp: "램프", floorlamp: "플로어램프", tv: "TV",
  painting: "액자", bookshelf: "책장", window: "창문", cushion: "쿠션", candle: "촛불",
  lantern: "랜턴", fountain: "분수", speaker: "스피커", piano: "피아노", guitar: "기타",
  drum: "드럼", mic: "마이크", disco: "디스코볼", crystal: "크리스탈", star: "별",
  balloon: "풍선", building: "빌딩", neon: "네온사인", column: "기둥", cocktail: "칵테일",
  vinyl: "LP", arcade: "오락기",
};

export default function DecorSprite({
  kind,
  size = 56,
}: {
  kind: DecorKind;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="block">
      {SPRITES[kind] ?? SPRITES.plant}
    </svg>
  );
}

const SPRITES: Record<DecorKind, JSX.Element> = {
  plant: (
    <g>
      <path d="M32 44 C20 40 18 24 26 18 C28 28 32 30 32 36 C32 30 36 28 38 18 C46 24 44 40 32 44Z" fill="#4caf6e" />
      <path d="M24 44 h16 l-2 14 h-12Z" fill="#c9794a" />
      <rect x="22" y="42" width="20" height="4" rx="2" fill="#e0905c" />
    </g>
  ),
  tree: (
    <g>
      <rect x="29" y="40" width="6" height="18" fill="#7a5230" />
      <circle cx="32" cy="28" r="16" fill="#4f9d62" />
      <circle cx="22" cy="32" r="10" fill="#5cae70" />
      <circle cx="42" cy="32" r="10" fill="#458a58" />
    </g>
  ),
  palm: (
    <g>
      <path d="M30 24 q4 30 2 34 h4 q-2-4 2-34Z" fill="#9a6b3c" />
      <path d="M32 22 q-18 -2 -22 6 q14 -2 22 2Z" fill="#3fae6a" />
      <path d="M32 22 q18 -2 22 6 q-14 -2 -22 2Z" fill="#359a5c" />
      <path d="M32 22 q-6 -16 -16 -16 q8 8 12 18Z" fill="#4fbe76" />
      <path d="M32 22 q6 -16 16 -16 q-8 8 -12 18Z" fill="#4fbe76" />
    </g>
  ),
  sofa: (
    <g>
      <rect x="10" y="30" width="44" height="20" rx="6" fill="#6b6fb0" />
      <rect x="12" y="24" width="40" height="16" rx="6" fill="#8186c8" />
      <rect x="8" y="32" width="10" height="22" rx="5" fill="#6b6fb0" />
      <rect x="46" y="32" width="10" height="22" rx="5" fill="#6b6fb0" />
      <rect x="18" y="44" width="28" height="10" fill="#5a5e98" />
    </g>
  ),
  chair: (
    <g>
      <rect x="22" y="18" width="20" height="22" rx="4" fill="#b5654a" />
      <rect x="20" y="36" width="24" height="8" rx="3" fill="#c9794a" />
      <rect x="22" y="44" width="4" height="12" fill="#8a4a32" />
      <rect x="38" y="44" width="4" height="12" fill="#8a4a32" />
    </g>
  ),
  bed: (
    <g>
      <rect x="10" y="34" width="44" height="18" rx="4" fill="#c98aa6" />
      <rect x="10" y="26" width="10" height="26" rx="3" fill="#9c5f7c" />
      <rect x="22" y="30" width="16" height="10" rx="4" fill="#fff" />
      <rect x="20" y="38" width="32" height="14" rx="3" fill="#e7b3c8" />
    </g>
  ),
  table: (
    <g>
      <rect x="14" y="30" width="36" height="7" rx="3" fill="#caa472" />
      <rect x="18" y="36" width="4" height="18" fill="#9c7c4a" />
      <rect x="42" y="36" width="4" height="18" fill="#9c7c4a" />
    </g>
  ),
  lamp: (
    <g>
      <path d="M22 26 h20 l-4 12 h-12Z" fill="#ffd98a" />
      <rect x="30" y="38" width="4" height="14" fill="#8a7a5a" />
      <rect x="24" y="52" width="16" height="4" rx="2" fill="#6a5c40" />
    </g>
  ),
  floorlamp: (
    <g>
      <path d="M24 12 h16 l-3 12 h-10Z" fill="#ffe2a0" />
      <rect x="31" y="24" width="2.5" height="30" fill="#7a6c50" />
      <rect x="24" y="54" width="16" height="4" rx="2" fill="#6a5c40" />
    </g>
  ),
  tv: (
    <g>
      <rect x="12" y="20" width="40" height="26" rx="3" fill="#23232e" />
      <rect x="15" y="23" width="34" height="20" rx="2" fill="#5bc8e0" />
      <rect x="26" y="46" width="12" height="6" fill="#3a3a48" />
      <rect x="20" y="52" width="24" height="4" rx="2" fill="#23232e" />
    </g>
  ),
  painting: (
    <g>
      <rect x="16" y="16" width="32" height="26" rx="2" fill="#caa472" />
      <rect x="20" y="20" width="24" height="18" fill="#7fb5d8" />
      <path d="M20 38 l8 -10 6 6 5 -7 5 11Z" fill="#5a8a5c" />
      <circle cx="40" cy="25" r="3" fill="#ffe08a" />
    </g>
  ),
  bookshelf: (
    <g>
      <rect x="16" y="14" width="32" height="42" rx="2" fill="#8a5e3a" />
      <rect x="19" y="17" width="26" height="10" fill="#6a4628" />
      <rect x="19" y="29" width="26" height="10" fill="#6a4628" />
      <rect x="21" y="18" width="4" height="8" fill="#d85a5a" />
      <rect x="26" y="18" width="4" height="8" fill="#5a9ad8" />
      <rect x="31" y="18" width="4" height="8" fill="#5ad88a" />
      <rect x="21" y="30" width="4" height="8" fill="#d8c25a" />
      <rect x="27" y="30" width="4" height="8" fill="#b05ad8" />
    </g>
  ),
  window: (
    <g>
      <rect x="14" y="12" width="36" height="40" rx="3" fill="#7a5230" />
      <rect x="17" y="15" width="30" height="34" fill="#8fd0ec" />
      <path d="M17 40 l10 -10 8 7 12 -12 v24 h-30Z" fill="#bfe6f4" opacity="0.6" />
      <rect x="30" y="15" width="3" height="34" fill="#7a5230" />
      <rect x="17" y="30" width="30" height="3" fill="#7a5230" />
    </g>
  ),
  cushion: (
    <g>
      <rect x="18" y="36" width="28" height="18" rx="8" fill="#e08a6a" />
      <circle cx="32" cy="45" r="3" fill="#c96a4a" />
    </g>
  ),
  candle: (
    <g>
      <rect x="28" y="34" width="8" height="20" rx="2" fill="#f0e6d2" />
      <ellipse cx="32" cy="34" rx="4" ry="2" fill="#fff" />
      <path d="M32 24 q4 5 0 10 q-4 -5 0 -10Z" fill="#ffb13a" />
      <circle cx="32" cy="30" r="2.4" fill="#ffe08a" />
    </g>
  ),
  lantern: (
    <g>
      <rect x="30" y="10" width="4" height="6" fill="#5a4632" />
      <rect x="22" y="16" width="20" height="26" rx="6" fill="#d8632e" />
      <rect x="25" y="20" width="14" height="18" rx="3" fill="#ffd07a" />
      <rect x="28" y="42" width="8" height="4" fill="#5a4632" />
    </g>
  ),
  fountain: (
    <g>
      <ellipse cx="32" cy="50" rx="22" ry="7" fill="#6aa6c8" />
      <ellipse cx="32" cy="48" rx="22" ry="6" fill="#8fc6e0" />
      <rect x="30" y="30" width="4" height="18" fill="#cfd6da" />
      <ellipse cx="32" cy="30" rx="9" ry="3.5" fill="#aebec6" />
      <path d="M32 22 q-6 4 0 8 q6 -4 0 -8Z" fill="#bfe6f4" />
    </g>
  ),
  speaker: (
    <g>
      <rect x="20" y="14" width="24" height="42" rx="4" fill="#2a2a34" />
      <circle cx="32" cy="40" r="9" fill="#4a4a5a" />
      <circle cx="32" cy="40" r="4" fill="#1a1a22" />
      <circle cx="32" cy="23" r="4" fill="#4a4a5a" />
    </g>
  ),
  piano: (
    <g>
      <rect x="12" y="26" width="40" height="22" rx="3" fill="#23232a" />
      <rect x="14" y="40" width="36" height="10" fill="#fff" />
      <rect x="17" y="40" width="2.5" height="7" fill="#23232a" />
      <rect x="23" y="40" width="2.5" height="7" fill="#23232a" />
      <rect x="33" y="40" width="2.5" height="7" fill="#23232a" />
      <rect x="39" y="40" width="2.5" height="7" fill="#23232a" />
      <rect x="45" y="40" width="2.5" height="7" fill="#23232a" />
    </g>
  ),
  guitar: (
    <g>
      <circle cx="28" cy="42" r="13" fill="#c66a2e" />
      <circle cx="28" cy="42" r="5" fill="#5a3318" />
      <rect x="33" y="10" width="5" height="30" rx="2" transform="rotate(20 35 25)" fill="#7a4a28" />
    </g>
  ),
  drum: (
    <g>
      <ellipse cx="32" cy="46" rx="20" ry="7" fill="#c4ccd2" />
      <rect x="12" y="30" width="40" height="16" fill="#e0e6ea" />
      <ellipse cx="32" cy="30" rx="20" ry="7" fill="#fff" />
      <path d="M14 32 l36 12 M50 32 l-36 12" stroke="#d85a5a" strokeWidth="2" />
    </g>
  ),
  mic: (
    <g>
      <rect x="29" y="30" width="6" height="22" rx="3" fill="#8a8a96" />
      <rect x="24" y="50" width="16" height="4" rx="2" fill="#5a5a66" />
      <rect x="24" y="12" width="16" height="22" rx="8" fill="#3a3a46" />
      <path d="M26 18 h12 M26 23 h12 M26 28 h12" stroke="#6a6a78" strokeWidth="1.5" />
    </g>
  ),
  disco: (
    <g>
      <rect x="31" y="4" width="2" height="10" fill="#9aa" />
      <circle cx="32" cy="26" r="14" fill="#9fb6c8" />
      <path d="M22 18 l20 16 M42 18 l-20 16 M18 26 h28 M32 12 v28" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" />
      <circle cx="26" cy="22" r="2.5" fill="#fff" />
      <circle cx="38" cy="30" r="2.5" fill="#cfe" />
    </g>
  ),
  crystal: (
    <g>
      <path d="M32 12 l12 16 -12 24 -12 -24Z" fill="#8fd6e6" />
      <path d="M32 12 l12 16 -12 8Z" fill="#bfeaf4" />
      <path d="M32 12 l-12 16 12 8Z" fill="#6cc0d6" />
    </g>
  ),
  star: (
    <g>
      <path d="M32 12 l6 14 15 1 -11 10 4 15 -14 -8 -14 8 4 -15 -11 -10 15 -1Z" fill="#ffd23a" />
    </g>
  ),
  balloon: (
    <g>
      <ellipse cx="32" cy="24" rx="13" ry="16" fill="#ff6ea0" />
      <path d="M32 40 l-2 4 h4Z" fill="#ff6ea0" />
      <path d="M32 44 q3 8 -2 14" stroke="#cfa" strokeWidth="1.5" fill="none" />
      <ellipse cx="27" cy="18" rx="3" ry="5" fill="#fff" opacity="0.5" />
    </g>
  ),
  building: (
    <g>
      <rect x="16" y="10" width="32" height="46" fill="#3a3f6e" />
      <g fill="#ffd98a">
        <rect x="20" y="14" width="5" height="5" /><rect x="29" y="14" width="5" height="5" /><rect x="38" y="14" width="5" height="5" />
        <rect x="20" y="23" width="5" height="5" /><rect x="38" y="23" width="5" height="5" />
        <rect x="20" y="32" width="5" height="5" /><rect x="29" y="32" width="5" height="5" /><rect x="38" y="32" width="5" height="5" />
        <rect x="29" y="41" width="5" height="5" />
      </g>
    </g>
  ),
  neon: (
    <g>
      <rect x="14" y="16" width="36" height="24" rx="3" fill="#1a1a2e" />
      <path d="M20 22 q6 -4 0 12" stroke="#ff5ea0" strokeWidth="2.5" fill="none" />
      <path d="M30 22 v12 M30 22 h7" stroke="#46d8c5" strokeWidth="2.5" fill="none" />
      <circle cx="43" cy="28" r="4" fill="none" stroke="#ffd23a" strokeWidth="2.5" />
      <rect x="31" y="40" width="2" height="14" fill="#444" />
    </g>
  ),
  column: (
    <g>
      <rect x="22" y="12" width="20" height="6" rx="1" fill="#d8cba0" />
      <rect x="24" y="18" width="16" height="34" fill="#e6dcbe" />
      <path d="M27 18 v34 M32 18 v34 M37 18 v34" stroke="#cabf94" strokeWidth="1.5" />
      <rect x="20" y="52" width="24" height="6" rx="1" fill="#d8cba0" />
    </g>
  ),
  cocktail: (
    <g>
      <path d="M20 24 h24 l-12 14Z" fill="#ff8fb0" />
      <rect x="30" y="38" width="4" height="14" fill="#cfd6da" />
      <ellipse cx="32" cy="52" rx="8" ry="3" fill="#cfd6da" />
      <circle cx="40" cy="22" r="3" fill="#ff5a5a" />
      <rect x="38" y="14" width="1.5" height="8" fill="#5a9a4a" />
    </g>
  ),
  vinyl: (
    <g>
      <circle cx="32" cy="36" r="18" fill="#1a1a1a" />
      <circle cx="32" cy="36" r="7" fill="#d85a5a" />
      <circle cx="32" cy="36" r="2" fill="#1a1a1a" />
      <circle cx="32" cy="36" r="13" fill="none" stroke="#333" strokeWidth="1" />
    </g>
  ),
  arcade: (
    <g>
      <rect x="18" y="14" width="28" height="42" rx="4" fill="#d8484f" />
      <rect x="22" y="18" width="20" height="14" rx="2" fill="#2a2a3a" />
      <rect x="24" y="20" width="16" height="10" fill="#5bc8e0" />
      <circle cx="27" cy="40" r="3" fill="#ffd23a" />
      <rect x="34" y="38" width="8" height="4" rx="2" fill="#3a3a48" />
    </g>
  ),
};
