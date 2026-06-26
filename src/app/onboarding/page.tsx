"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";
import Logo from "@/components/Logo";
import type { Track } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { vectorFromTracks, sortedGenres } from "@/lib/taste";
import { GENRES, type GenreId } from "@/lib/genres";
import { searchTracks } from "@/lib/music";
import { searchArtists, artistToSeed, type SeedArtist } from "@/lib/artists";
import { defaultAppearance, type Appearance } from "@/lib/appearance";
import { FREE_PRESETS } from "@/lib/characters";

const SITUATIONS = [
  "공부할 때",
  "운동할 때",
  "자기 전",
  "출퇴근길",
  "드라이브",
  "작업/집중",
  "기분 전환",
  "파티",
  "산책할 때",
  "비 오는 날",
  "새벽 감성",
  "청소할 때",
  "요리할 때",
  "게임할 때",
  "카페에서",
  "데이트",
  "혼술 타임",
  "멍 때릴 때",
  "샤워할 때",
  "여행 갈 때",
];

// 아티스트 썸네일 — iTunes 아트워크(캐시), 없으면 장르 이모지
const thumbCache = new Map<string, string>();
function ArtistThumb({ name, genre }: { name: string; genre: GenreId }) {
  const [art, setArt] = useState<string | null>(thumbCache.get(name) ?? null);
  useEffect(() => {
    if (thumbCache.has(name)) {
      setArt(thumbCache.get(name) || null);
      return;
    }
    let active = true;
    searchTracks(name)
      .then((tracks) => {
        const url = tracks.find((t) => t.artwork)?.artwork ?? "";
        thumbCache.set(name, url);
        if (active) setArt(url || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [name]);
  const g = GENRES[genre];
  return (
    <div className="w-14 h-14 rounded-full overflow-hidden grid place-items-center" style={{ background: g.color + "22" }}>
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <span className="text-xl">{g.emoji}</span>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const complete = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState("");
  const [look, setLook] = useState<Appearance>(defaultAppearance());
  const [situations, setSituations] = useState<string[]>([]);
  const [seeds, setSeeds] = useState<Track[]>([]);
  const [artistQ, setArtistQ] = useState("");

  const set = (patch: Partial<Appearance>) => setLook((l) => ({ ...l, ...patch }));

  const toggleSituation = (s: string) =>
    setSituations((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 5)
    );

  // 아티스트 선택(최대 5명) → 장르 기반 취향 벡터
  const toggleArtist = (a: SeedArtist) =>
    setSeeds((prev) => {
      const id = `artist_${a.name}`;
      if (prev.some((x) => x.id === id)) return prev.filter((x) => x.id !== id);
      if (prev.length >= 5) return prev;
      return [...prev, artistToSeed(a)];
    });
  const artistResults = searchArtists(artistQ);

  const preview = vectorFromTracks(seeds);

  const finish = () => {
    complete({
      handle: handle.trim() || "디깅러",
      appearance: look,
      situations,
      seedTracks: seeds,
    });
    router.replace("/world");
  };

  const canNext = [true, true, situations.length > 0, seeds.length >= 3][step];
  const isLast = step === 3;

  const onPrev = () => setStep((s) => s - 1);
  const onNext = () => {
    if (isLast) finish();
    else setStep((s) => s + 1);
  };

  return (
    <div className="app-frame min-h-[100dvh] flex flex-col px-5 pt-10 pb-6 bg-gradient-to-b from-cream-100 to-cream-200">
      <div className="flex gap-2 justify-center mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-7 bg-brand" : "w-2 bg-cream-300"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="flex-1 flex flex-col min-h-0"
        >
          {step === 0 && (
            <div className="flex-1 flex flex-col">
              <div className="text-center mt-4">
                <div className="flex justify-center mb-1 animate-float-slow">
                  <Logo size={128} />
                </div>
                <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">
                  음악으로 하나되는 이곳
                </h1>
                <p className="text-ink-700/60 mt-2 text-sm leading-relaxed">
                  같은 곡을 함께 들으며 취향이 통하는
                  <br />
                  사람을 발견하는 음악 디깅 메타버스.
                </p>
              </div>
              <div className="mt-8">
                <label className="text-sm font-bold text-ink-800">
                  뭐라고 부를까요?
                </label>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="닉네임 (예: 새벽디깅)"
                  className="mt-2 w-full card px-4 py-3 text-sm outline-none"
                  maxLength={16}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-extrabold text-ink-900">
                나만의 캐릭터 고르기
              </h2>
              <p className="text-ink-700/60 text-sm mt-1">
                마음에 드는 캐릭터를 골라보세요. (상점에서 코스튬도 입을 수 있어요)
              </p>

              {/* 미리보기 */}
              <div className="mt-4 flex justify-center">
                <div className="rounded-3xl bg-cream-50 border border-cream-200 px-8 py-3 shadow-card">
                  <Avatar appearance={look} size={120} />
                </div>
              </div>

              {/* 프리셋 그리드 */}
              <div className="mt-3 card p-3 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-4 gap-2">
                  {FREE_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => set({ preset: p })}
                      className={`rounded-2xl p-1 grid place-items-center transition active:scale-95 ${
                        look.preset === p ? "ring-2 ring-brand bg-brand/5" : "bg-cream-50"
                      }`}
                    >
                      <Avatar appearance={{ preset: p } as Appearance} size={56} bob={false} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <h2 className="text-xl font-extrabold text-ink-900">
                주로 언제 음악을 들어요?
              </h2>
              <p className="text-ink-700/60 text-sm mt-1">
                룸 추천에 사용돼요. (최대 5개)
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {SITUATIONS.map((s) => {
                  const on = situations.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSituation(s)}
                      className={`chip py-2 px-4 border transition ${
                        on
                          ? "bg-brand text-white border-brand"
                          : "bg-cream-50 text-ink-700 border-cream-200"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-extrabold text-ink-900">
                좋아하는 아티스트를 골라주세요
              </h2>
              <p className="text-ink-700/60 text-sm mt-1">
                3~5명을 고르면 취향을 분석해드려요. ({seeds.length}/5)
              </p>

              {/* 검색 */}
              <div className="mt-3 card px-4 py-2.5 flex items-center gap-2">
                <span className="text-ink-700/40">🔍</span>
                <input
                  value={artistQ}
                  onChange={(e) => setArtistQ(e.target.value)}
                  placeholder="아티스트 검색 (예: NewJeans, 잔나비)"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-700/40"
                />
              </div>

              {/* 아티스트 썸네일 그리드 */}
              <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-3 gap-2.5">
                  {artistResults.map((a) => {
                    const on = seeds.some((x) => x.id === `artist_${a.name}`);
                    const g = GENRES[a.genre];
                    return (
                      <button
                        key={a.name}
                        onClick={() => toggleArtist(a)}
                        className={`card p-2 flex flex-col items-center text-center transition active:scale-[0.97] ${
                          on ? "ring-2 ring-brand" : ""
                        }`}
                      >
                        <div className="relative">
                          <ArtistThumb name={a.name} genre={a.genre} />
                          {on && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand text-white grid place-items-center text-[11px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-ink-800 mt-1.5 truncate w-full">{a.name}</span>
                        <span className="text-[9px] font-bold" style={{ color: g.color }}>{g.label}</span>
                      </button>
                    );
                  })}
                  {artistResults.length === 0 && (
                    <p className="text-sm text-ink-700/40 py-6 col-span-3 text-center">
                      검색 결과가 없어요. 다른 이름으로 찾아보세요.
                    </p>
                  )}
                </div>
              </div>

              {seeds.length >= 3 && (
                <div className="card p-3 mt-3">
                  <p className="text-xs font-bold text-ink-700 mb-2">
                    당신의 취향 미리보기
                  </p>
                  <div className="space-y-1.5">
                    {sortedGenres(preview).map(([g, v]) => (
                      <div key={g} className="flex items-center gap-2">
                        <span className="text-xs w-14 text-ink-700">
                          {GENRES[g].emoji} {GENRES[g].label}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${v * 100}%`, background: GENRES[g].color }}
                          />
                        </div>
                        <span className="text-xs text-ink-700/60 w-9 text-right">
                          {Math.round(v * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <button onClick={onPrev} className="btn-ghost">
            이전
          </button>
        )}
        <button onClick={onNext} disabled={!canNext} className="btn-primary flex-1">
          {isLast ? "디깅 시작하기 →" : "다음"}
        </button>
      </div>
    </div>
  );
}

