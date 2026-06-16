import type { GenreId } from "./genres";
import type { DecorKind } from "@/components/DecorSprite";
import type { Decor, FloorType } from "./scenes";

// 실제 청취 "상황" 기반 장소. 각 장소는 고유 3D 환경 + 실제 음악(검색어)을 가진다.
export type PlaceId = "gym" | "library" | "hanriver" | "airplane" | "city" | "cafe";
export type EnvType = "indoor" | "water" | "sky" | "skyline";

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

// 배경 소품 배치 좌표 (월드 1400x1000)
const POS: [number, number, number][] = [
  [180, 250, 1], [430, 200, 1], [980, 200, 1], [1230, 250, 1],
  [140, 560, 1], [1260, 560, 1],
  [230, 870, 1], [520, 910, 1], [900, 910, 1], [1200, 870, 1],
  [700, 320, 1], [700, 700, 1],
];

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
    decorKinds: ["treadmill", "dumbbell", "bench", "locker", "mirror", "dumbbell", "treadmill", "bench", "locker", "speaker", "plant", "dumbbell"],
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
    decorKinds: ["bookshelf", "desk", "globe", "bookshelf", "lamp", "desk", "bookshelf", "plant", "candle", "bookshelf", "desk", "painting"],
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
    decorKinds: ["bench", "streetlamp", "tree", "bicycle", "bench", "streetlamp", "tent", "tree", "bench", "streetlamp", "plant", "fountain"],
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
    env: "sky",
    decorKinds: ["planeseat", "planeseat", "window", "cloud", "planeseat", "window", "cloud", "planeseat", "cloud", "window", "planeseat", "counter"],
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
    decorKinds: ["building", "neon", "streetlamp", "car", "building", "neon", "building", "car", "streetlamp", "neon", "building", "vinyl"],
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
    decorKinds: ["table", "chair", "counter", "plant", "table", "chair", "painting", "bookshelf", "table", "chair", "candle", "plant"],
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

// 장소의 배경 씬(바닥/벽/소품) 생성
export function placeScene(id: PlaceId) {
  const p = place(id);
  const decor: Decor[] = POS.map(([x, y], i) => ({
    x,
    y,
    size: 56,
    kind: p.decorKinds[i % p.decorKinds.length],
  }));
  return { floor: p.floor, wall: p.wall, stage: p.stage, floorType: p.floorType, env: p.env, decor };
}
