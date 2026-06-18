import type {
  Location,
  Room,
  ShopItem,
  Quest,
  Badge,
  Friend,
  UserProfile,
} from "./types";
import { CATALOG } from "./catalog";
import { vectorFromTracks } from "./taste";
import { defaultAppearance } from "./appearance";
import { PLACE_LIST, place as getPlace, type PlaceId } from "./places";

// 청취 "상황" 기반 장소 (홈 캐러셀). places.ts 에서 파생.
export const LOCATIONS: Location[] = PLACE_LIST.map((p) => ({
  id: `loc_${p.id}`,
  name: p.name,
  theme: p.theme,
  emoji: p.emoji,
  moodTags: p.situations,
  primaryGenre: p.vibeGenre,
  place: p.id,
}));

const t = (genre: string) => CATALOG.filter((c) => c.genre === genre);

function room(
  id: string,
  placeId: PlaceId,
  title: string,
  host: string,
  members: { handle: string; genre: string }[],
  extra: Partial<Room> = {}
): Room {
  const vibe = getPlace(placeId).vibeGenre;
  const tracks = t(vibe);
  return {
    id,
    locationId: `loc_${placeId}`,
    place: placeId,
    hostId: `u_${host}`,
    hostHandle: host,
    title,
    visibility: "public",
    queueMode: "collab",
    roomMode: "free",
    tasteVector: vectorFromTracks(tracks.length ? tracks : CATALOG),
    currentTrack: tracks[0] ? { track: tracks[0], startedAt: Date.now() - 30_000 } : null,
    capacity: 16,
    isLive: true,
    scheduledAt: null,
    members: members.map((m) => ({
      userId: `u_${m.handle}`,
      handle: m.handle,
      baseType: "custom",
      topGenre: m.genre as any,
    })),
    countries: ["KR", "JP", "US"],
    ...extra,
  };
}

export const ROOMS: Room[] = [
  room("room_gym_1", "gym", "오운완 하고 가실 분 💪", "도윤", [
    { handle: "도윤", genre: "edm" }, { handle: "run_minji", genre: "kpop" },
    { handle: "태현", genre: "edm" }, { handle: "soyeon_", genre: "rnb" },
    { handle: "헬스왕준", genre: "kpop" }, { handle: "yuna.fit", genre: "edm" },
    { handle: "지호", genre: "rnb" },
  ]),
  room("room_library_1", "library", "같이 공부할 사람 (ASMR)", "서연", [
    { handle: "서연", genre: "indie" }, { handle: "책읽는하준", genre: "indie" },
    { handle: "jisoo_study", genre: "ballad" }, { handle: "민준", genre: "indie" },
    { handle: "공부중", genre: "ballad" }, { handle: "yejin0", genre: "indie" },
  ]),
  room("room_hanriver_1", "hanriver", "한강에서 발라드 들을래요 🍃", "강민", [
    { handle: "강민", genre: "rnb" }, { handle: "새벽감성", genre: "rnb" },
    { handle: "soohyun", genre: "indie" }, { handle: "지우", genre: "rnb" },
    { handle: "한강러버", genre: "rnb" }, { handle: "민서", genre: "indie" },
  ]),
  room("room_airplane_1", "airplane", "여행 가는 기분 내는 방 ✈️", "여행가다", [
    { handle: "여행가다", genre: "citypop" }, { handle: "jun_trip", genre: "edm" },
    { handle: "윈도우석", genre: "kpop" }, { handle: "하늘", genre: "citypop" },
    { handle: "gate_7", genre: "edm" }, { handle: "수민_", genre: "kpop" },
  ]),
  room("room_city_1", "city", "야경 보면서 드라이브 🌃", "현우", [
    { handle: "현우", genre: "citypop" }, { handle: "seoul_drive", genre: "edm" },
    { handle: "지민", genre: "rnb" }, { handle: "네온", genre: "citypop" },
    { handle: "홍대밤", genre: "edm" }, { handle: "yerin.0", genre: "rnb" },
    { handle: "taxi_night", genre: "citypop" },
  ]),
  room("room_cafe_1", "cafe", "주말 오후 카페 음악 ☕", "바리스타준", [
    { handle: "바리스타준", genre: "rnb" }, { handle: "latte_su", genre: "indie" },
    { handle: "보사노바", genre: "rnb" }, { handle: "오후세시", genre: "rnb" },
    { handle: "모카", genre: "indie" }, { handle: "재즈러", genre: "rnb" },
  ]),
  // 리스닝 파티 (호스트가 진행)
  room("room_city_party", "city", "🎧 시티팝 같이 들어요 (호스트)", "유진", [
    { handle: "유진", genre: "citypop" }, { handle: "리나", genre: "citypop" },
    { handle: "준호", genre: "edm" }, { handle: "다은", genre: "citypop" },
  ], { roomMode: "party", queueMode: "dj", capacity: 200 }),
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: "s1", category: "costume", name: "스냅백 + 골드체인", emoji: "🧢", price: 320, desc: "힙합 스웩 룩 해금" },
  { id: "s2", category: "costume", name: "네온 선글라스", emoji: "🕶️", price: 280, desc: "시티팝 무드 전용 액세서리" },
  { id: "s3", category: "costume", name: "응원봉", emoji: "💖", price: 250, desc: "K-팝 글리터 이펙트 강화", discountPct: 20 },
  { id: "s4", category: "costume", name: "어쿠스틱 기타", emoji: "🎸", price: 360, desc: "인디 감성 룩 해금" },
  { id: "s5", category: "theme", name: "Neon City 테마", emoji: "🌃", price: 600, desc: "내 룸 배경을 시티팝 야경으로" },
  { id: "s6", category: "theme", name: "Club Rooftop 테마", emoji: "🔊", price: 600, desc: "EDM 디스코볼 룸 배경", discountPct: 15 },
  { id: "s7", category: "boost", name: "랭킹 부스트 (24h)", emoji: "⚡", price: 150, desc: "청취 경험치 2배" },
  { id: "s8", category: "boost", name: "디깅 포인트 부스트", emoji: "💎", price: 180, desc: "발견 보상 1.5배 (24h)" },
  { id: "s9", category: "evolution", name: "진화의 음표", emoji: "🎵", price: 800, desc: "캐릭터를 다음 단계로 진화" },
];

