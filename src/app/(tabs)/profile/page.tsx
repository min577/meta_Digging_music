"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import Avatar from "@/components/Avatar";
import Icon, { type IconName } from "@/components/Icon";
import ArtistThumb from "@/components/ArtistThumb";
import GenreIcon from "@/components/GenreIcon";
import CoachTour, { type TourStep } from "@/components/CoachTour";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import { GENRES, GENRE_LIST, genre as genreOf, type GenreId } from "@/lib/genres";
import { sortedGenres } from "@/lib/taste";
import { defaultAppearance, type Appearance } from "@/lib/appearance";
import { ROOMS } from "@/lib/mock";
import { place as placeOf } from "@/lib/places";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signInWithGoogle, signOut } from "@/lib/profile";
import { ACHIEVEMENTS, buildStats, isDone } from "@/lib/achievements";

type View = "report" | "diggs" | "ranking";

const STAGE_NAME = ["새싹", "디깅 비기너", "디깅 헤드", "디깅 마스터"];

const PROFILE_TOUR: TourStep[] = [
  { target: "profile-customize", title: "기본 꾸미기 (무료)", desc: "본체색·목도리·머리·표정을 무료로 바꿀 수 있어요. 모자·안경은 상점에서!" },
  { target: "profile-tabs", title: "취향 리포트 & 디깅함", desc: "여기서 내 장르 분포, 저장한 곡(디깅함), 업적을 확인해요." },
];

