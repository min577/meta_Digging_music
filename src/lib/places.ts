import type { GenreId } from "./genres";
import type { DecorKind } from "@/components/DecorSprite";
import { WORLD_W, WORLD_H, type Decor, type FloorType } from "./scenes";

// 실제 청취 "상황" 기반 장소. 각 장소는 고유 3D 환경 + 실제 음악(검색어)을 가진다.
export type PlaceId = "gym" | "library" | "hanriver" | "airplane" | "city" | "cafe";
export type EnvType = "indoor" | "water" | "sky" | "skyline" | "cabin";

export interface ZoneCfg {
  label: string;
  genre: GenreId; // 색/무드
  term: string; // iTunes 실제 검색어
}

export interface Place {
  id: PlaceId;
  name: string;
  emoji: string;
  theme: string;
  situations: string[]; // 온보딩 상황과 매칭
  vibeGenre: GenreId; // 추천/홈 필터/색
  floor: [string, string];
  wall: string;
  stage: string;
  floorType: FloorType;
  env: EnvType;
  decorKinds: DecorKind[]; // 배경 소품 (POS에 매핑)
  zones: ZoneCfg[]; // 음악 존(실제 곡)
}

// 배경 소품 배치 좌표 (월드 1400x1000) — 격자+지터로 빽빽하게. 중앙 스폰 영역은 비움.
const POS: [number, number][] = (() => {
  const out: [number, number][] = [];
  const cols = 6, rows = 5;
  for (let gx = 0; gx < cols; gx++) {
    for (let gz = 0; gz < rows; gz++) {
      const jx = Math.sin(gx * 12.9 + gz * 4.1) * 45;
      const jz = Math.sin(gx * 3.7 + gz * 7.3) * 40;
      const x = 90 + gx * ((WORLD_W - 180) / (cols - 1)) + jx;
      const y = 120 + gz * ((WORLD_H - 220) / (rows - 1)) + jz;
      // 중앙 스폰 영역 회피
      if (x > WORLD_W * 0.36 && x < WORLD_W * 0.64 && y > WORLD_H * 0.4 && y < WORLD_H * 0.72) continue;
      out.push([Math.round(x), Math.round(y)]);
    }
  }
  return out;
})();

