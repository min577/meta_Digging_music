"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { ROOMS } from "@/lib/mock";
import { tracksByGenre } from "@/lib/music";
import { topGenre } from "@/lib/taste";
import type {
  Room,
  Track,
  QueueItem,
  ChatMessage,
  ReactionEvent,
  RoomMemberLite,
} from "@/lib/types";
import type { MapAvatar } from "@/components/RoomMap";
import { defaultAppearance, type Appearance } from "@/lib/appearance";

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
  remotePlayers: MapAvatar[];
  // actions
  suggest: (t: Track) => void;
  like: (queueId: string) => void;
  skip: () => void;
  sendChat: (text: string) => void;
  react: (emoji: string) => void;
  broadcastMove: (x: number, y: number, dir: MapAvatar["dir"]) => void;
}

// 클라이언트마다 고유 id (멀티플레이어 구분)
function makeId() {
  return `me_${Math.random().toString(36).slice(2, 9)}`;
}

export function useRoomSession(
  roomId: string,
  myHandle: string,
  myBase: string,
  myGenre: any,
  myAppearance?: Appearance
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
  const [remote, setRemote] = useState<Record<string, MapAvatar>>({});

  const channelRef = useRef<any>(null);
  const meRef = useRef<RoomMemberLite & { id: string; appearance: Appearance }>({
    userId: "me",
    id: makeId(),
    handle: myHandle,
    baseType: myBase,
    topGenre: myGenre,
    appearance: myAppearance ?? defaultAppearance(),
  });

  // 초기 재생곡 + 큐 시드 — iTunes에서 룸 장르의 실제 곡(30초 미리듣기)을 가져온다.
  useEffect(() => {
    if (!room) return;
    const genre = room.currentTrack?.track.genre ?? topGenre(room.tasteVector);
    let active = true;
    (async () => {
      const tracks = await tracksByGenre(genre, 6);
      if (!active || tracks.length === 0) return;
      setPlay({ track: tracks[0], startedAt: Date.now() });
      const rest = tracks.slice(1);
      const seedQueue: QueueItem[] = rest.map((t, i) => ({
        id: `q_${t.id}`,
        track: t,
        suggestedBy: room.members[i % room.members.length]?.userId ?? "host",
        suggestedByHandle:
          room.members[i % room.members.length]?.handle ?? room.hostHandle,
        likes: (rest.length - i) * 2 + (i % 2),
        position: i,
      }));
      setQueue(sortQueue(seedQueue));
    })();
    setChat([
      {
        id: "c0",
        userId: "host",
        handle: room.hostHandle,
        text: "어서 와요! 좋은 곡 있으면 큐에 올려줘요 🎶",
        at: Date.now() - 60000,
      },
    ]);
    return () => {
      active = false;
    };
  }, [room]);

  // ---- Supabase Realtime (있으면) ----
  useEffect(() => {
    const supabase = createClient();
    if (!supabase || !room) return;

    const channel = supabase.channel(`room:${room.id}`, {
      config: { presence: { key: meRef.current.id } },
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
      .on("broadcast", { event: "move" }, ({ payload }: any) => {
        if (payload.id === meRef.current.id) return;
        setRemote((r) => ({ ...r, [payload.id]: payload }));
      })
      .on("presence", { event: "leave" }, ({ leftPresences }: any) => {
        setRemote((r) => {
          const next = { ...r };
          for (const p of leftPresences ?? []) delete next[p.id ?? p.key];
          return next;
        });
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
        if (q.some((i) => i.track.id === t.id)) return q;
        const item: QueueItem = {
          id: `q_${t.id}_${q.length}`,
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
      if (q.length > 0) {
        const nextTrack = q[0].track;
        const rest = q.slice(1);
        const startedAt = Date.now();
        setPlay({ track: nextTrack, startedAt });
        broadcast("track", { track: nextTrack, startedAt });
        broadcast("queue", { queue: rest });
        return rest;
      }
      // 큐가 비면 라디오 모드: iTunes에서 같은 장르 곡으로 보충
      const genre = play?.track.genre ?? "lofi";
      tracksByGenre(genre, 5).then((tracks) => {
        if (tracks.length === 0) return;
        const startedAt = Date.now();
        setPlay({ track: tracks[0], startedAt });
        broadcast("track", { track: tracks[0], startedAt });
        const rest: QueueItem[] = tracks.slice(1).map((t, i) => ({
          id: `q_${t.id}_${startedAt}`,
          track: t,
          suggestedBy: "radio",
          suggestedByHandle: "라디오",
          likes: 0,
          position: i,
        }));
        setQueue(sortQueue(rest));
        broadcast("queue", { queue: rest });
      });
      return q;
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

  const broadcastMove = useCallback(
    (x: number, y: number, dir: MapAvatar["dir"]) => {
      broadcast("move", {
        id: meRef.current.id,
        handle: meRef.current.handle,
        appearance: meRef.current.appearance,
        x,
        y,
        dir,
        walking: true,
      });
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
    remotePlayers: Object.values(remote),
    suggest,
    like,
    skip,
    sendChat,
    react,
    broadcastMove,
  };
}

function sortQueue(q: QueueItem[]): QueueItem[] {
  return [...q]
    .sort((a, b) => b.likes - a.likes)
    .map((i, idx) => ({ ...i, position: idx }));
}
