"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import PlaceScene from "./PlaceScene";
import GenreTag from "./GenreTag";
import { appearanceFromSeed } from "@/lib/appearance";
import { GENRES } from "@/lib/genres";
import { topGenre } from "@/lib/taste";
import type { Room } from "@/lib/types";

const MODE_LABEL: Record<string, string> = {
  dj: "🎙 DJ",
  collab: "🤝 협업 큐",
  radio: "📻 라디오",
};

export default function RoomCard({
  room,
  matchPct,
}: {
  room: Room;
  matchPct: number;
}) {
  const g = GENRES[topGenre(room.tasteVector)];
  const shown = room.members.slice(0, 5);
  const extra = Math.max(0, room.members.length - shown.length);

  return (
    <Link href={`/room/${room.id}`} className="block">
      <div className="card overflow-hidden active:scale-[0.99] transition">
        {/* 배너: 장소 일러스트 배경 + 캐릭터들 */}
        <div className="relative h-28 flex items-end px-4 pb-2 overflow-hidden">
          {/* 장소별 배경 */}
          <div className="absolute inset-0">
            <PlaceScene place={room.place} />
          </div>
          {/* 하단 스크림(아바타·칩 가독성) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/10" />
          {room.isLive && (
            <span className="absolute top-3 left-3 chip bg-live text-white flex items-center gap-1">
              <span className="live-dot bg-white" /> LIVE
            </span>
          )}
          <span className="absolute top-3 right-3 chip bg-black/30 text-white">
            {MODE_LABEL[room.queueMode]}
          </span>
          {/* 장르 태그(디자인 알약 칩) */}
          <span className="absolute bottom-2 right-3 z-10">
            <GenreTag genre={topGenre(room.tasteVector)} size="sm" />
          </span>
          <div className="relative z-10 flex -space-x-3">
            {shown.map((m) => (
              <div key={m.userId} className="drop-shadow">
                <Avatar appearance={appearanceFromSeed(m.handle)} size={44} bob={false} />
              </div>
            ))}
            {extra > 0 && (
              <span className="self-center ml-3 text-white/90 text-xs font-bold">
                +{extra}
              </span>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-ink-900 truncate">{room.title}</h3>
              <p className="text-xs text-ink-700/50 mt-0.5">
                {g.emoji} {g.label} · 👥 {room.members.length}/{room.capacity}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div
                className="chip text-white"
                style={{ background: g.color }}
              >
                취향 {matchPct}%
              </div>
            </div>
          </div>
          {room.currentTrack && (
            <p className="mt-2 text-xs text-ink-700/60 truncate">
              ♪ {room.currentTrack.track.title} — {room.currentTrack.track.artist}
            </p>
          )}
          <div className="mt-2 flex gap-1">
            {room.countries.map((c) => (
              <span key={c} className="text-[10px] text-ink-700/40 font-semibold">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
