"use client";

import { useRef, useState } from "react";
import MapScene2D, { type Spot } from "@/components/MapScene2D";
import PreviewPlayer from "@/components/PreviewPlayer";
import Icon from "@/components/Icon";
import CoachTour, { type TourStep } from "@/components/CoachTour";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import { GENRES } from "@/lib/genres";
import { tracksByGenre } from "@/lib/music";
import { defaultAppearance } from "@/lib/appearance";
import { DEFAULT_PRESET } from "@/lib/characters";
import type { Track } from "@/lib/types";

const WORLD_TOUR: TourStep[] = [
  { title: "디깅 월드에 온 걸 환영해요", desc: "캐릭터를 움직여 음악을 발견하는 공간이에요. WASD·방향키 또는 화면을 드래그해 직접 움직여보세요!", advance: "move" },
  { target: "world-hud", title: "이동 & 방방이", desc: "자유롭게 돌아다니다 음악 스팟에 다가가면 '디깅하기' 버튼이 떠요. 방방이에선 점프!" },
  { target: "world-bag", title: "디깅함", desc: "발견해서 담은 곡은 여기 디깅함에 쌓여요. 마이페이지에서 다시 볼 수 있어요." },
];

// 디깅 월드의 음악 스팟 (장르별)
const SPOTS: Spot[] = [
  { id: "sp_kpop", genre: "kpop", x: 480, y: 300, label: "K-팝 무대", term: "k-pop" },
  { id: "sp_hiphop", genre: "hiphop", x: 1120, y: 320, label: "힙합 사이퍼", term: "korean hip hop" },
  { id: "sp_citypop", genre: "citypop", x: 1260, y: 720, label: "시티팝 네온", term: "city pop" },
  { id: "sp_edm", genre: "edm", x: 980, y: 980, label: "EDM 플로어", term: "edm dance" },
  { id: "sp_indie", genre: "indie", x: 400, y: 560, label: "인디 가든", term: "korean indie" },
  { id: "sp_rnb", genre: "rnb", x: 560, y: 980, label: "R&B 라운지", term: "korean r&b" },
];

