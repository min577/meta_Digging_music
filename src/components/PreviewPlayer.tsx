"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// 30초 미리듣기 — 보이는 재생/일시정지 버튼 + 진행바.
// 자동재생을 시도하되(데스크탑), 차단되면 버튼으로 확실히 재생.
export default function PreviewPlayer({
  previewUrl,
  autoStart = true,
  accent = "#7B5EE6",
}: {
  previewUrl: string;
  autoStart?: boolean;
  accent?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setProgress(0);
    if (autoStart && previewUrl) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const disabled = !previewUrl;
  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={toggle}
        disabled={disabled}
        className="w-9 h-9 rounded-full grid place-items-center text-white shrink-0 active:scale-95 transition disabled:opacity-40"
        style={{ background: accent }}
        aria-label={playing ? "일시정지" : "재생"}
      >
        <Icon name={playing ? "pause" : "play"} size={16} fill="currentColor" />
      </button>
      <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${progress * 100}%`, background: accent }} />
      </div>
      <audio ref={audioRef} src={previewUrl} preload="auto" />
    </div>
  );
}
