"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { ROOMS } from "@/lib/mock";
import { CATALOG, searchCatalog } from "@/lib/catalog";
import { vectorFromTracks } from "@/lib/taste";
import type {
  Room,
  Track,
  QueueItem,
  ChatMessage,
  ReactionEvent,
  RoomMemberLite,
} from "@/lib/types";

interface PlayState {
  track: Track;
  startedAt: number; // epoch ms — 동기화 기준
}

export interface RoomSession {
  room: Room | null;
  play: PlayState | null;
  queue: QueueItem[];
  chat: ChatMessage[];
  reactions: ReactionEvent[];
  members: RoomMemberLite[];
  online: number;
  connected: "realtime" | "local";
  // actions
  suggest: (t: Track) => void;
  like: (queueId: string) => void;
  skip: () => void;
  sendChat: (text: string) => void;
  react: (emoji: string) => void;
}

const me: RoomMemberLite = {
  userId: "me",
  handle: "나",
  baseType: "hood",
  topGenre: "lofi",
};

export function useRoomSession(
  roomId: string,
  myHandle: string,
  myBase: string,
  myGenre: any
): RoomSession {
  const customRooms = useAppStore((s) => s.customRooms);
  const base =
    ROOMS.find((r) => r.id === roomId) ??
    customRooms.find((r) => r.id === roomId) ??
    null;
  const [room] = useState<Room | null>(base);
  const [play, setPlay] = useState<PlayState | null>(
    base?.currentTrack
      ? { track: base.currentTrack.track, startedAt: base.currentTrack.startedAt }
      : null
  );
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);
  const [members, setMembers] = useState<RoomMemberLite[]>(base?.members ?? []);
  const [online, setOnline] = useState<number>(base?.members.length ?? 1);
  const [connected, setConnected] = useState<"realtime" | "local">("local");

  const channelRef = useRef<any>(null);
  const meRef = useRef<RoomMemberLite>({
    ...me,
    handle: myHandle,
    baseType: myBase,
    topGenre: myGenre,
  });

  // 초기 큐 시드 (협업 큐 데모: 같은 장르 곡 몇 개 + 좋아요)
  useEffect(() => {
    if (!room) return;
    const genre = room.currentTrack?.track.genre ?? "lofi";
    const seeds = CATALOG.filter((t) => t.genre === genre).slice(1, 4);
    const extra = CATALOG.filter((t) => t.genre !== genre).slice(0, 2);
    const seedQueue: QueueItem[] = [...seeds, ...extra].map((t, i) => ({
      id: `q_${t.videoId}`,
      track: t,
      suggestedBy: room.members[i % room.members.length]?.userId ?? "host",
      suggestedByHandle: room.members[i % room.members.length]?.handle ?? room.hostHandle,
      likes: Math.floor((seeds.length - i) * 3) + (i % 2),
      position: i,
    }));
    setQueue(sortQueue(seedQueue));
    setChat([
      {
        id: "c0",
        userId: "host",
        handle: room.hostHandle,
        text: "어서 와요! 좋은 곡 있으면 큐에 올려줘요 🎶",
        at: Date.now() - 60000,
      },
    ]);
  }, [room]);

  // ---- Supabase Realtime (있으면) ----
  useEffect(() => {
    const supabase = createClient();
    if (!supabase || !room) return;

    const channel = supabase.channel(`room:${room.id}`, {
      config: { presence: { key: meRef.current.userId } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "track" }, ({ payload }: any) => {
        setPlay({ track: payload.track, startedAt: payload.startedAt });
      })
      .on("broadcast", { event: "queue" }, ({ payload }: any) => {
        setQueue(sortQueue(payload.queue));
      })
      .on("broadcast", { event: "chat" }, ({ payload }: any) => {
        setChat((c) => [...c, payload].slice(-100));
      })
      .on("broadcast", { event: "reaction" }, ({ payload }: any) => {
        pushReaction(payload);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnline(Math.max(count, base?.members.length ?? 1));
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          setConnected("realtime");
          await channel.track(meRef.current);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  const broadcast = useCallback((event: string, payload: any) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const pushReaction = (r: ReactionEvent) => {
    setReactions((prev) => [...prev, r]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((x) => x.id !== r.id));
    }, 2300);
  };

  // ---- actions ----
  const suggest = useCallback(
    (t: Track) => {
      setQueue((q) => {
        if (q.some((i) => i.track.videoId === t.videoId)) return q;
        const item: QueueItem = {
          id: `q_${t.videoId}_${q.length}`,
          track: t,
          suggestedBy: meRef.current.userId,
          suggestedByHandle: meRef.current.handle,
          likes: 1,
          likedByMe: true,
          position: q.length,
        };
        const next = sortQueue([...q, item]);
        broadcast("queue", { queue: next });
        return next;
      });
    },
    [broadcast]
  );

  const like = useCallback(
    (queueId: string) => {
      setQueue((q) => {
        const next = sortQueue(
          q.map((i) =>
            i.id === queueId
              ? {
                  ...i,
                  likes: i.likedByMe ? i.likes - 1 : i.likes + 1,
                  likedByMe: !i.likedByMe,
                }
              : i
          )
        );
        broadcast("queue", { queue: next });
        return next;
      });
    },
    [broadcast]
  );

  const advance = useCallback(() => {
    setQueue((q) => {
      let nextTrack: Track | undefined;
      let rest = q;
      if (q.length > 0) {
        nextTrack = q[0].track;
        rest = q.slice(1);
      } else {
        // radio 모드 폴백: 카탈로그에서 같은 장르 곡
        const genre = play?.track.genre ?? "lofi";
        nextTrack = searchCatalog(genre)[0] ?? CATALOG[0];
      }
      if (nextTrack) {
        const startedAt = Date.now();
        setPlay({ track: nextTrack, startedAt });
        broadcast("track", { track: nextTrack, startedAt });
      }
      broadcast("queue", { queue: rest });
      return rest;
    });
  }, [broadcast, play?.track.genre]);

  const skip = advance;

  const sendChat = useCallback(
    (text: string) => {
      const msg: ChatMessage = {
        id: `c_${Date.now()}`,
        userId: meRef.current.userId,
        handle: meRef.current.handle,
        text,
        at: Date.now(),
      };
      setChat((c) => [...c, msg].slice(-100));
      broadcast("chat", msg);
    },
    [broadcast]
  );

  const react = useCallback(
    (emoji: string) => {
      const r: ReactionEvent = {
        id: `r_${Date.now()}_${Math.floor((Date.now() % 1000))}`,
        emoji,
        by: meRef.current.handle,
        at: Date.now(),
      };
      pushReaction(r);
      broadcast("reaction", r);
    },
    [broadcast]
  );

  return {
    room,
    play,
    queue,
    chat,
    reactions,
    members,
    online,
    connected,
    suggest,
    like,
    skip,
    sendChat,
    react,
  };
}

function sortQueue(q: QueueItem[]): QueueItem[] {
  return [...q]
    .sort((a, b) => b.likes - a.likes)
    .map((i, idx) => ({ ...i, position: idx }));
}
