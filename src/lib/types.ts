import type { GenreId } from "./genres";

/** 장르 비율 벡터 — 기획서 6장: {jazz:0.4, citypop:0.3, lofi:0.3} */
export type TasteVector = Partial<Record<GenreId, number>>;

export type QueueMode = "dj" | "collab" | "radio";
export type RoomVisibility = "public" | "unlisted" | "friends";

export interface CharacterState {
  baseType: string; // 베이스 캐릭터 id
  equipped: Record<string, string>; // 슬롯 -> 아이템 id
  evolutionStage: number; // 0~3
}

export interface UserProfile {
  id: string;
  handle: string;
  country: string;
  tasteVector: TasteVector;
  coins: number;
  diggPoints: number;
  level: number;
  situations: string[]; // 자주 듣는 상황
  character: CharacterState;
  createdAt: string;
}

export interface Track {
  videoId: string;
  title: string;
  artist: string;
  genre: GenreId;
  durationSec: number;
}

export interface Location {
  id: string;
  name: string;
  theme: string; // 한 줄 무드 설명
  emoji: string;
  moodTags: string[];
  primaryGenre: GenreId;
}

export interface RoomMemberLite {
  userId: string;
  handle: string;
  baseType: string;
  topGenre: GenreId;
}

export interface Room {
  id: string;
  locationId: string;
  hostId: string;
  hostHandle: string;
  title: string;
  visibility: RoomVisibility;
  queueMode: QueueMode;
  tasteVector: TasteVector; // 룸 곡 분포 (추천용)
  currentTrack: { track: Track; startedAt: number } | null;
  capacity: number;
  isLive: boolean;
  scheduledAt: string | null;
  members: RoomMemberLite[];
  countries: string[];
}

export interface QueueItem {
  id: string;
  track: Track;
  suggestedBy: string;
  suggestedByHandle: string;
  likes: number;
  likedByMe?: boolean;
  position: number;
}

export interface Digg {
  id: string;
  track: Track;
  discoveredInRoom: string | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  handle: string;
  text: string;
  at: number;
}

export interface ReactionEvent {
  id: string;
  emoji: string;
  by: string;
  at: number;
}

export type BadgeType =
  | "top_listener"
  | "genre_explorer"
  | "streak"
  | "first_digg"
  | "room_host";

export interface Badge {
  id: string;
  type: BadgeType;
  label: string;
  detail: string;
  earnedAt: string;
}

export type QuestType = "daily" | "mood" | "coop";

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  detail: string;
  progress: number;
  goal: number;
  rewardCoins: number;
  rewardPoints: number;
  completedAt: string | null;
}

export interface ShopItem {
  id: string;
  category: "costume" | "theme" | "boost" | "evolution";
  name: string;
  emoji: string;
  price: number;
  desc: string;
  discountPct?: number;
}

export interface Friend {
  userId: string;
  handle: string;
  topGenre: GenreId;
  status: "pending" | "accepted";
  matchPct: number; // 취향 일치도
}
