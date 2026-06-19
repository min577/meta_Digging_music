"use client";

import { useState } from "react";
import MapScene2D, { type Spot } from "@/components/MapScene2D";
import AudioPlayer from "@/components/AudioPlayer";
import Icon from "@/components/Icon";
import { useAppStore } from "@/store/useAppStore";
import { GENRES } from "@/lib/genres";
import { tracksByGenre } from "@/lib/music";
import { defaultAppearance } from "@/lib/appearance";
import type { Track } from "@/lib/types";

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
  const ap = user?.character.appearance ?? defaultAppearance();

  const [near, setNear] = useState<Spot | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Track | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [isNew, setIsNew] = useState(false);

  const dig = async (s: Spot) => {
    if (busy) return;
    setBusy(true);
    try {
      const list = await tracksByGenre(s.genre, 14);
      const pool = list.filter((t) => t.previewUrl && !hasDigg(t.id));
      const arr = pool.length ? pool : list.filter((t) => t.previewUrl);
      if (arr.length) {
        const pick = arr[Math.floor(Math.random() * arr.length)];
        const fresh = addDigg(pick, null); // 신규면 true
        logListen(pick, 0);
        setResult(pick);
        setIsNew(fresh);
        setStartedAt(Date.now());
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative h-[calc(100dvh-96px)] overflow-hidden bg-[#7cc96b]">
      <MapScene2D
        bodyColor={ap.outfit}
        accentColor={ap.hairColor}
        spots={SPOTS}
        onNear={setNear}
        onDig={dig}
      />

      {/* 상단 HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <span className="chip bg-black/45 text-white text-[11px]">🎧 디깅 월드 · WASD 이동</span>
        <span className="chip bg-white/90 text-ink-900 text-[11px] font-bold flex items-center gap-1">
          <Icon name="music" size={13} /> 디깅함 {diggs.length}
        </span>
      </div>

      {/* 근접 디깅 버튼 */}
      {near && !result && (
        <button
          onClick={() => dig(near)}
          disabled={busy}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 btn-primary shadow-soft animate-bob whitespace-nowrap"
        >
          {busy ? "디깅 중…" : `🎧 ${near.label}에서 디깅하기`}
        </button>
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
                {isNew ? "✨ 새로운 곡을 디깅했어요!" : "🎧 이미 디깅한 곡"}
              </p>
              <p className="text-sm font-bold truncate">{result.title}</p>
              <p className="text-xs text-ink-700/55 truncate">
                {result.artist} · {GENRES[result.genre].label}
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="shrink-0 w-8 h-8 grid place-items-center rounded-full bg-cream-100 text-ink-700"
              aria-label="닫기"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <AudioPlayer key={result.id} previewUrl={result.previewUrl} startedAt={startedAt} muted={false} />
        </div>
      )}
    </div>
  );
}
