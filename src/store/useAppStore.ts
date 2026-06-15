"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  Digg,
  Quest,
  Badge,
  Friend,
  Track,
  CharacterState,
  Room,
} from "@/lib/types";
import type { GenreId } from "@/lib/genres";
import { defaultQuests, defaultBadges, DEMO_FRIENDS } from "@/lib/mock";
import { updateVector, vectorFromTracks, topGenre } from "@/lib/taste";
import { defaultAppearance, type Appearance } from "@/lib/appearance";

interface ListenEvent {
  genre: GenreId;
  artist: string;
  id: string;
  seconds: number;
  at: number;
}

interface AppState {
  /** 온보딩 완료 여부 */
  onboarded: boolean;
  user: UserProfile | null;
  diggs: Digg[];
  quests: Quest[];
  badges: Badge[];
  friends: Friend[];
  listenEvents: ListenEvent[];
  visitedRooms: string[];
  customRooms: Room[];

  // ---- 룸 ----
  addRoom: (room: Room) => void;

  // ---- 온보딩 ----
  completeOnboarding: (p: {
    handle: string;
    appearance: Appearance;
    situations: string[];
    seedTracks: Track[];
  }) => void;
  resetAll: () => void;

  // ---- 캐릭터 ----
  setCharacter: (c: Partial<CharacterState>) => void;
  setAppearance: (a: Appearance) => void;
  evolve: () => void;

  // ---- 디깅함 ----
  addDigg: (track: Track, roomId: string | null) => boolean; // 신규면 true
  removeDigg: (id: string) => void;
  hasDigg: (id: string) => boolean;

  // ---- 청취/취향 ----
  logListen: (track: Track, seconds: number) => void;
  enterRoom: (roomId: string) => void;

  // ---- 재화/퀘스트/배지 ----
  addCoins: (n: number) => void;
  addPoints: (n: number) => void;
  spendCoins: (n: number) => boolean;
  progressQuest: (id: string, delta?: number) => void;
  claimQuest: (id: string) => void;
  awardBadge: (b: Badge) => void;

  // ---- 친구 ----
  addFriend: (f: Friend) => void;
}

