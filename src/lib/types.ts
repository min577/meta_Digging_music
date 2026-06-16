import type { GenreId } from "./genres";
import type { Appearance } from "./appearance";

/** 장르 비율 벡터 — 기획서 6장: {jazz:0.4, citypop:0.3, lofi:0.3} */
export type TasteVector = Partial<Record<GenreId, number>>;

export type QueueMode = "dj" | "collab" | "radio";
export type RoomVisibility = "public" | "unlisted" | "friends";
/** party = 호스트가 전체 음악 운영(동기화) · free = 자유 이동 + 근접 오디오 */
export type RoomMode = "party" | "free";

export interface CharacterState {
  baseType: string; // 레거시 베이스 id (호환용)
  appearance: Appearance; // 커스터마이징 외형 (헤어/피부/옷/모자)
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
  id: string; // iTunes trackId (고유 식별자)
  title: string;
  artist: string;
  genre: GenreId;
  durationSec: number; // 미리듣기 길이 (~30초)
  previewUrl: string; // 30초 미리듣기 오디오 (iTunes)
  artwork: string; // 앨범 아트 URL
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
  roomMode: RoomMode; // party | free
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

/** 룸에 배치한 가구/소품 (공간 꾸미기) */
export interface PlacedItem {
  id: string;
  kind: import("@/components/DecorSprite").DecorKind;
  x: number;
  y: number;
}

export interface Friend {
  userId: string;
  handle: string;
  topGenre: GenreId;
  status: "pending" | "accepted";
  matchPct: number; // 취향 일치도
}
