import type { GenreId } from "./genres";

// 월드 좌표계 (RoomMap과 동일하게 유지)
export const WORLD_W = 1100;
export const WORLD_H = 820;

export interface Decor {
  x: number;
  y: number;
  emoji: string;
  size: number;
  /** true면 바닥 스티커(깊이 정렬 제외, 항상 뒤) */
  flat?: boolean;
}

export interface Scene {
  /** 바닥 그라데이션 */
  floor: [string, string];
  /** 상단 벽/배경 띠 색 */
  wall: string;
  /** 무대(스피커 존이 놓이는) 색 */
  stage: string;
  decor: Decor[];
}

// 장소 컨셉에 맞춘 소품 배치.
const SCENES: Record<GenreId, Scene> = {
  // Late Night Jazz — 자정의 재즈 바, 세피아 무드
  jazz: {
    floor: ["#2a2018", "#3f3024"],
    wall: "#1c1610",
    stage: "#4a3826",
    decor: [
      { x: 200, y: 220, emoji: "🎹", size: 56 },
      { x: 540, y: 180, emoji: "🎷", size: 50 },
      { x: 880, y: 230, emoji: "🎺", size: 46 },
      { x: 150, y: 470, emoji: "🪑", size: 40 },
      { x: 980, y: 470, emoji: "🍸", size: 40 },
      { x: 360, y: 720, emoji: "🥃", size: 38 },
      { x: 720, y: 720, emoji: "🕯️", size: 36 },
      { x: 920, y: 680, emoji: "🎶", size: 34 },
      { x: 120, y: 690, emoji: "🛋️", size: 48 },
    ],
  },
  // City Pop Train — 네온 도시를 달리는 야간 열차
  citypop: {
    floor: ["#241a40", "#3d2a63"],
    wall: "#160f2b",
    stage: "#5a2f7a",
    decor: [
      { x: 150, y: 150, emoji: "🌃", size: 54 },
      { x: 950, y: 150, emoji: "🗼", size: 54 },
      { x: 540, y: 170, emoji: "🚆", size: 60 },
      { x: 120, y: 440, emoji: "🌴", size: 50 },
      { x: 990, y: 440, emoji: "🕶️", size: 38 },
      { x: 220, y: 700, emoji: "🍹", size: 38 },
      { x: 540, y: 730, emoji: "🛵", size: 44 },
      { x: 860, y: 700, emoji: "💿", size: 36 },
      { x: 700, y: 250, emoji: "🌙", size: 40 },
    ],
  },
  // Rainy Lo-fi Room — 빗소리 공부방
  lofi: {
    floor: ["#22304d", "#33456b"],
    wall: "#18233a",
    stage: "#3a4f7a",
    decor: [
      { x: 180, y: 200, emoji: "🪟", size: 56 },
      { x: 540, y: 170, emoji: "☔", size: 44 },
      { x: 900, y: 210, emoji: "🪴", size: 50 },
      { x: 140, y: 470, emoji: "📚", size: 44 },
      { x: 990, y: 470, emoji: "☕", size: 38 },
      { x: 230, y: 700, emoji: "🛋️", size: 52 },
      { x: 560, y: 730, emoji: "🐱", size: 38 },
      { x: 840, y: 700, emoji: "🧸", size: 38 },
      { x: 720, y: 250, emoji: "🎧", size: 38 },
    ],
  },
  // Disco Rooftop — 루프탑 하우스 파티
  house: {
    floor: ["#0f2a33", "#15414a"],
    wall: "#0a1c22",
    stage: "#1f6f68",
    decor: [
      { x: 540, y: 120, emoji: "🪩", size: 66 },
      { x: 180, y: 220, emoji: "🔊", size: 50 },
      { x: 900, y: 220, emoji: "🔊", size: 50 },
      { x: 140, y: 470, emoji: "🍸", size: 38 },
      { x: 980, y: 470, emoji: "🎛️", size: 44 },
      { x: 260, y: 700, emoji: "🕺", size: 46 },
      { x: 800, y: 700, emoji: "💃", size: 46 },
      { x: 540, y: 730, emoji: "✨", size: 40 },
    ],
  },
  // K-Pop Stage — 아이돌 무대 백스테이지
  kpop: {
    floor: ["#3a1838", "#5e2752"],
    wall: "#260f24",
    stage: "#8e3a78",
    decor: [
      { x: 540, y: 130, emoji: "🎤", size: 58 },
      { x: 200, y: 200, emoji: "💡", size: 44 },
      { x: 880, y: 200, emoji: "💡", size: 44 },
      { x: 130, y: 470, emoji: "🎀", size: 40 },
      { x: 990, y: 470, emoji: "📣", size: 40 },
      { x: 260, y: 710, emoji: "💖", size: 42 },
      { x: 800, y: 710, emoji: "🌟", size: 42 },
      { x: 540, y: 730, emoji: "🪅", size: 40 },
    ],
  },
  // Antique Hall — 금빛 클래식 연주회장
  classical: {
    floor: ["#2b2620", "#473d2c"],
    wall: "#1e1a14",
    stage: "#6e5a36",
    decor: [
      { x: 200, y: 200, emoji: "🏛️", size: 56 },
      { x: 880, y: 200, emoji: "🏛️", size: 56 },
      { x: 540, y: 160, emoji: "🎻", size: 50 },
      { x: 150, y: 470, emoji: "🕯️", size: 40 },
      { x: 980, y: 470, emoji: "🌹", size: 38 },
      { x: 300, y: 720, emoji: "🎼", size: 40 },
      { x: 760, y: 720, emoji: "🎹", size: 46 },
      { x: 540, y: 730, emoji: "👑", size: 38 },
    ],
  },
  // Metal — 어두운 라이브 하우스
  metal: {
    floor: ["#161620", "#28283a"],
    wall: "#0e0e16",
    stage: "#3a3a52",
    decor: [
      { x: 540, y: 140, emoji: "🤘", size: 56 },
      { x: 180, y: 210, emoji: "🎸", size: 50 },
      { x: 900, y: 210, emoji: "🥁", size: 48 },
      { x: 150, y: 470, emoji: "⚡", size: 40 },
      { x: 990, y: 470, emoji: "🔥", size: 40 },
      { x: 300, y: 720, emoji: "💀", size: 40 },
      { x: 760, y: 720, emoji: "⛓️", size: 38 },
    ],
  },
  // R&B — 보랏빛 라운지
  rnb: {
    floor: ["#2d1b3d", "#492c63"],
    wall: "#1d1129",
    stage: "#6b4a82",
    decor: [
      { x: 540, y: 160, emoji: "🎙️", size: 50 },
      { x: 200, y: 210, emoji: "🍷", size: 42 },
      { x: 900, y: 210, emoji: "🪞", size: 44 },
      { x: 150, y: 470, emoji: "🕯️", size: 38 },
      { x: 980, y: 470, emoji: "🥂", size: 38 },
      { x: 280, y: 710, emoji: "🛋️", size: 50 },
      { x: 800, y: 710, emoji: "🌙", size: 40 },
    ],
  },
};

export function sceneFor(genre: GenreId): Scene {
  return SCENES[genre] ?? SCENES.lofi;
}