function freshUser(
  handle: string,
  appearance: Appearance,
  situations: string[],
  seedTracks: Track[]
): UserProfile {
  return {
    id: "local-user",
    handle: handle || "디깅러",
    country: "KR",
    tasteVector: vectorFromTracks(seedTracks),
    coins: 500,
    diggPoints: 0,
    level: 1,
    situations,
    character: { baseType: "custom", appearance, equipped: {}, evolutionStage: 0 },
    createdAt: new Date().toISOString(),
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      user: null,
      diggs: [],
      quests: defaultQuests(),
      badges: defaultBadges(),
      friends: DEMO_FRIENDS,
      listenEvents: [],
      visitedRooms: [],
      customRooms: [],

      addRoom: (room) => set((s) => ({ customRooms: [room, ...s.customRooms] })),

      completeOnboarding: ({ handle, appearance, situations, seedTracks }) =>
        set({
          onboarded: true,
          user: freshUser(handle, appearance, situations, seedTracks),
        }),

      resetAll: () =>
        set({
          onboarded: false,
          user: null,
          diggs: [],
          quests: defaultQuests(),
          badges: defaultBadges(),
          friends: DEMO_FRIENDS,
          listenEvents: [],
          visitedRooms: [],
          customRooms: [],
        }),

      setCharacter: (c) =>
        set((s) =>
          s.user
            ? { user: { ...s.user, character: { ...s.user.character, ...c } } }
            : {}
        ),

      setAppearance: (a) =>
        set((s) =>
          s.user
            ? { user: { ...s.user, character: { ...s.user.character, appearance: a } } }
            : {}
        ),

      evolve: () =>
        set((s) => {
          if (!s.user) return {};
          const stage = Math.min(3, s.user.character.evolutionStage + 1);
          return {
            user: {
              ...s.user,
              character: { ...s.user.character, evolutionStage: stage },
            },
          };
        }),

      addDigg: (track, roomId) => {
        const exists = get().diggs.some((d) => d.track.id === track.id);
        if (exists) return false;
        const digg: Digg = {
          id: `digg_${track.id}_${get().diggs.length}`,
          track,
          discoveredInRoom: roomId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ diggs: [digg, ...s.diggs] }));
        // 데일리 "새 장르 발견" 퀘스트
        get().progressQuest("q_daily_1", 1);
        get().addPoints(10);
        return true;
      },

      removeDigg: (id) =>
        set((s) => ({ diggs: s.diggs.filter((d) => d.track.id !== id) })),

      hasDigg: (id) => get().diggs.some((d) => d.track.id === id),

      logListen: (track, seconds) =>
        set((s) => {
          if (!s.user) return {};
          const tasteVector = updateVector(s.user.tasteVector, track.genre);
          const ev: ListenEvent = {
            genre: track.genre,
            artist: track.artist,
            id: track.id,
            seconds,
            at: Date.now(),
          };
          return {
            user: { ...s.user, tasteVector },
            listenEvents: [ev, ...s.listenEvents].slice(0, 500),
          };
        }),

      enterRoom: (roomId) =>
        set((s) => {
          const isNew = !s.visitedRooms.includes(roomId);
          if (isNew) {
            // 비동기 부수효과 대신 다음 tick에서 퀘스트 진행
            setTimeout(() => get().progressQuest("q_daily_2", 1), 0);
            return { visitedRooms: [...s.visitedRooms, roomId] };
          }
          return {};
        }),

      addCoins: (n) =>
        set((s) => (s.user ? { user: { ...s.user, coins: s.user.coins + n } } : {})),

      addPoints: (n) =>
        set((s) => {
          if (!s.user) return {};
          const diggPoints = s.user.diggPoints + n;
          const level = 1 + Math.floor(diggPoints / 200);
          return { user: { ...s.user, diggPoints, level } };
        }),

      spendCoins: (n) => {
        const u = get().user;
        if (!u || u.coins < n) return false;
        set({ user: { ...u, coins: u.coins - n } });
        return true;
      },

      progressQuest: (id, delta = 1) =>
        set((s) => ({
          quests: s.quests.map((q) => {
            if (q.id !== id || q.completedAt) return q;
            const progress = Math.min(q.goal, q.progress + delta);
            return { ...q, progress };
          }),
        })),

      claimQuest: (id) => {
        const q = get().quests.find((x) => x.id === id);
        if (!q || q.completedAt || q.progress < q.goal) return;
        set((s) => ({
          quests: s.quests.map((x) =>
            x.id === id ? { ...x, completedAt: new Date().toISOString() } : x
          ),
        }));
        get().addCoins(q.rewardCoins);
        get().addPoints(q.rewardPoints);
      },

      awardBadge: (b) =>
        set((s) =>
          s.badges.some((x) => x.type === b.type)
            ? {}
            : { badges: [b, ...s.badges] }
        ),

      addFriend: (f) =>
        set((s) =>
          s.friends.some((x) => x.userId === f.userId)
            ? {}
            : { friends: [{ ...f, status: "accepted" }, ...s.friends] }
        ),
    }),
    {
      name: "digtown-store",
      partialize: (s) => ({
        onboarded: s.onboarded,
        user: s.user,
        diggs: s.diggs,
        quests: s.quests,
        badges: s.badges,
        friends: s.friends,
        listenEvents: s.listenEvents,
        visitedRooms: s.visitedRooms,
        customRooms: s.customRooms,
      }),
    }
  )
);

/** 내 대표 장르 (없으면 lofi) */
export function useMyTopGenre(): GenreId {
  const user = useAppStore((s) => s.user);
  return user ? topGenre(user.tasteVector) : "lofi";
}