const PLACES: Record<PlaceId, Place> = {
  gym: {
    id: "gym",
    name: "한밤의 헬스장",
    emoji: "🏋️",
    theme: "운동할 때 듣는 하이텐션 플레이리스트",
    situations: ["운동할 때", "기분 전환"],
    vibeGenre: "house",
    floor: ["#23272f", "#333a45"],
    wall: "#171a20",
    stage: "#46505e",
    floorType: "tile",
    env: "indoor",
    decorKinds: ["treadmill", "dumbbell", "bench", "locker", "mirror", "plant", "treadmill", "dumbbell", "bench", "speaker", "locker", "mirror", "dumbbell", "treadmill", "bench", "plant"],
    zones: [
      { label: "운동 부스트", genre: "house", term: "workout hype edm" },
      { label: "런닝 하이", genre: "kpop", term: "k-pop dance hits" },
      { label: "헬스 힙합", genre: "rnb", term: "hip hop workout" },
    ],
  },
  library: {
    id: "library",
    name: "조용한 도서관",
    emoji: "📚",
    theme: "공부·집중할 때 ASMR과 잔잔한 음악",
    situations: ["공부할 때", "작업/집중"],
    vibeGenre: "lofi",
    floor: ["#3a2e22", "#54402e"],
    wall: "#241b12",
    stage: "#6e5234",
    floorType: "wood",
    env: "indoor",
    decorKinds: ["bookshelf", "desk", "globe", "bookshelf", "lamp", "plant", "bookshelf", "desk", "candle", "bookshelf", "painting", "desk", "bookshelf", "lamp", "globe", "bookshelf"],
    zones: [
      { label: "집중 로파이", genre: "lofi", term: "study lofi beats" },
      { label: "빗소리 ASMR", genre: "lofi", term: "rain ambience sleep" },
      { label: "피아노 자습", genre: "classical", term: "study piano calm" },
    ],
  },
  hanriver: {
    id: "hanriver",
    name: "한강 밤 산책",
    emoji: "🌉",
    theme: "감성 발라드와 함께하는 한강의 밤",
    situations: ["자기 전", "기분 전환"],
    vibeGenre: "rnb",
    floor: ["#16402e", "#235640"],
    wall: "#0e1c2a",
    stage: "#2f5a4a",
    floorType: "grass",
    env: "water",
    decorKinds: ["bench", "streetlamp", "tree", "bicycle", "bench", "streetlamp", "tent", "tree", "plant", "streetlamp", "bench", "tree", "fountain", "streetlamp", "bench", "tree"],
    zones: [
      { label: "한강 발라드", genre: "rnb", term: "korean ballad" },
      { label: "감성 인디", genre: "lofi", term: "korean indie acoustic" },
      { label: "새벽 감성", genre: "rnb", term: "korean r&b soul" },
    ],
  },
  airplane: {
    id: "airplane",
    name: "여행 가는 비행기",
    emoji: "✈️",
    theme: "세계 여행을 떠나는 기내 플레이리스트",
    situations: ["출퇴근길", "드라이브"],
    vibeGenre: "citypop",
    floor: ["#3a3f4a", "#4a505e"],
    wall: "#23262e",
    stage: "#5a6270",
    floorType: "tile",
    env: "cabin",
    decorKinds: ["planeseat"],
    zones: [
      { label: "여행 팝", genre: "citypop", term: "travel pop summer" },
      { label: "세계음악", genre: "house", term: "world music tropical house" },
      { label: "로드트립", genre: "kpop", term: "road trip hits" },
    ],
  },
  city: {
    id: "city",
    name: "도시 야경 드라이브",
    emoji: "🌃",
    theme: "네온 도시를 달리는 시티팝·드라이브",
    situations: ["드라이브", "출퇴근길"],
    vibeGenre: "citypop",
    floor: ["#241a40", "#3d2a63"],
    wall: "#120c24",
    stage: "#5a2f7a",
    floorType: "neon",
    env: "skyline",
    decorKinds: ["building", "neon", "streetlamp", "car", "building", "neon", "building", "streetlamp", "car", "neon", "building", "streetlamp", "building", "car", "neon", "building"],
    zones: [
      { label: "시티팝", genre: "citypop", term: "city pop japanese" },
      { label: "나이트 드라이브", genre: "house", term: "night drive synthwave" },
      { label: "도시 힙합", genre: "rnb", term: "korean hip hop" },
    ],
  },
  cafe: {
    id: "cafe",
    name: "골목 카페",
    emoji: "☕",
    theme: "여유로운 오후, 카페의 잔잔한 음악",
    situations: ["작업/집중", "기분 전환"],
    vibeGenre: "jazz",
    floor: ["#2e241a", "#473522"],
    wall: "#201810",
    stage: "#6e5234",
    floorType: "wood",
    env: "indoor",
    decorKinds: ["table", "chair", "counter", "plant", "table", "chair", "painting", "candle", "table", "chair", "bookshelf", "plant", "table", "chair", "candle", "counter"],
    zones: [
      { label: "카페 재즈", genre: "jazz", term: "cafe jazz bossa nova" },
      { label: "어쿠스틱", genre: "lofi", term: "acoustic cafe chill" },
      { label: "보사노바", genre: "jazz", term: "bossa nova" },
    ],
  },
};

export const PLACE_LIST: Place[] = Object.values(PLACES);

export function place(id: PlaceId): Place {
  return PLACES[id] ?? PLACES.cafe;
}

// ---- 구조적 레이아웃 헬퍼 (월드 1000x720) ----
const W = WORLD_W, H = WORLD_H;
const HALF = Math.PI / 2;
type D = Decor;
const rowX = (kind: DecorKind, x0: number, x1: number, y: number, n: number, size = 56, rot = 0): D[] =>
  Array.from({ length: n }, (_, i) => ({ kind, x: Math.round(x0 + (x1 - x0) * (n <= 1 ? 0.5 : i / (n - 1))), y, size, rot }));
