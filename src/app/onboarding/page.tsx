"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";
import Logo from "@/components/Logo";
import TrackSearch from "@/components/TrackSearch";
import type { Track } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { vectorFromTracks, sortedGenres } from "@/lib/taste";
import { GENRES } from "@/lib/genres";
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

type Part = "body" | "scarf" | "antenna" | "face";
const PARTS: { id: Part; label: string }[] = [
  { id: "body", label: "본체 색" },
  { id: "scarf", label: "목도리" },
  { id: "antenna", label: "안테나" },
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

  const set = (patch: Partial<Appearance>) => setLook((l) => ({ ...l, ...patch }));

  const toggleSituation = (s: string) =>
    setSituations((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].slice(0, 4)
    );

  const pickSeed = (t: Track) =>
    setSeeds((prev) =>
      prev.some((x) => x.id === t.id) || prev.length >= 3 ? prev : [...prev, t]
    );
  const removeSeed = (id: string) =>
    setSeeds((prev) => prev.filter((x) => x.id !== id));

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

  const canNext = [true, true, situations.length > 0, seeds.length === 3, true][step];

  return (
    <div className="phone-shell min-h-[100dvh] flex flex-col px-5 pt-10 pb-6 bg-gradient-to-b from-cream-100 to-cream-200">
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
                  <span className="text-brand">DigTown</span>에 오신 걸 환영해요
                </h1>
                <p className="text-ink-700/60 mt-2 text-sm leading-relaxed">
                  혼자 듣지 마세요. 같은 곡을 함께 들으며
                  <br />
                  취향이 통하는 사람을 발견하는 곳.
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
본체 색·목도리·안테나·표정으로 나만의 Bean을 꾸며보세요.
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
                    colors={HAIR_COLORS}
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
                좋아하는 곡 3개를 골라주세요
              </h2>
              <p className="text-ink-700/60 text-sm mt-1">
                이 3곡으로 당신의 취향 벡터를 만들어요. ({seeds.length}/3)
              </p>

              {seeds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {seeds.map((t) => (
                    <span
                      key={t.id}
                      className="chip bg-brand/10 text-brand-dark py-1.5 flex items-center gap-1"
                    >
                      {GENRES[t.genre].emoji} {t.title.slice(0, 14)}
                      <button onClick={() => removeSeed(t.id)} className="ml-1 font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex-1 min-h-0">
                <TrackSearch onPick={pickSeed} pickedIds={seeds.map((s) => s.id)} />
              </div>

              {seeds.length === 3 && (
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
              <h2 className="text-xl font-extrabold text-ink-900">플레이 가이드 🎮</h2>
              <p className="text-ink-700/60 text-sm mt-1">이렇게 즐기면 돼요!</p>
              <div className="mt-4 space-y-2.5 overflow-y-auto no-scrollbar">
                {([
                  ["🕹️", "이동", "WASD·방향키 또는 화면을 끌어서(모바일) 디깅 월드를 돌아다녀요."],
                  ["🎧", "디깅", "음악 스팟에 다가가 '디깅하기'로 곡을 발견하고 디깅함에 담아요."],
                  ["🤝", "같이 듣기", "룸에서 친구 곁으로 가 '같이 듣기'를 누르면 손잡고 같은 곡을 함께 들어요."],
                  ["🦘", "상호작용", "방방이에서 점프하고, 룸을 꾸미고, 📷로 순간을 캡쳐해요."],
                  ["🪙", "성장", "디깅·퀘스트로 코인을 모아 상점에서 나의 Bean을 꾸며요."],
                ] as const).map(([e, t, d]) => (
                  <div key={t} className="card p-3 flex items-start gap-3">
                    <span className="text-2xl shrink-0">{e}</span>
                    <div>
                      <p className="font-bold text-sm text-ink-900">{t}</p>
                      <p className="text-[12px] text-ink-700/60 leading-snug">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">
            이전
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="btn-primary flex-1"
          >
            다음
          </button>
        ) : (
          <button onClick={finish} disabled={!canNext} className="btn-primary flex-1">
            디깅 시작하기 →
          </button>
        )}
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
          className={`aspect-square rounded-2xl transition active:scale-95 ${
            value === c ? "ring-2 ring-brand ring-offset-2 ring-offset-cream-50" : ""
          }`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}
