"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { topChart, type ChartCountry } from "@/lib/music";
import { GENRES, GENRE_LIST, type GenreId } from "@/lib/genres";
import type { Track } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

const COUNTRIES: { id: ChartCountry; label: string; flag: string }[] = [
  { id: "kr", label: "한국", flag: "🇰🇷" },
  { id: "us", label: "글로벌", flag: "🌐" },
];

export default function ChartsPage() {
  const [country, setCountry] = useState<ChartCountry>("kr");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GenreId | "all">("all");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0~1

  const audioRef = useRef<HTMLAudioElement>(null);
  const addDigg = useAppStore((s) => s.addDigg);
  const hasDigg = useAppStore((s) => s.hasDigg);
  const logListen = useAppStore((s) => s.logListen);

  // 차트 로드
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setTracks([]);
    topChart(40, country).then((t) => {
      if (!alive) return;
      setTracks(t);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [country]);

  // 순위 부여 후 장르 필터
  const ranked = useMemo(() => tracks.map((t, i) => ({ t, rank: i + 1 })), [tracks]);
  const shown = useMemo(
    () => (filter === "all" ? ranked : ranked.filter((r) => r.t.genre === filter)),
    [ranked, filter]
  );

  const current = tracks.find((t) => t.id === currentId) ?? null;

  const play = (track: Track) => {
    const a = audioRef.current;
    if (!a) return;
    if (currentId === track.id) {
      // 같은 곡 토글
      if (a.paused) a.play().catch(() => {});
      else a.pause();
      return;
    }
    setCurrentId(track.id);
    setProgress(0);
    a.src = track.previewUrl;
    a.play().catch(() => {});
    logListen(track, 0);
  };

  const step = (dir: 1 | -1) => {
    if (!current) return;
    const list = shown.map((r) => r.t);
    const i = list.findIndex((t) => t.id === current.id);
    const next = list[i + dir];
    if (next) play(next);
  };

  // 오디오 이벤트
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => step(1);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
    };
  }, [current, shown]);

  return (
    <div className="px-5 pt-8">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-brand/15 grid place-items-center text-brand-dark">
          <Icon name="trophy" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 leading-tight">인기 차트</h1>
          <p className="text-xs text-ink-700/55">지금 가장 많이 듣는 곡 · 30초 미리듣기</p>
        </div>
      </div>

      {/* 국가 토글 */}
      <div className="mt-4 flex gap-2">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCountry(c.id)}
            className={`chip py-1.5 px-3.5 border transition ${
              country === c.id
                ? "bg-brand text-white border-brand"
                : "bg-cream-50 text-ink-700 border-cream-200"
            }`}
          >
            {c.flag} {c.label}
          </button>
        ))}
      </div>

      {/* 장르 필터 */}
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterChip on={filter === "all"} onClick={() => setFilter("all")}>
          전체
        </FilterChip>
        {GENRE_LIST.map((g) => (
          <FilterChip key={g.id} on={filter === g.id} onClick={() => setFilter(g.id)}>
            {g.emoji} {g.label}
          </FilterChip>
        ))}
      </div>

      {/* 리스트 */}
      <div className="mt-4 space-y-1.5">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-cream-100 animate-pulse" />
          ))}

        {!loading && shown.length === 0 && (
          <p className="text-center text-sm text-ink-700/50 py-10">
            해당 장르의 차트 곡이 없어요.
          </p>
        )}

        {!loading &&
          shown.map(({ t, rank }) => {
            const g = GENRES[t.genre];
            const isCur = currentId === t.id;
            const digged = hasDigg(t.id);
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 p-2 rounded-2xl transition ${
                  isCur ? "bg-brand/10 ring-1 ring-brand/30" : "hover:bg-cream-100"
                }`}
              >
                {/* 순위 */}
                <div
                  className={`w-6 text-center font-extrabold tabular-nums ${
                    rank <= 3 ? "text-brand-dark text-lg" : "text-ink-700/45 text-sm"
                  }`}
                >
                  {rank}
                </div>

                {/* 아트 + 재생 버튼 */}
                <button
                  onClick={() => play(t)}
                  className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 grid place-items-center"
                  style={{ background: g.bg[0] }}
                  aria-label="재생"
                >
                  {t.artwork ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={t.artwork} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{g.emoji}</span>
                  )}
                  <span className="absolute inset-0 grid place-items-center bg-black/35 text-white opacity-0 hover:opacity-100 transition">
                    <Icon name={isCur && playing ? "headphones" : "play"} size={18} fill="currentColor" />
                  </span>
                </button>

                {/* 곡 정보 */}
                <button onClick={() => play(t)} className="flex-1 min-w-0 text-left">
                  <p className={`text-sm font-bold truncate ${isCur ? "text-brand-dark" : "text-ink-900"}`}>
                    {t.title}
                  </p>
                  <p className="text-xs text-ink-700/55 truncate">{t.artist}</p>
                </button>

                {/* 장르 점 + 디깅 */}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: `${g.color}22`, color: g.color }}
                >
                  {g.label}
                </span>
                <button
                  onClick={() => addDigg(t, null)}
                  className={`w-8 h-8 grid place-items-center rounded-full shrink-0 transition ${
                    digged ? "text-brand" : "text-ink-700/35 hover:text-brand/70"
                  }`}
                  aria-label="디깅함에 저장"
                >
                  <Icon name="heart" size={18} fill={digged ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })}
      </div>

      {/* 하단 플레이어 */}
      {current && (
        <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 w-full max-w-[440px] px-3 z-30">
          <div className="rounded-2xl bg-ink-900/95 text-white shadow-card overflow-hidden">
            {/* 진행바 */}
            <div className="h-1 bg-white/15">
              <div className="h-full bg-brand" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 grid place-items-center" style={{ background: GENRES[current.genre].bg[0] }}>
                {current.artwork ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={current.artwork} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{GENRES[current.genre].emoji}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{current.title}</p>
                <p className="text-xs text-white/55 truncate">{current.artist}</p>
              </div>
              <button onClick={() => step(-1)} className="w-8 h-8 grid place-items-center text-white/70 rotate-180" aria-label="이전">
                <Icon name="play" size={16} fill="currentColor" />
              </button>
              <button
                onClick={() => current && play(current)}
                className="w-10 h-10 grid place-items-center rounded-full bg-brand text-white"
                aria-label={playing ? "일시정지" : "재생"}
              >
                {playing ? (
                  <span className="flex gap-0.5">
                    <span className="w-1 h-3.5 bg-white rounded-sm" />
                    <span className="w-1 h-3.5 bg-white rounded-sm" />
                  </span>
                ) : (
                  <Icon name="play" size={18} fill="currentColor" />
                )}
              </button>
              <button onClick={() => step(1)} className="w-8 h-8 grid place-items-center text-white/70" aria-label="다음">
                <Icon name="play" size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} preload="auto" />
    </div>
  );
}

function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip py-1.5 px-3 shrink-0 border whitespace-nowrap transition ${
        on ? "bg-ink-900 text-white border-ink-900" : "bg-cream-50 text-ink-700 border-cream-200"
      }`}
    >
      {children}
    </button>
  );
}