export function defaultQuests(): Quest[] {
  return [
    { id: "q_daily_1", type: "daily", title: "새 장르 1곡 발견", detail: "오늘 처음 듣는 장르의 곡을 디깅함에 저장", progress: 0, goal: 1, rewardCoins: 50, rewardPoints: 20, completedAt: null },
    { id: "q_daily_2", type: "daily", title: "새로운 룸 입장", detail: "한 번도 가보지 않은 룸에 입장하기", progress: 0, goal: 1, rewardCoins: 30, rewardPoints: 15, completedAt: null },
    { id: "q_daily_3", type: "daily", title: "곡 3개 좋아요", detail: "리스닝 파티에서 곡에 좋아요 3번", progress: 0, goal: 3, rewardCoins: 40, rewardPoints: 20, completedAt: null },
    { id: "q_coop_1", type: "coop", title: "함께 좋아요 (협동)", detail: "같은 룸 5명이 같은 곡에 좋아요 → 보상 해금", progress: 2, goal: 5, rewardCoins: 200, rewardPoints: 100, completedAt: null },
  ];
}

export function defaultBadges(): Badge[] {
  return [
    { id: "b1", type: "first_digg", label: "첫 디깅", detail: "첫 곡을 디깅함에 저장했어요", earnedAt: new Date().toISOString() },
  ];
}

export const DEMO_FRIENDS: Friend[] = [
  { userId: "u_seoyeon", handle: "서연", topGenre: "rnb", status: "accepted", matchPct: 0 },
  { userId: "u_hyunwoo", handle: "현우", topGenre: "citypop", status: "accepted", matchPct: 0 },
  { userId: "u_soohyun", handle: "soohyun", topGenre: "indie", status: "pending", matchPct: 0 },
];

/** 데모 모드 기본 유저 (Supabase 미연동 시) */
export function demoUser(): UserProfile {
  return {
    id: "demo-user",
    handle: "디깅러",
    country: "KR",
    tasteVector: { kpop: 0.4, hiphop: 0.3, rnb: 0.3 },
    coins: 1200,
    diggPoints: 340,
    level: 3,
    situations: ["공부할 때", "자기 전"],
    character: { baseType: "custom", appearance: defaultAppearance(), equipped: {}, evolutionStage: 1 },
    createdAt: new Date().toISOString(),
  };
}
