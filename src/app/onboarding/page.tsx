"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";
import Logo from "@/components/Logo";
import type { Track } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { vectorFromTracks, sortedGenres } from "@/lib/taste";
import { GENRES } from "@/lib/genres";
import { searchArtists, artistToSeed, type SeedArtist } from "@/lib/artists";
import {
  defaultAppearance,
  HAIR_COLORS,
  OUTFIT_COLORS,
  FACES,
  FACE_LABEL,
  type Appearance,
} from "@/lib/appearance";

const SITUATIONS = [
  "공부할 때",
  "운동할 때",
  "자기 전",
  "출퇴근길",
  "드라이브",
  "작업/집중",
  "기분 전환",
  "파티",
];

// 게임 튜토리얼(step형) — 한 번에 하나씩 넘기며 보여준다
const TIPS: { emoji: string; title: string; desc: string }[] = [
  { emoji: "🕹️", title: "이동하기", desc: "WASD·방향키, 또는 화면을 끌어서(모바일) 디깅 월드를 자유롭게 돌아다녀요." },
  { emoji: "🎧", title: "디깅하기", desc: "음악 스팟에 다가가면 버튼이 떠요. 눌러서 새로운 곡을 발견하고 디깅함에 담아요." },
  { emoji: "🤝", title: "같이 듣기", desc: "룸에서 친구 곁으로 가 '같이 듣기'를 누르면 손을 잡고 같은 곡을 함께 들어요." },
  { emoji: "🦘", title: "놀기", desc: "방방이에서 점프하고, 룸을 꾸미고, 📷로 순간을 캡쳐해요." },
  { emoji: "🪙", title: "성장하기", desc: "디깅·퀘스트로 코인을 모아 상점에서 나의 캐릭터를 꾸며요. 준비됐나요?" },
];

