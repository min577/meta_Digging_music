"use client";

import { useEffect, useRef } from "react";

// 30초 미리듣기(previewUrl) 오디오 플레이어.
// 룸의 (previewUrl + startedAt)에 맞춰 currentTime을 동기화 → 모두 같은 위치에서 청취.
// 기획서 5장 동기화 원리를 30초 프리뷰에 그대로 적용.
export default function AudioPlayer({
  previewUrl,
  startedAt,
  muted,
  volume = 1,
  loop = false,
  onProgress,
  onEnded,
}: {
  previewUrl: string;
  startedAt: number;
  muted: boolean;
  volume?: number; // 0~1 (자유모드 근접 볼륨)
  loop?: boolean; // 자유모드 스피커는 반복 재생
  onProgress?: (sec: number, duration: number) => void;
  onEnded?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // 곡/시작시각 변경 시 동기화 위치로 점프 후 재생
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !previewUrl) return;
    a.muted = muted;
    const seekToLive = () => {
      const offset = Math.max(0, (Date.now() - startedAt) / 1000);
      try {
        a.currentTime = Math.min(offset, (a.duration || 30) - 0.1);
      } catch {}
      a.play().catch(() => {}); // 자동재생 차단 시 음소거 상태로만 진행
    };
    if (a.readyState >= 1) seekToLive();
    else a.addEventListener("loadedmetadata", seekToLive, { once: true });
    return () => a.removeEventListener("loadedmetadata", seekToLive);
  }, [previewUrl, startedAt]);

  // 음소거 / 볼륨 (근접 오디오)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
    a.volume = Math.max(0, Math.min(1, volume));
    if (!muted) a.play().catch(() => {});
  }, [muted, volume]);

  // 진행률 추적 + drift 보정
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const a = audioRef.current;
      if (!a) return;
      const dur = a.duration || 30;
      onProgress?.(a.currentTime, dur);
      const expected = (Date.now() - startedAt) / 1000;
      if (expected < dur && Math.abs(expected - a.currentTime) > 1.5) {
        try {
          a.currentTime = expected;
        } catch {}
      }
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [startedAt]);

  return (
    <audio
      ref={audioRef}
      src={previewUrl}
      preload="auto"
      loop={loop}
      onEnded={() => onEnded?.()}
    />
  );
}
