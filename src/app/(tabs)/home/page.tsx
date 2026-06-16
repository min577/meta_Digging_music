"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import RoomCard from "@/components/RoomCard";
import MoodBuilding from "@/components/MoodBuilding";
import { LOCATIONS, ROOMS } from "@/lib/mock";
import { GENRES, GENRE_LIST, type GenreId } from "@/lib/genres";
import { matchPercent, topGenre } from "@/lib/taste";
import { useAppStore } from "@/store/useAppStore";

type Filter = "match" | GenreId;

export default function HomePage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const customRooms = useAppStore((s) => s.customRooms);
  const taste = user?.tasteVector ?? {};
  const [filter, setFilter] = useState<Filter>("match");

  // 룸 + 취향 일치도 (기본 정렬 = 취향 일치순)
  const ranked = useMemo(() => {
    const allRooms = [...customRooms, ...ROOMS];
    const withPct = allRooms.map((r) => ({
      room: r,
      pct: matchPercent(taste, r.tasteVector),
    }));
    if (filter === "match") {
      return withPct.sort((a, b) => b.pct - a.pct);
    }
    // 장르 필터: 룸의 vibe 장르 기준
    return withPct
      .filter((x) => {
        const loc = LOCATIONS.find((l) => l.id === x.room.locationId);
        return (loc?.primaryGenre ?? topGenre(x.room.tasteVector)) === filter;
      })
      .sort((a, b) => b.pct - a.pct);
  }, [taste, filter, customRooms]);

  const topRoom = ranked[0];

  // 무드 공간 카드 → 해당 장소 룸으로 입장
  const enterPlace = (loc: (typeof LOCATIONS)[number]) => {
    const r = [...customRooms, ...ROOMS].find((x) => x.place === loc.place);
    router.push(r ? `/room/${r.id}` : "/room/create");
  };

  return (
    <div>
      <TopBar
        title={`안녕, ${user?.handle ?? "디깅러"} 👋`}
        sub="오늘은 어떤 곡을 디깅해볼까요?"
      />

      {/* 무드 공간 캐러셀 */}
      <section className="mt-2">
        <div className="flex items-center justify-between px-5">
          <h2 className="font-bold text-ink-900">무드 공간</h2>
          <Link href="/room/create" className="text-xs font-bold text-brand">
            + 룸 만들기
          </Link>
        </div>
        <div className="mt-3 overflow-hidden">
          <div className="flex gap-3 w-max marquee-track px-5 pb-1">
            {[...LOCATIONS, ...LOCATIONS].map((loc, idx) => (
              <button
                key={loc.id + "_" + idx}
                onClick={() => enterPlace(loc)}
                className="card shrink-0 w-36 p-3 flex flex-col items-center active:scale-[0.97] transition"
                style={{
                  background: `linear-gradient(160deg, ${GENRES[loc.primaryGenre].bg[0]}22, #FFFDF7)`,
                }}
              >
                <MoodBuilding genre={loc.primaryGenre} emoji={loc.emoji} size={96} />
                <span className="mt-1 font-bold text-sm text-ink-900">{loc.name}</span>
                <span className="text-[11px] text-ink-700/55 text-center leading-tight mt-0.5">
                  {loc.theme}
                </span>
                <span className="mt-1 text-[10px] font-bold text-brand">입장하기 →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 필터 */}
      <div className="mt-5 px-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter("match")}
          className={`chip py-1.5 px-3 shrink-0 border ${
            filter === "match"
              ? "bg-brand text-white border-brand"
              : "bg-cream-50 text-ink-700 border-cream-200"
          }`}
        >
          🎯 취향 일치순
        </button>
        {GENRE_LIST.map((g) => (
          <button
            key={g.id}
            onClick={() => setFilter(g.id)}
            className={`chip py-1.5 px-3 shrink-0 border ${
              filter === g.id
                ? "text-white border-transparent"
                : "bg-cream-50 text-ink-700 border-cream-200"
            }`}
            style={filter === g.id ? { background: g.color } : undefined}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {/* 인기 라이브 룸 */}
      <section className="mt-4 px-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink-900">인기 라이브 룸</h2>
          <span className="text-xs text-ink-700/45">
            {filter === "match" ? "취향 일치순" : `${GENRES[filter as GenreId].label} 룸`}
          </span>
        </div>

        <div className="mt-3 space-y-3.5">
          {ranked.length === 0 && (
            <p className="text-center text-ink-700/40 text-sm py-8">
              이 무드의 라이브 룸이 아직 없어요. 직접 만들어볼까요?
            </p>
          )}
          {ranked.map(({ room, pct }) => (
            <RoomCard key={room.id} room={room} matchPct={pct} />
          ))}
        </div>
      </section>

      {/* 디깅 시작 (취향 1순위 룸으로) */}
      {topRoom && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-5 z-30 pointer-events-none">
          <button
            onClick={() => router.push(`/room/${topRoom.room.id}`)}
            className="btn-primary w-full pointer-events-auto shadow-soft"
          >
            🎧 디깅 시작 — {topRoom.room.title} ({topRoom.pct}%)
          </button>
        </div>
      )}
    </div>
  );
}