export default function ProfilePage() {
  const user = useAppStore((s) => s.user);
  const diggs = useAppStore((s) => s.diggs);
  const listenEvents = useAppStore((s) => s.listenEvents);
  const evolve = useAppStore((s) => s.evolve);
  const removeDigg = useAppStore((s) => s.removeDigg);
  const customRooms = useAppStore((s) => s.customRooms);
  const resetAll = useAppStore((s) => s.resetAll);
  const resetTours = useAppStore((s) => s.resetTours);
  const router = useRouter();
  const myGenre = useMyTopGenre();
  // 저장 데이터에 appearance가 빠져 있어도 안전하게 (오래된 스키마 방어)
  const ap = user?.character.appearance ?? defaultAppearance();
  const [view, setView] = useState<View>("report");
  const [diggGenre, setDiggGenre] = useState<string>("all");

  // 디깅 곡 출처(어느 룸/장소에서 저장했는지) 해석
  const sourceOf = (roomId: string | null) => {
    if (!roomId) return { emoji: "🧭", name: "디깅 월드" };
    const r = [...customRooms, ...ROOMS].find((x) => x.id === roomId);
    if (!r) return { emoji: "🎧", name: "룸" };
    const p = placeOf(r.place);
    return { emoji: p.emoji, name: p.name };
  };
  // 손상 항목(track 누락 등) 제외
  const validDiggs = useMemo(() => diggs.filter((d) => d?.track?.genre), [diggs]);
  // 디깅함에 존재하는 장르(자동 분류 칩)
  const diggGenres = useMemo(
    () => [...new Set(validDiggs.map((d) => d.track.genre))],
    [validDiggs]
  );
  const shownDiggs = diggGenre === "all" ? validDiggs : validDiggs.filter((d) => d.track.genre === diggGenre);

  // 로그아웃 → 온보딩부터 다시 (Supabase 세션도 정리)
  const logout = async () => {
    if (!window.confirm("로그아웃하면 이 기기의 디깅 기록이 초기화되고 온보딩부터 다시 시작해요. 계속할까요?")) return;
    try { await signOut(); } catch {}
    resetAll();
  };

  // 업적 통계 + 달성 수
  const stats = useMemo(
    () => buildStats(listenEvents, diggs, user?.level ?? 1),
    [listenEvents, diggs, user?.level]
  );
  const doneCount = ACHIEVEMENTS.filter((a) => isDone(a, stats)).length;

  // 취향 리포트: 장르 분포
  const dist = useMemo(
    () => (user ? sortedGenres(user.tasteVector) : []),
    [user]
  );

  // 시간대 패턴 (0~23시 청취 횟수)
  const hourly = useMemo(() => {
    const h = new Array(24).fill(0);
    for (const e of listenEvents) {
      const hr = new Date(e.at).getHours();
      h[hr] += 1;
    }
    return h;
  }, [listenEvents]);
  const maxHour = Math.max(1, ...hourly);

  // 아티스트별 청취 랭킹
  const artistRank = useMemo(() => {
    const map = new Map<string, { count: number; genre: string }>();
    for (const e of listenEvents) {
      const cur = map.get(e.artist) ?? { count: 0, genre: e.genre };
      cur.count += 1;
      map.set(e.artist, cur);
    }
    // 디깅함도 합산 (데모에서 listenEvents가 적을 수 있어 풍성하게)
    for (const d of diggs) {
      if (!d?.track?.artist) continue;
      const cur = map.get(d.track.artist) ?? { count: 0, genre: d.track.genre };
      cur.count += 1;
      map.set(d.track.artist, cur);
    }
    return [...map.entries()]
      .map(([artist, v]) => ({ artist, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [listenEvents, diggs]);

  if (!user) return null;
  const stage = user.character.evolutionStage;
  const canEvolve = stage < 3 && user.diggPoints >= (stage + 1) * 150;

  return (
    <div>
      <CoachTour tourKey="profile" steps={PROFILE_TOUR} />
      <TopBar title="마이페이지" />

      {/* 아바타 카드 */}
      <section className="px-5">
        <div className="card p-5 flex items-center gap-4">
          <div
            className="rounded-3xl p-2"
            style={{ background: `${genreOf(myGenre).color}18` }}
          >
            <Avatar appearance={ap} size={88} aura={genreOf(myGenre).color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-lg text-ink-900">{user.handle}</p>
            <p className="text-xs text-ink-700/55">
              Lv.{user.level} · {STAGE_NAME[stage]} · {genreOf(myGenre).label} 디깅러
            </p>
            <div className="flex gap-2 mt-2">
              <span className="chip bg-cream-100 border border-cream-200 inline-flex items-center gap-1">
                <Icon name="coin" size={13} className="text-gold" /> {user.coins}
              </span>
              <span className="chip bg-cream-100 border border-cream-200 inline-flex items-center gap-1">
                <Icon name="gem" size={13} className="text-brand" /> {user.diggPoints}
              </span>
            </div>
          </div>
        </div>

        {/* 캐릭터 꾸미기 → 전용 화면 */}
        <Link
          href="/character"
          data-tour="profile-customize"
          id="base-customizer"
          className="card p-4 mt-3 flex items-center gap-3 active:scale-[0.99] transition scroll-mt-20"
        >
          <span className="w-9 h-9 rounded-full bg-brand/12 text-brand-dark grid place-items-center">
            <Icon name="user" size={18} />
          </span>
          <span className="flex-1 font-bold text-sm text-ink-900">캐릭터 꾸미기</span>
          <span className="text-ink-700/30">›</span>
        </Link>

        {/* 진화 */}
        <div className="card p-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-ink-800">캐릭터 진화</p>
            <span className="text-xs text-ink-700/50">
              {stage}/3 단계
            </span>
          </div>
          <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{
                width: `${Math.min(100, (user.diggPoints / ((stage + 1) * 150)) * 100)}%`,
              }}
            />
          </div>
          <button
            onClick={evolve}
            disabled={!canEvolve}
            className="btn-primary w-full mt-3 disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {stage >= 3 ? (
              "최종 진화 완료"
            ) : canEvolve ? (
              <><Icon name="sparkle" size={16} /> 진화하기!</>
            ) : (
              <>다음 진화까지 {(stage + 1) * 150 - user.diggPoints} <Icon name="gem" size={14} /></>
            )}
          </button>
        </div>
      </section>

      {/* 통계 요약 */}
      <section className="px-5 mt-3 grid grid-cols-3 gap-2">
        <Stat label="디깅함" value={diggs.length} />
        <Stat label="청취곡" value={listenEvents.length} />
        <Stat label="도전 과제" value={`${doneCount}/${ACHIEVEMENTS.length}`} />
      </section>

      {/* 탭 */}
      <div data-tour="profile-tabs" className="px-5 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {([
          ["report", "취향 리포트", "target"],
          ["diggs", "디깅함", "music"],
          ["ranking", "아티스트 랭킹", "headphones"],
        ] as [View, string, IconName][]).map(([v, label, icon]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`chip py-1.5 px-3 shrink-0 inline-flex items-center gap-1.5 ${
              view === v ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            <Icon name={icon} size={14} /> {label}
          </button>
        ))}
      </div>

      <section className="px-5 mt-3">
        {view === "report" && (
          <div className="space-y-3">
            {(user.favoriteArtists?.length ?? 0) > 0 && (
              <div className="card p-4">
                <p className="text-sm font-bold mb-2 flex items-center gap-1.5">
                  <Icon name="sparkle" size={14} className="text-brand-dark" /> 온보딩에서 고른 아티스트
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {user.favoriteArtists!.map((a) => (
                    <span key={a} className="chip bg-cream-100 text-ink-700 text-[11px] font-bold py-1 px-2.5">
                      {a}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-ink-700/50 mt-2">
                  이 아티스트들로 아래 장르 분포(취향 벡터)를 만들었어요.
                </p>
              </div>
            )}
            <div className="card p-4">
              <p className="text-sm font-bold mb-3">장르 분포</p>
              <div className="space-y-2">
                {dist.map(([g, v]) => (
                  <div key={g} className="flex items-center gap-2">
                    <span className="text-xs w-16 text-ink-700 inline-flex items-center gap-1">
                      <GenreIcon genre={g as GenreId} size={12} className="shrink-0" /> {genreOf(g).label}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-cream-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${v * 100}%`, background: genreOf(g).color }}
                      />
                    </div>
                    <span className="text-xs text-ink-700/55 w-9 text-right">
                      {Math.round(v * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <p className="text-sm font-bold mb-3">시간대 패턴</p>
              <div className="flex items-end gap-[2px] h-20">
                {hourly.map((c, h) => (
                  <div
                    key={h}
                    className="flex-1 rounded-t bg-brand/70"
                    style={{ height: `${(c / maxHour) * 100}%`, minHeight: 2 }}
                    title={`${h}시 · ${c}회`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-ink-700/40 mt-1">
                <span>0시</span>
                <span>6시</span>
                <span>12시</span>
                <span>18시</span>
                <span>23시</span>
              </div>
            </div>
          </div>
        )}

        {view === "diggs" && (
          <div>
            {diggs.length === 0 ? (
              <Empty text="아직 저장한 곡이 없어요. 룸에서 마음에 드는 곡을 디깅해보세요!" />
            ) : (
              <>
                {/* 장르 자동 분류 필터 */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                  <button
                    onClick={() => setDiggGenre("all")}
                    className={`chip py-1 px-3 shrink-0 ${diggGenre === "all" ? "bg-brand text-white" : "bg-cream-100 text-ink-700"}`}
                  >
                    전체 {diggs.length}
                  </button>
                  {diggGenres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setDiggGenre(g)}
                      className={`chip py-1 px-3 shrink-0 ${diggGenre === g ? "text-white" : "bg-cream-100 text-ink-700"}`}
                      style={diggGenre === g ? { background: genreOf(g).color } : undefined}
                    >
                      <span className="inline-flex items-center gap-1"><GenreIcon genre={g as GenreId} size={12} /> {genreOf(g).label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {shownDiggs.map((d) => {
                    const src = sourceOf(d.discoveredInRoom);
                    return (
                      <div key={d.id} className="card overflow-hidden relative">
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => removeDigg(d.track.id)}
                          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/45 text-white grid place-items-center text-xs active:scale-90"
                          title="디깅함에서 삭제"
                          aria-label="삭제"
                        >
                          ×
                        </button>
                        <a
                          href={d.track.previewUrl || undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          {d.track.artwork ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={d.track.artwork}
                              alt={d.track.title}
                              className="h-24 w-full object-cover"
                            />
                          ) : (
                            <div
                              className="h-20 flex items-center justify-center text-white"
                              style={{
                                background: `linear-gradient(135deg, ${genreOf(d.track.genre).bg[0]}, ${genreOf(d.track.genre).bg[1]})`,
                              }}
                            >
                              <GenreIcon genre={d.track.genre as GenreId} size={30} strokeWidth={2} />
                            </div>
                          )}
                          <div className="p-2">
                            <p className="text-xs font-bold truncate">{d.track.title}</p>
                            <p className="text-[10px] text-ink-700/50 truncate">
                              {d.track.artist}
                            </p>
                            {/* 자동 태그: 장르 + 디깅한 곳 */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <span
                                className="chip py-0.5 px-1.5 text-[9px] font-bold text-white"
                                style={{ background: genreOf(d.track.genre).color }}
                              >
                                {genreOf(d.track.genre).label}
                              </span>
                              <span className="chip py-0.5 px-1.5 text-[9px] font-bold bg-cream-100 text-ink-700/70">
                                {src.emoji} {src.name}
                              </span>
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {view === "ranking" && (
          <div className="space-y-2">
            {artistRank.length === 0 ? (
              <Empty text="청취 기록이 쌓이면 아티스트별 랭킹이 보여요." />
            ) : (
              artistRank.map((a, i) => {
                // 데모용 "상위 N%" — 청취량 기반 가벼운 연출
                const topPct = Math.max(1, 30 - a.count * 3 - i);
                return (
                  <div key={a.artist} className="card px-4 py-3 flex items-center gap-3">
                    <span className="text-lg font-extrabold text-ink-700/40 w-5 shrink-0">
                      {i + 1}
                    </span>
                    <ArtistThumb name={a.artist} genre={a.genre} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{a.artist}</p>
                      <p className="text-[11px] text-ink-700/50">{a.count}회 청취</p>
                    </div>
                    <span className="chip bg-brand/10 text-brand-dark font-bold">
                      상위 {topPct}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

      </section>

      {/* 퀘스트 바로가기 + 로그인 */}
      <section className="px-5 mt-4 space-y-2">
        <Link href="/quests" className="card p-4 flex items-center gap-3 active:scale-[0.99] transition">
          <span className="w-9 h-9 rounded-full bg-brand/12 text-brand-dark grid place-items-center"><Icon name="quest" size={18} /></span>
          <div className="flex-1">
            <p className="font-bold text-sm">디깅 퀘스트</p>
            <p className="text-xs text-ink-700/50">오늘의 미션 · 도전 과제 · 무드 선택</p>
          </div>
          <span className="text-ink-700/30">›</span>
        </Link>

        <div className="space-y-2.5 mt-3">
          {isSupabaseConfigured ? (
            <button onClick={() => signInWithGoogle()} className="btn-outline w-full">
              Google로 로그인 (클라우드 동기화)
            </button>
          ) : (
            <p className="text-center text-[11px] text-ink-700/40">
              데모 모드 · Supabase 키를 연결하면 클라우드 동기화가 켜져요
            </p>
          )}

          <button
            onClick={() => {
              resetTours();
              router.push("/world");
            }}
            className="btn-outline w-full"
          >
            튜토리얼 다시 보기
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full text-center text-xs font-bold text-ink-700/50 py-3 active:scale-[0.99] transition"
        >
          로그아웃 · 온보딩 다시 보기
        </button>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-xl font-extrabold text-ink-900">{value}</p>
      <p className="text-[11px] text-ink-700/50">{label}</p>
    </div>
  );
}


function Empty({ text }: { text: string }) {
  return (
    <div className="card p-8 text-center text-sm text-ink-700/45 leading-relaxed">
      {text}
    </div>
  );
}
