import type { GenreId } from "./genres";

// 월드 좌표계 (RoomMap과 동일하게 유지) — 넓은 공간
export const WORLD_W = 1400;
export const WORLD_H = 1000;

export type FloorType = "wood" | "grass" | "tile" | "neon" | "dark";

export interface Decor {
  x: number;
  y: number;
  emoji: string;
  size: number;
}

export interface Scene {
  floor: [string, string];
  wall: string;
  stage: string;
  floorType: FloorType;
  decor: Decor[];
}

// 소품 배치 좌표 템플릿 (월드 전반에 흩뿌림, 중앙 스폰/무대는 비움)
const POS: [number, number, number][] = [
  [210, 250, 58],
  [430, 210, 50],
  [980, 210, 50],
  [1190, 250, 58],
  [160, 560, 46],
  [1250, 560, 46],
  [250, 860, 52],
  [540, 905, 40],
  [880, 905, 40],
  [1170, 860, 52],
  [700, 300, 48],
  [700, 660, 44],
];

interface Cfg {
  floor: [string, string];
  wall: string;
  stage: string;
  floorType: FloorType;
  emojis: string[];
}

const CFG: Record<GenreId, Cfg> = {
  jazz: {
    floor: ["#2a2018", "#3f3024"],
    wall: "#1c1610",
    stage: "#4a3826",
    floorType: "wood",
    emojis: ["🎹", "🎷", "🎺", "🍸", "🥃", "🪑", "🕯️", "🛋️", "🎶", "🎙️", "🌙", "🎵"],
  },
  citypop: {
    floor: ["#241a40", "#3d2a63"],
    wall: "#160f2b",
    stage: "#5a2f7a",
    floorType: "neon",
    emojis: ["🌃", "🗼", "🚆", "🌴", "🍹", "🛵", "💿", "🕶️", "🌆", "🎐", "🌙", "🎵"],
  },
  lofi: {
    floor: ["#22304d", "#33456b"],
    wall: "#18233a",
    stage: "#3a4f7a",
    floorType: "wood",
    emojis: ["🪟", "☔", "🪴", "📚", "☕", "🛋️", "🐱", "🧸", "🕯️", "🎧", "🌙", "🎵"],
  },
  house: {
    floor: ["#0f2a33", "#15414a"],
    wall: "#0a1c22",
    stage: "#1f6f68",
    floorType: "neon",
    emojis: ["🪩", "🔊", "🔊", "🍸", "🎛️", "🕺", "💃", "✨", "🌈", "💿", "🔆", "🎵"],
  },
  kpop: {
    floor: ["#3a1838", "#5e2752"],
    wall: "#260f24",
    stage: "#8e3a78",
    floorType: "tile",
    emojis: ["🎤", "💡", "💡", "🎀", "📣", "💖", "🌟", "🪅", "🩷", "💫", "🎶", "🎵"],
  },
  classical: {
    floor: ["#2b2620", "#473d2c"],
    wall: "#1e1a14",
    stage: "#6e5a36",
    floorType: "tile",
    emojis: ["🏛️", "🏛️", "🎻", "🎼", "🕯️", "🌹", "🎹", "👑", "🕰️", "📜", "🎶", "🎵"],
  },
  metal: {
    floor: ["#161620", "#28283a"],
    wall: "#0e0e16",
    stage: "#3a3a52",
    floorType: "dark",
    emojis: ["🤘", "🎸", "🥁", "⚡", "🔥", "💀", "⛓️", "🖤", "🦂", "🪨", "🎶", "🎵"],
  },
  rnb: {
    floor: ["#2d1b3d", "#492c63"],
    wall: "#1d1129",
    stage: "#6b4a82",
    floorType: "tile",
    emojis: ["🎙️", "🍷", "🪞", "🕯️", "🥂", "🛋️", "🌙", "💜", "✨", "🌃", "🎶", "🎵"],
  },
};

export function sceneFor(genre: GenreId): Scene {
  const c = CFG[genre] ?? CFG.lofi;
  return {
    floor: c.floor,
    wall: c.wall,
    stage: c.stage,
    floorType: c.floorType,
    decor: POS.map(([x, y, size], i) => ({
      x,
      y,
      size,
      emoji: c.emojis[i % c.emojis.length],
    })),
  };
}

// 바닥 타입별 CSS 패턴 (RoomMap에서 사용)
export function floorPattern(type: FloorType): {
  backgroundImage: string;
  backgroundSize: string;
} {
  switch (type) {
    case "wood":
      return {
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 96px), repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0 1px, transparent 1px 40px)",
        backgroundSize: "96px 40px",
      };
    case "grass":
      return {
        backgroundImage:
          "repeating-conic-gradient(rgba(255,255,255,0.05) 0% 25%, transparent 0% 50%)",
        backgroundSize: "80px 80px",
      };
    case "tile":
      return {
        backgroundImage:
          "linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%), linear-gradient(45deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.06) 75%)",
        backgroundSize: "90px 90px",
      };
    case "neon":
      return {
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
        backgroundSize: "70px 70px",
      };
    default:
      return {
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      };
  }
}