const colY = (kind: DecorKind, y0: number, y1: number, x: number, n: number, size = 56, rot = 0): D[] =>
  Array.from({ length: n }, (_, i) => ({ kind, x, y: Math.round(y0 + (y1 - y0) * (n <= 1 ? 0.5 : i / (n - 1))), size, rot }));
const corners = (kind: DecorKind, size = 48): D[] =>
  ([[80, 110], [W - 80, 110], [80, H - 110], [W - 80, H - 110]] as const).map(([x, y]) => ({ kind, x, y, size }));
const tableSet = (x: number, y: number): D[] => [
  { kind: "table", x, y, size: 54 },
  { kind: "chair", x: x - 48, y, size: 46, rot: HALF },
  { kind: "chair", x: x + 48, y, size: 46, rot: -HALF },
];

// 장소별 구조적 배치
function layoutFor(id: PlaceId): D[] {
  switch (id) {
    case "cafe":
      return [
        ...rowX("counter", 270, 730, 95, 3, 70),
        ...rowX("painting", 200, 800, 55, 3, 44),
        ...tableSet(290, 320), ...tableSet(500, 320), ...tableSet(710, 320),
        ...tableSet(390, 510), ...tableSet(610, 510),
        ...corners("plant", 46),
      ];
    case "library":
      return [
        ...rowX("bookshelf", 170, 830, 80, 5, 78),
        ...colY("bookshelf", 210, 540, 90, 3, 72, HALF),
        ...colY("bookshelf", 210, 540, W - 90, 3, 72, -HALF),
        ...tableSet(360, 340), ...tableSet(640, 340), ...tableSet(500, 520),
        { kind: "lamp", x: 360, y: 300, size: 38 }, { kind: "lamp", x: 640, y: 300, size: 38 },
        ...corners("plant", 44),
      ];
    case "gym":
      return [
        ...rowX("treadmill", 220, 780, 105, 4, 58),
        ...colY("locker", 220, 520, W - 85, 3, 62, -HALF),
        { kind: "mirror", x: 85, y: 360, size: 72, rot: HALF },
        ...rowX("bench", 260, 740, 360, 3, 50),
        { kind: "dumbbell", x: 300, y: 430, size: 38 }, { kind: "dumbbell", x: 500, y: 430, size: 38 }, { kind: "dumbbell", x: 700, y: 430, size: 38 },
        ...rowX("plant", 160, 840, 640, 2, 44),
      ];
    case "hanriver":
      return [
        ...rowX("bench", 230, 770, 300, 3, 52),
        ...rowX("streetlamp", 150, 850, 250, 4, 60),
        { kind: "tree", x: 120, y: 470, size: 72 }, { kind: "tree", x: 880, y: 470, size: 72 },
        { kind: "tree", x: 300, y: 560, size: 64 }, { kind: "tree", x: 700, y: 560, size: 64 },
        { kind: "bicycle", x: 200, y: 380, size: 46 }, { kind: "tent", x: 820, y: 420, size: 60 },
        ...rowX("plant", 160, 840, 640, 3, 42),
      ];
    case "city":
      return [
        ...rowX("building", 130, 870, 105, 4, 84),
        ...rowX("streetlamp", 180, 820, 300, 4, 60),
        { kind: "car", x: 300, y: 440, size: 60, rot: HALF }, { kind: "car", x: 700, y: 440, size: 60, rot: -HALF },
        ...rowX("neon", 200, 800, 175, 3, 54), ...rowX("plant", 160, 840, 630, 3, 40),
      ];
    case "airplane":
      return []; // 기내(cabin)는 RoomScene3D에서 좌석열로 렌더
    default:
      return [];
  }
}

// 장소의 배경 씬(바닥/벽/소품) 생성
export function placeScene(id: PlaceId) {
  const p = place(id);
  return { floor: p.floor, wall: p.wall, stage: p.stage, floorType: p.floorType, env: p.env, decor: layoutFor(id) };
}
