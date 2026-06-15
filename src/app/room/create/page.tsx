"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MoodBuilding from "@/components/MoodBuilding";
import TrackSearch from "@/components/TrackSearch";
import { LOCATIONS } from "@/lib/mock";
import { GENRES } from "@/lib/genres";
import { vectorFromTracks } from "@/lib/taste";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import type { Room, Track, QueueMode, RoomVisibility } from "@/lib/types";

const MODES: { id: QueueMode; label: string; desc: string }[] = [
  { id: "collab", label: "🤝 협업 큐", desc: "모두 곡 제안 → 좋아요순" },
  { id: "dj", label: "🎙 DJ", desc: "호스트만 곡 관리" },
  { id: "radio", label: "📻 라디오", desc: "태그 기반 자동 재생" },
];

const VIS: { id: RoomVisibility; label: string }[] = [
  { id: "public", label: "공개" },
  { id: "unlisted", label: "링크 공유" },
  { id: "friends", label: "친구 한정" },
];

export default function CreateRoomPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const addRoom = useAppStore((s) => s.addRoom);
  const myGenre = useMyTopGenre();

  const [loc, setLoc] = useState(LOCATIONS[0]);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<QueueMode>("collab");
  const [vis, setVis] = useState<RoomVisibility>("public");
  const [seed, setSeed] = useState<Track | null>(null);
  const [showSeed, setShowSeed] = useState(false);

  const create = () => {
    const id = `custom_${Date.now()}`;
    const room: Room = {
      id,
      locationId: loc.id,
      hostId: user?.id ?? "me",
      hostHandle: user?.handle ?? "나",
      title: title.trim() || `${loc.name} 디깅`,
      visibility: vis,
      queueMode: mode,
      tasteVector: vectorFromTracks(seed ? [seed] : [{ genre: loc.primaryGenre } as Track]),
      currentTrack: seed ? { track: seed, startedAt: Date.now() } : null,
      capacity: 12,
      isLive: true,
      scheduledAt: null,
      members: [
        {
          userId: user?.id ?? "me",
          handle: user?.handle ?? "나",
          baseType: user?.character.baseType ?? "hood",
          topGenre: myGenre,
        },
      ],
      countries: [user?.country ?? "KR"],
    };
    addRoom(room);
    router.replace(`/room/${id}`);
  };

  return (
    <div className="phone-shell min-h-[100dvh] px-5 pt-6 pb-10 bg-gradient-to-b from-cream-100 to-cream-200">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-cream-50 border border-cream-200 grid place-items-center"
        >
          ←
        </button>
        <h1 className="text-xl font-extrabold text-ink-900">룸 만들기</h1>
      </div>

      {/* 테마 */}
      <p className="text-sm font-bold text-ink-800 mb-2">무드 공간(테마)</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {LOCATIONS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLoc(l)}
            className={`card shrink-0 w-28 p-2 flex flex-col items-center transition ${
              loc.id === l.id ? "ring-2 ring-brand" : "opacity-80"
            }`}
          >
            <MoodBuilding genre={l.primaryGenre} emoji={l.emoji} size={72} float={false} />
            <span className="text-[11px] font-bold mt-1 text-center">{l.name}</span>
          </button>
        ))}
      </div>

      {/* 제목 */}
      <p className="text-sm font-bold text-ink-800 mt-5 mb-2">룸 이름</p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`예: 새벽 ${GENRES[loc.primaryGenre].label} 디깅`}
        className="w-full card px-4 py-3 text-sm outline-none"
        maxLength={28}
      />

      {/* 큐 모드 */}
      <p className="text-sm font-bold text-ink-800 mt-5 mb-2">큐 운영 모드</p>
      <div className="space-y-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`w-full card px-4 py-3 flex items-center justify-between transition ${
              mode === m.id ? "ring-2 ring-brand" : ""
            }`}
          >
            <span>
              <span className="font-bold text-sm">{m.label}</span>
              <span className="block text-xs text-ink-700/55">{m.desc}</span>
            </span>
            {mode === m.id && <span className="text-brand font-bold">✓</span>}
          </button>
        ))}
      </div>

      {/* 공개 범위 */}
      <p className="text-sm font-bold text-ink-800 mt-5 mb-2">공개 범위</p>
      <div className="flex gap-2">
        {VIS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVis(v.id)}
            className={`chip py-2 px-4 border ${
              vis === v.id
                ? "bg-brand text-white border-brand"
                : "bg-cream-50 text-ink-700 border-cream-200"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* 시드곡 */}
      <p className="text-sm font-bold text-ink-800 mt-5 mb-2">시드곡 (선택)</p>
      {seed ? (
        <div className="card px-3 py-2.5 flex items-center gap-3">
          <span className="text-lg">{GENRES[seed.genre].emoji}</span>
          <span className="flex-1 text-sm font-semibold truncate">{seed.title}</span>
          <button onClick={() => setSeed(null)} className="text-ink-700/40 font-bold">
            ×
          </button>
        </div>
      ) : (
        <button onClick={() => setShowSeed(true)} className="btn-ghost w-full">
          ＋ 첫 곡 고르기
        </button>
      )}

      <button onClick={create} className="btn-primary w-full mt-8">
        🎧 룸 열기
      </button>

      {showSeed && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={() => setShowSeed(false)}
        >
          <div
            className="w-full max-w-[440px] bg-cream-100 rounded-t-3xl p-5 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-cream-300 rounded-full mx-auto mb-4" />
            <h3 className="font-bold mb-3">시드곡 선택</h3>
            <TrackSearch
              onPick={(t) => {
                setSeed(t);
                setShowSeed(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
