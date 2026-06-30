"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import RoomCard from "@/components/RoomCard";
import MoodBuilding from "@/components/MoodBuilding";
import Icon from "@/components/Icon";
import CoachTour, { type TourStep } from "@/components/CoachTour";
import { LOCATIONS, ROOMS } from "@/lib/mock";
import { GENRES, GENRE_LIST, GENRE_TAG, type GenreId } from "@/lib/genres";
import { matchPercent, topGenre } from "@/lib/taste";
import { useAppStore } from "@/store/useAppStore";

type Filter = "match" | GenreId;

const HOME_TOUR: TourStep[] = [
  { target: "home-quest", title: "오늘의 퀘스트", desc: "여기서 진행 중인 퀘스트와 보상을 확인해요. 디깅·퀘스트로 코인을 모아요." },
  { target: "home-mood", title: "무드 공간 (자유 디깅)", desc: "한강·카페처럼 상황·장소로 고르는 공간이에요. 들어가서 자유롭게 돌아다니며 곡을 발견해요. ‘내 상황’ 배지가 붙은 곳이 취향 맞춤!" },
  { target: "home-create", title: "룸 만들기", desc: "내 룸을 만들어 친구를 초대할 수도 있어요." },
  { target: "home-filter", title: "실시간 인기 룸", desc: "아래 룸 랭킹은 사람들이 모인 곳을 취향 일치도 순으로 보여줘요." },
];

