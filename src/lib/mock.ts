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
  room("room_gym_1", "gym", "오운완 하이텐션 헬스장 🏋️", "muscle", [
    { handle: "muscle", genre: "house" },
    { handle: "pump_it", genre: "kpop" },
    { handle: "runner", genre: "house" },
    { handle: "sweat", genre: "rnb" },
  ]),
  room("room_library_1", "library", "조용한 도서관 · ASMR/공부 📚", "silent", [
    { handle: "silent", genre: "lofi" },
    { handle: "page", genre: "lofi" },
    { handle: "focus", genre: "classical" },
  ]),
  room("room_hanriver_1", "hanriver", "한강 밤 산책 · 감성 발라드 🌉", "river", [
    { handle: "river", genre: "rnb" },
    { handle: "midnight", genre: "rnb" },
    { handle: "breeze", genre: "lofi" },
  ]),
  room("room_airplane_1", "airplane", "여행 떠나는 비행기 ✈️", "voyage", [
    { handle: "voyage", genre: "citypop" },
    { handle: "jetlag", genre: "house" },
    { handle: "window_seat", genre: "kpop" },
  ]),
  room("room_city_1", "city", "도시 야경 드라이브 🌃", "neon", [
    { handle: "neon", genre: "citypop" },
    { handle: "drive", genre: "house" },
    { handle: "seoul", genre: "rnb" },
    { handle: "rooftop", genre: "citypop" },
  ]),
  room("room_cafe_1", "cafe", "골목 카페 · 잔잔한 오후 ☕", "barista", [
    { handle: "barista", genre: "jazz" },
    { handle: "latte", genre: "lofi" },
    { handle: "bossa", genre: "jazz" },
  ]),
  // 리스닝 파티(호스트) 예시
  room("room_city_party", "city", "🎙 시티팝 리스닝 파티", "dj_yuki", [
    { handle: "dj_yuki", genre: "citypop" },
    { handle: "rina", genre: "citypop" },
    { handle: "kenji", genre: "house" },
  ], { roomMode: "party", queueMode: "dj", capacity: 200 }),
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: "s1", category: "costume", name: "재즈 중절모", emoji: "🎩", price: 320, desc: "재즈를 들으면 세피아 톤이 진해져요" },
  { id: "s2", category: "costume", name: "네온 선글라스", emoji: "🕶️", price: 280, desc: "시티팝 무드 전용 액세서리" },
  { id: "s3", category: "costume", name: "비 오는 후드", emoji: "🧥", price: 250, desc: "로파이 빗방울 이펙트 강화", discountPct: 20 },
  { id: "s4", category: "costume", name: "가죽 자켓", emoji: "🧥", price: 360, desc: "메탈 번개 이펙트 해금" },
  { id: "s5", category: "theme", name: "Late Night Jazz 테마", emoji: "🎷", price: 600, desc: "내 룸 배경을 재즈 바로" },
  { id: "s6", category: "theme", name: "Disco Rooftop 테마", emoji: "🪩", price: 600, desc: "디스코볼 룸 배경", discountPct: 15 },
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
  { userId: "u_noir", handle: "noir", topGenre: "jazz", status: "accepted", matchPct: 0 },
  { userId: "u_yuki", handle: "yuki", topGenre: "citypop", status: "accepted", matchPct: 0 },
  { userId: "u_rain", handle: "rain", topGenre: "lofi", status: "pending", matchPct: 0 },
];

/** 데모 모드 기본 유저 (Supabase 미연동 시) */
export function demoUser(): UserProfile {
  return {
    id: "demo-user",
    handle: "디깅러",
    country: "KR",
    tasteVector: { lofi: 0.5, citypop: 0.3, jazz: 0.2 },
    coins: 1200,
    diggPoints: 340,
    level: 3,
    situations: ["공부할 때", "자기 전"],
    character: { baseType: "custom", appearance: defaultAppearance(), equipped: {}, evolutionStage: 1 },
    createdAt: new Date().toISOString(),
  };
}
