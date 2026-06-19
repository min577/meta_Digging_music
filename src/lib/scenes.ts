import type { GenreId } from "./genres";
import type { DecorKind } from "@/components/DecorSprite";

// 월드 좌표계 — 넉넉한 공간 (레이아웃은 1000×720 기준으로 작성 후 placeScene에서 스케일)
export const WORLD_W = 1720;
export const WORLD_H = 1220;

export type FloorType = "wood" | "grass" | "tile" | "neon" | "dark";

export interface Decor {
  x: number;
  y: number;
  kind: DecorKind;
  size: number;
  rot?: number; // y축 회전(라디안)
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
  kinds: DecorKind[];
}

const CFG: Record<GenreId, Cfg> = {
  kpop: {
    floor: ["#3a1838", "#5e2752"],
    wall: "#260f24",
    stage: "#8e3a78",
    floorType: "tile",
    kinds: ["mic", "star", "balloon", "speaker", "painting", "star", "balloon", "mic", "crystal", "star", "balloon", "mic"],
  },
  hiphop: {
    floor: ["#241c12", "#3f3220"],
    wall: "#16110a",
    stage: "#6a4a1e",
    floorType: "neon",
    kinds: ["speaker", "vinyl", "mic", "crystal", "sofa", "star", "speaker", "vinyl", "neon", "mic", "cocktail", "star"],
  },
  rnb: {
    floor: ["#2d1b3d", "#492c63"],
    wall: "#1d1129",
    stage: "#6b4a82",
    floorType: "tile",
    kinds: ["mic", "cocktail", "sofa", "candle", "lamp", "painting", "vinyl", "crystal", "sofa", "candle", "lamp", "mic"],
  },
  ballad: {
    floor: ["#22304d", "#33456b"],
    wall: "#18233a",
    stage: "#3a4f7a",
    floorType: "tile",
    kinds: ["mic", "sofa", "lamp", "candle", "painting", "floorlamp", "plant", "cushion", "window", "lamp", "candle", "mic"],
  },
  indie: {
    floor: ["#1f3a2a", "#2f5a40"],
    wall: "#15291d",
    stage: "#3f7a52",
    floorType: "wood",
    kinds: ["guitar", "plant", "sofa", "lamp", "vinyl", "painting", "table", "cushion", "plant", "floorlamp", "candle", "guitar"],
  },
  pop: {
    floor: ["#3a2030", "#5e2f44"],
    wall: "#260f1c",
    stage: "#a8455e",
    floorType: "tile",
    kinds: ["speaker", "star", "balloon", "mic", "tv", "crystal", "star", "balloon", "speaker", "mic", "star", "balloon"],
  },
  edm: {
    floor: ["#0f2a33", "#15414a"],
    wall: "#0a1c22",
    stage: "#1f6f68",
    floorType: "neon",
    kinds: ["disco", "speaker", "speaker", "cocktail", "crystal", "star", "vinyl", "balloon", "disco", "speaker", "star", "cocktail"],
  },
  citypop: {
    floor: ["#241a40", "#3d2a63"],
    wall: "#160f2b",
    stage: "#5a2f7a",
    floorType: "neon",
    kinds: ["building", "neon", "palm", "tv", "speaker", "crystal", "vinyl", "balloon", "building", "neon", "star", "cocktail"],
  },
};

export function sceneFor(genre: GenreId): Scene {
  const c = CFG[genre] ?? CFG.pop;
  return {
    floor: c.floor,
    wall: c.wall,
    stage: c.stage,
    floorType: c.floorType,
    decor: POS.map(([x, y, size], i) => ({
      x,
      y,
      size,
      kind: c.kinds[i % c.kinds.length],
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