export default function WorldPage() {
  const user = useAppStore((s) => s.user);
  const diggs = useAppStore((s) => s.diggs);
  const addDigg = useAppStore((s) => s.addDigg);
  const hasDigg = useAppStore((s) => s.hasDigg);
  const logListen = useAppStore((s) => s.logListen);
  const myGenre = useMyTopGenre();
  const ap = user?.character.appearance ?? defaultAppearance();

  const [near, setNear] = useState<Spot | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Track | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const mapCanvas = useRef<HTMLCanvasElement | null>(null);

  // 디깅함에서 곡 재생 (이미 저장된 곡)
  const playDigged = (t: Track) => {
    setResult(t);
    setIsNew(false);
    setSaved(true);
    setStartedAt(Date.now());
    setShowBag(false);
  };

  const capture = () => {
    const c = mapCanvas.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `digtown_${Date.now()}.png`;
    a.click();
  };

  const dig = async (s: Spot) => {
    if (busy) return;
    setBusy(true);
    try {
      const list = await tracksByGenre(s.genre, 14);
      const pool = list.filter((t) => t.previewUrl && !hasDigg(t.id));
      const arr = pool.length ? pool : list.filter((t) => t.previewUrl);
      if (arr.length) {
        const pick = arr[Math.floor(Math.random() * arr.length)];
        logListen(pick, 0); // 미리듣기는 청취로 기록
        setResult(pick); // 저장은 선택 (보관/넘기기)
        setIsNew(!hasDigg(pick.id));
        setSaved(false);
        setStartedAt(Date.now());
      }
    } finally {
      setBusy(false);
    }
  };

  const keepDig = () => {
    if (result) addDigg(result, null);
    setSaved(true);
  };

  return (
    <div className="relative h-[calc(100dvh_-_120px)] overflow-hidden bg-[#7cc96b]">
      <CoachTour tourKey="world" steps={WORLD_TOUR} />
      <MapScene2D
        bodyColor={ap.outfit}
        accentColor={ap.hairColor}
        tasteColor={GENRES[myGenre].color}
        playerSrc={`/characters/${ap.preset ?? DEFAULT_PRESET}`}
        spots={SPOTS}
        onNear={setNear}
        onDig={dig}
        onReady={(c) => (mapCanvas.current = c)}
      />

      {/* 상단 HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <span data-tour="world-hud" className="chip bg-black/45 text-white text-[11px]">디깅 월드 · WASD/터치 이동</span>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            data-tour="world-bag"
            onClick={() => setShowBag(true)}
            className="chip bg-white/90 text-ink-900 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
          >
            <Icon name="music" size={13} /> 디깅함 {diggs.length}
          </button>
          <button onClick={capture} className="w-7 h-7 rounded-full bg-white/90 text-ink-900 grid place-items-center" title="사진 찍기">
            <Icon name="camera" size={15} />
          </button>
        </div>
      </div>

      {/* 근접 디깅 버튼 — 화면 하단 중앙 고정 */}
      {near && !result && (
        <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center px-5 pointer-events-none">
          <button
            onClick={() => dig(near)}
            disabled={busy}
            className="dig-cta pointer-events-auto btn-primary shadow-soft whitespace-nowrap flex items-center gap-1.5"
          >
            <Icon name="headphones" size={16} strokeWidth={2.1} />
            {busy ? "디깅 중…" : `${near.label}에서 디깅하기`}
          </button>
        </div>
      )}

      {/* 디깅 결과 카드 */}
      {result && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-20 card p-3 shadow-card">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl overflow-hidden shrink-0 grid place-items-center"
              style={{ background: GENRES[result.genre].bg[0] }}
            >
              {result.artwork ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={result.artwork} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{GENRES[result.genre].emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-brand">
                {saved ? "디깅함에 담았어요" : isNew ? "새로운 곡 발견!" : "발견한 곡"}
              </p>
              <p className="text-sm font-bold truncate">{result.title}</p>
              <p className="text-xs text-ink-700/55 truncate">
                {result.artist} · {GENRES[result.genre].label}
              </p>
            </div>
          </div>
          {/* 미리듣기 30초 (재생 버튼) */}
          <div className="mt-2.5">
            <PreviewPlayer key={result.id} previewUrl={result.previewUrl} accent={GENRES[result.genre].color} />
          </div>
          {/* 보관 / 넘기기 선택 */}
          <div className="flex gap-2 mt-2.5">
            {saved ? (
              <button onClick={() => setResult(null)} className="btn-primary btn-sm flex-1">
                확인
              </button>
            ) : (
              <>
                <button onClick={() => setResult(null)} className="btn-ghost btn-sm flex-1">
                  넘기기
                </button>
                <button onClick={keepDig} className="btn-primary btn-sm flex-1">
                  <Icon name="plus" size={16} strokeWidth={2.4} /> 디깅함에 담기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 디깅함 시트 */}
      {showBag && (
        <div className="absolute inset-0 z-30 bg-black/40 flex items-end" onClick={() => setShowBag(false)}>
          <div
            className="w-full bg-cream-50 rounded-t-3xl p-5 max-h-[70%] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-cream-300 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-ink-900 flex items-center gap-1.5">
                <Icon name="music" size={18} className="text-brand-dark" /> 디깅함 {diggs.length}
              </h3>
              <button onClick={() => setShowBag(false)} className="w-8 h-8 rounded-full bg-cream-100 grid place-items-center">
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {diggs.length === 0 ? (
                <p className="text-center text-ink-700/45 text-sm py-8">
                  아직 담은 곡이 없어요. 음악 스팟에서 디깅해보세요!
                </p>
              ) : (
                diggs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => playDigged(d.track)}
                    className="w-full card px-3 py-2 flex items-center gap-3 text-left active:scale-[0.99] transition"
                  >
                    <div
                      className="w-11 h-11 rounded-xl overflow-hidden shrink-0 grid place-items-center"
                      style={{ background: GENRES[d.track.genre].color + "22" }}
                    >
                      {d.track.artwork ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={d.track.artwork} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="music" size={18} className="text-ink-700/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{d.track.title}</p>
                      <p className="text-[11px] text-ink-700/50 truncate">{d.track.artist}</p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center shrink-0">
                      <Icon name="play" size={14} fill="currentColor" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
