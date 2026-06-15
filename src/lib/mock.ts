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

// 무드 공간(장소) — 기획서 3장 홈 캐러셀. Focustown의 National Library / Focus Plane / Stockholm Cafe 대응.
export const LOCATIONS: Location[] = [
  {
    id: "loc_jazz",
    name: "Late Night Jazz",
    theme: "자정의 재즈 바, 세피아빛 무드",
    emoji: "🎷",
    moodTags: ["밤", "집중", "차분"],
    primaryGenre: "jazz",
  },
  {
    id: "loc_citypop",
    name: "City Pop Train",
    theme: "네온 도시를 달리는 야간 열차",
    emoji: "🚆",
    moodTags: ["드라이브", "설렘", "레트로"],
    primaryGenre: "citypop",
  },
  {
    id: "loc_lofi",
    name: "Rainy Lo-fi Room",
    theme: "빗소리와 함께하는 공부방",
    emoji: "🌧️",
    moodTags: ["공부", "휴식", "잔잔"],
    primaryGenre: "lofi",
  },
  {
    id: "loc_house",
    name: "Disco Rooftop",
    theme: "루프탑 하우스 파티",
    emoji: "🪩",
    moodTags: ["운동", "에너지", "댄스"],
    primaryGenre: "house",
  },
  {
    id: "loc_kpop",
    name: "K-Pop Stage",
    theme: "아이돌 무대 백스테이지",
    emoji: "💖",
    moodTags: ["신남", "팬", "응원"],
    primaryGenre: "kpop",
  },
  {
    id: "loc_classical",
    name: "Antique Hall",
    theme: "금빛 클래식 연주회장",
    emoji: "🎻",
    moodTags: ["자기 전", "사색", "우아"],
    primaryGenre: "classical",
  },
];

const t = (genre: string) => CATALOG.filter((c) => c.genre === genre);

function room(
  id: string,
  locationId: string,
  primaryGenre: string,
  title: string,
  host: string,
  members: { handle: string; base: string; genre: string }[],
  extra: Partial<Room> = {}
): Room {
  const tracks = t(primaryGenre);
  return {
    id,
    locationId,
    hostId: `u_${host}`,
    hostHandle: host,
    title,
    visibility: "public",
    queueMode: "collab",
    roomMode: "party",
    tasteVector: vectorFromTracks(tracks.length ? tracks : CATALOG),
    currentTrack: tracks[0]
      ? { track: tracks[0], startedAt: Date.now() - 30_000 }
      : null,
    capacity: 12,
    isLive: true,
    scheduledAt: null,
    members: members.map((m, i) => ({
      userId: `u_${m.handle}`,
      handle: m.handle,
      baseType: m.base,
      topGenre: m.genre as any,
    })),
    countries: ["KR", "JP", "US"],
    ...extra,
  };
}

export const ROOMS: Room[] = [
  room("room_jazz_1", "loc_jazz", "jazz", "새벽 3시 재즈 디깅", "miso", [
    { handle: "miso", base: "fedora", genre: "jazz" },
    { handle: "noir", base: "fedora", genre: "jazz" },
    { handle: "lune", base: "hood", genre: "lofi" },
  ]),
  room("room_citypop_1", "loc_citypop", "citypop", "네온 시티팝 거리 🌃 (자유모드)", "yuki", [
    { handle: "yuki", base: "shades", genre: "citypop" },
    { handle: "rina", base: "shades", genre: "citypop" },
    { handle: "kenji", base: "shades", genre: "citypop" },
    { handle: "aoi", base: "hood", genre: "lofi" },
  ], { roomMode: "free" }),
  room("room_lofi_1", "loc_lofi", "lofi", "자유로운 로파이 라운지 🎐 (자유모드)", "rain", [
    { handle: "rain", base: "hood", genre: "lofi" },
    { handle: "cozy", base: "hood", genre: "lofi" },
    { handle: "mellow", base: "hood", genre: "lofi" },
  ], { capacity: 12, roomMode: "free" }),
  room("room_house_1", "loc_house", "house", "루프탑 하우스 파티 🪩", "dj_max", [
    { handle: "dj_max", base: "glow", genre: "house" },
    { handle: "neon", base: "glow", genre: "house" },
    { handle: "pulse", base: "glow", genre: "house" },
    { handle: "vibe", base: "shades", genre: "citypop" },
    { handle: "echo", base: "glow", genre: "house" },
  ], { queueMode: "dj", capacity: 200 }),
  room("room_kpop_1", "loc_kpop", "kpop", "K-팝 떼창 대형룸 💖", "starlight", [
    { handle: "starlight", base: "glitter", genre: "kpop" },
    { handle: "minji_fan", base: "glitter", genre: "kpop" },
    { handle: "borahae", base: "glitter", genre: "kpop" },
  ], { queueMode: "dj", capacity: 500 }),
  room("room_classical_1", "loc_classical", "classical", "자기 전 클래식 🎻", "adagio", [
    { handle: "adagio", base: "antique", genre: "classical" },
  ], { capacity: 8 }),
  room("room_lofi_2", "loc_lofi", "lofi", "라디오 무인 로파이 📻", "auto", [
    { handle: "auto", base: "hood", genre: "lofi" },
  ], { queueMode: "radio" }),
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