type Part = "body" | "scarf" | "antenna" | "face";
const PARTS: { id: Part; label: string }[] = [
  { id: "body", label: "본체 색" },
  { id: "scarf", label: "목도리" },
  { id: "antenna", label: "머리" },
  { id: "face", label: "표정" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const complete = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState("");
  const [look, setLook] = useState<Appearance>(defaultAppearance());
  const [part, setPart] = useState<Part>("body");
  const [situations, setSituations] = useState<string[]>([]);
  const [seeds, setSeeds] = useState<Track[]>([]);
  const [artistQ, setArtistQ] = useState("");
  const [guideStep, setGuideStep] = useState(0);

  const set = (patch: Partial<Appearance>) => setLook((l) => ({ ...l, ...patch }));

  const toggleSituation = (s: string) =>
    setSituations((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 4)
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

  const canNext = [true, true, situations.length > 0, seeds.length >= 3, true][step];

  const onPrev = () => {
    if (step === 4 && guideStep > 0) setGuideStep((g) => g - 1);
    else setStep((s) => s - 1);
  };
  const onNext = () => {
    if (step < 4) {
      if (step === 3) setGuideStep(0);
      setStep((s) => s + 1);
    } else if (guideStep < TIPS.length - 1) {
      setGuideStep((g) => g + 1);
    } else {
      finish();
    }
  };
  const isLastTip = step === 4 && guideStep === TIPS.length - 1;

  return (
    <div className="app-frame min-h-[100dvh] flex flex-col px-5 pt-10 pb-6 bg-gradient-to-b from-cream-100 to-cream-200">
      <div className="flex gap-2 justify-center mb-6">
        {[0, 1, 2, 3, 4].map((i) => (
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
                <div className="flex justify-center mb-3 animate-float-slow">
                  <Logo size={52} wordmark={false} />
                </div>
                <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">
                  <span className="text-brand">디깅타운</span>,
                  <br />
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
                나만의 캐릭터 만들기
              </h2>
              <p className="text-ink-700/60 text-sm mt-1">
본체 색·목도리·머리·표정으로 나만의 캐릭터를 꾸며보세요.
              </p>

              {/* 미리보기 */}
              <div className="mt-4 flex justify-center">
                <div className="rounded-3xl bg-cream-50 border border-cream-200 px-8 py-4 shadow-card">
                  <Avatar appearance={look} size={120} />
                </div>
              </div>

              {/* 파트 탭 */}
              <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
                {PARTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPart(p.id)}
                    className={`chip py-1.5 px-3 shrink-0 ${
                      part === p.id
                        ? "bg-brand text-white"
                        : "bg-cream-50 text-ink-700 border border-cream-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* 옵션 그리드 */}
              <div className="mt-3 card p-3 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                {part === "body" && (
                  <Swatches
                    colors={OUTFIT_COLORS}
                    value={look.outfit}
                    onPick={(c) => set({ outfit: c })}
                  />
                )}
                {part === "scarf" && (
                  <Swatches
                    colors={["none", ...HAIR_COLORS]}
                    value={look.pants}
                    onPick={(c) => set({ pants: c })}
                  />
                )}
                {part === "antenna" && (
                  <Swatches
                    colors={HAIR_COLORS}
                    value={look.hairColor}
                    onPick={(c) => set({ hairColor: c })}
                  />
                )}
                {part === "face" && (
                  <div className="grid grid-cols-3 gap-2">
                    {FACES.map((f) => (
                      <button
                        key={f}
                        onClick={() => set({ face: f })}
                        className={`rounded-xl p-1 flex flex-col items-center ${
                          look.face === f ? "ring-2 ring-brand bg-brand/5" : ""
                        }`}
                      >
                        <Avatar appearance={{ ...look, face: f }} size={52} bob={false} />
                        <span className="text-[10px] text-ink-700/60">{FACE_LABEL[f]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <h2 className="text-xl font-extrabold text-ink-900">
                주로 언제 음악을 들어요?
              </h2>
              <p className="text-ink-700/60 text-sm mt-1">
                룸 추천에 사용돼요. (최대 4개)
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

              {/* 아티스트 칩 그리드 */}
              <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                <div className="flex flex-wrap gap-2">
                  {artistResults.map((a) => {
                    const on = seeds.some((x) => x.id === `artist_${a.name}`);
                    const g = GENRES[a.genre];
                    return (
                      <button
                        key={a.name}
                        onClick={() => toggleArtist(a)}
                        className={`chip py-2 px-3 border transition flex items-center gap-1.5 ${
                          on ? "text-white border-transparent" : "bg-cream-50 text-ink-700 border-cream-200"
                        }`}
                        style={on ? { background: g.color } : undefined}
                      >
                        <span>{g.emoji}</span>
                        <span className="font-bold">{a.name}</span>
                        {on && <span className="font-bold">✓</span>}
                      </button>
                    );
                  })}
                  {artistResults.length === 0 && (
                    <p className="text-sm text-ink-700/40 py-6 w-full text-center">
                      검색 결과가 없어요. 다른 이름으로 찾아보세요.
                    </p>
                  )}
                </div>
              </div>

              {seeds.length >= 3 && (
                <div className="card p-3 mt-3">
                  <p className="text-xs font-bold text-ink-700 mb-2">
                    🎯 당신의 취향 미리보기
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

          {step === 4 && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-ink-900">플레이 가이드 🎮</h2>
                <button
                  onClick={finish}
                  className="text-xs font-bold text-ink-700/45 active:scale-95"
                >
                  건너뛰기
                </button>
              </div>

              {/* step형 튜토리얼 — 한 번에 하나씩 */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={guideStep}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-28 h-28 rounded-[28px] bg-brand/10 grid place-items-center text-6xl animate-float-slow">
                      {TIPS[guideStep].emoji}
                    </div>
                    <p className="mt-5 text-lg font-extrabold text-ink-900">
                      {TIPS[guideStep].title}
                    </p>
                    <p className="mt-2 text-sm text-ink-700/60 leading-relaxed max-w-[280px]">
                      {TIPS[guideStep].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 튜토리얼 진행 도트 */}
              <div className="flex justify-center gap-1.5 mt-2">
                {TIPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === guideStep ? "w-5 bg-brand" : "w-1.5 bg-cream-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-5">
        {(step > 0 || guideStep > 0) && (
          <button onClick={onPrev} className="btn-ghost">
            이전
          </button>
        )}
        <button onClick={onNext} disabled={!canNext} className="btn-primary flex-1">
          {isLastTip ? "디깅 시작하기 →" : "다음"}
        </button>
      </div>
    </div>
  );
}

function Swatches({
  colors,
  value,
  onPick,
}: {
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-3 py-1">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className={`aspect-square rounded-2xl transition active:scale-95 grid place-items-center ${
            value === c ? "ring-2 ring-brand ring-offset-2 ring-offset-cream-50" : ""
          } ${c === "none" ? "border-2 border-dashed border-cream-300 text-ink-700/40 text-xs font-bold" : ""}`}
          style={c === "none" ? { background: "#fff" } : { background: c }}
        >
          {c === "none" ? "없음" : ""}
        </button>
      ))}
    </div>
  );
}