export default function HomePage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const customRooms = useAppStore((s) => s.customRooms);
  const quests = useAppStore((s) => s.quests);
  const taste = user?.tasteVector ?? {};
  const [filter, setFilter] = useState<Filter>("match");

  // 오늘의 진행 중인 퀘스트 (없으면 첫 퀘스트)
  const activeQuest = quests.find((q) => !q.completedAt) ?? quests[0];
  const doneQuests = quests.filter((q) => q.completedAt).length;

  // 온보딩 입력(상황·아티스트) 반영
  const situations = user?.situations ?? [];
  const favoriteArtists = user?.favoriteArtists ?? [];
  const placeMatched = (loc: (typeof LOCATIONS)[number]) =>
    loc.moodTags.some((t) => situations.includes(t));
  // 무드 공간을 '내가 자주 듣는 상황'에 맞춰 우선 정렬
  const sortedLocs = useMemo(
    () => [...LOCATIONS].sort((a, b) => Number(placeMatched(b)) - Number(placeMatched(a))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [situations.join(",")]
  );
  const matchedSituation = situations.find((s) =>
    LOCATIONS.some((l) => l.moodTags.includes(s))
  );

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
  const roomForPlace = (place: string) => [...customRooms, ...ROOMS].find((x) => x.place === place);
  const enterPlace = (loc: (typeof LOCATIONS)[number]) => {
    const r = roomForPlace(loc.place);
    router.push(r ? `/room/${r.id}` : "/room/create");
  };
  return (
    <div>
      <CoachTour tourKey="home" steps={HOME_TOUR} />
      <TopBar
        title={
          <span className="inline-flex items-center gap-1.5">
            안녕, {user?.handle ?? "디깅러"}
            <Icon name="wave" size={20} className="text-brand-dark" strokeWidth={2} />
          </span>
        }
        sub="오늘은 어떤 곡을 디깅해볼까요?"
      />

      {/* 디깅 퀘스트 배너 (눈에 띄게) */}
      {activeQuest && (
        <Link
          href="/quests"
          data-tour="home-quest"
          className="mx-5 mt-2 card p-3.5 flex items-center gap-3 active:scale-[0.99] transition bg-gradient-to-r from-brand/10 to-cream-50"
        >
          <span className="w-9 h-9 rounded-full bg-brand/15 text-brand-dark grid place-items-center shrink-0">
            <Icon name="quest" size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm text-ink-900 truncate">디깅 퀘스트 · {activeQuest.title}</p>
              <span className="text-[10px] font-bold text-brand shrink-0">완료 {doneQuests}/{quests.length}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all"
                  style={{ width: `${Math.min(100, (activeQuest.progress / activeQuest.goal) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-ink-700/55 shrink-0 inline-flex items-center gap-0.5">
                {activeQuest.progress}/{activeQuest.goal} · <Icon name="coin" size={11} className="text-gold" />{activeQuest.rewardCoins}
              </span>
            </div>
          </div>
          <span className="text-ink-700/30 shrink-0">›</span>
        </Link>
      )}

      {/* 온보딩 취향 반영 — 좋아한 아티스트로 분석한 취향 */}
      {favoriteArtists.length > 0 && (
        <div className="mx-5 mt-2 card p-3 bg-gradient-to-r from-cream-50 to-brand/5">
          <p className="text-[11px] font-bold text-ink-700/55 flex items-center gap-1">
            <Icon name="sparkle" size={12} className="text-brand-dark" /> 내가 고른 아티스트로 분석한 취향
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {favoriteArtists.slice(0, 5).map((a) => (
              <span key={a} className="chip bg-cream-100 text-ink-700 text-[11px] font-bold py-0.5 px-2">
                {a}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-700/50">
            아래 룸·사람 추천이 이 취향의 <span className="font-bold text-brand-dark">일치도</span> 순으로 정렬돼요.
          </p>
        </div>
      )}

      {/* 무드 공간 캐러셀 — 상황·장소로 고르는 '자유 디깅' 입구 */}
      <section className="mt-4" data-tour="home-mood">
        <div className="flex items-center justify-between px-5">
          <div className="min-w-0">
            <h2 className="font-bold text-ink-900">무드 공간 · 자유 디깅</h2>
            <p className="text-[11px] text-ink-700/50 mt-0.5">
              {matchedSituation
                ? `‘${matchedSituation}’처럼 자주 듣는 상황에 맞춰 골랐어요`
                : "상황·장소를 골라 자유롭게 돌아다니며 디깅해요"}
            </p>
          </div>
          <Link
            href="/room/create"
            data-tour="home-create"
            className="btn-primary btn-sm shrink-0"
          >
            <span className="text-base leading-none">＋</span> 룸 만들기
          </Link>
        </div>
        <div className="mt-3 overflow-hidden">
          <div className="flex gap-3 w-max marquee-track px-5 pb-1">
            {[...sortedLocs, ...sortedLocs].map((loc, idx) => {
              const matched = placeMatched(loc);
              return (
              <button
                key={loc.id + "_" + idx}
                onClick={() => enterPlace(loc)}
                className={`card shrink-0 w-36 p-3 flex flex-col items-center active:scale-[0.97] transition ${
                  matched ? "ring-2 ring-brand/40" : ""
                }`}
                style={{
                  background: `linear-gradient(160deg, ${GENRES[loc.primaryGenre].bg[0]}22, #FFFDF7)`,
                }}
              >
                <MoodBuilding place={loc.place} emoji={loc.emoji} size={120} />
                <span className="mt-1 font-bold text-sm text-ink-900">{loc.name}</span>
                {matched ? (
                  <span className="mt-1 chip bg-brand text-white text-[10px] font-bold py-0.5 px-2 inline-flex items-center gap-1">
                    <Icon name="target" size={10} strokeWidth={2.4} /> 내 상황
                  </span>
                ) : (
                  <span className="mt-1 chip bg-cream-100 text-ink-700 text-[10px] font-bold py-0.5 px-2">
                    {loc.moodTags[0] ?? "자유 디깅"}
                  </span>
                )}
                <span className="mt-1 text-[10px] font-bold text-brand">입장하기 →</span>
              </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 필터 */}
      <div data-tour="home-filter" className="mt-5 px-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter("match")}
          className={`chip py-1.5 px-3 shrink-0 border ${
            filter === "match"
              ? "bg-brand text-white border-brand"
              : "bg-cream-50 text-ink-700 border-cream-200"
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <Icon name="target" size={13} strokeWidth={2.2} /> 취향 일치순
          </span>
        </button>
        {GENRE_LIST.map((g) => {
          const on = filter === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              className={`rounded-2xl py-1.5 px-3.5 shrink-0 text-sm font-extrabold tracking-tight transition ${
                on ? "shadow-card" : "bg-cream-50 border border-cream-200"
              }`}
              style={
                on
                  ? { background: g.color, color: GENRE_TAG[g.id].ink }
                  : { color: g.color }
              }
            >
              {GENRE_TAG[g.id].en}
            </button>
          );
        })}
      </div>

      {/* 실시간 인기 룸 — 사람들이 모인 룸을 취향 일치순으로 랭킹 */}
      <section className="mt-4 px-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-ink-900 flex items-center gap-1.5">
              <span className="live-dot bg-live" /> 실시간 인기 룸
            </h2>
            <p className="text-[11px] text-ink-700/50 mt-0.5">
              지금 사람들이 모인 룸 · {filter === "match" ? "취향 일치순 랭킹" : `${GENRES[filter as GenreId].label} 룸`}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ranked.length === 0 && (
            <p className="text-center text-ink-700/40 text-sm py-8">
              이 무드의 룸이 아직 없어요. 직접 만들어볼까요?
            </p>
          )}
          {ranked.map(({ room, pct }, i) => (
            <RoomCard key={room.id} room={room} matchPct={pct} rank={filter === "match" ? i + 1 : undefined} />
          ))}
        </div>
      </section>

      {/* 디깅 시작 (취향 1순위 룸으로) */}
      {topRoom && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-5 z-30 pointer-events-none">
          <button
            onClick={() => router.push(`/room/${topRoom.room.id}`)}
            className="btn-primary w-full pointer-events-auto shadow-soft flex items-center justify-center gap-1.5"
          >
            <Icon name="headphones" size={16} strokeWidth={2.1} /> 디깅 시작 — {topRoom.room.title} ({topRoom.pct}%)
          </button>
        </div>
      )}
    </div>
  );
}
