"use client";

import { useEffect, useRef } from "react";

// YouTube IFrame Player API 래퍼.
// videoId + startedAt(ms epoch)를 받아, "지금 시점에 맞는 위치"로 seek 동기화 재생한다.
// 기획서 5장: 서버는 (videoId + startedAt)만 broadcast → 각 클라이언트가 (now - startedAt)만큼 seek.

let apiLoading: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).YT?.Player) return Promise.resolve();
  if (apiLoading) return apiLoading;
  apiLoading = new Promise<void>((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => resolve();
  });
  return apiLoading;
}

export interface YTHandle {
  player: any;
}

export default function YouTubePlayer({
  videoId,
  startedAt,
  muted,
  onProgress,
  onEnded,
}: {
  videoId: string;
  startedAt: number;
  muted: boolean;
  onProgress?: (sec: number, duration: number) => void;
  onEnded?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const rafRef = useRef<number>();
  const currentVideo = useRef<string>("");

  // 플레이어 1회 생성
  useEffect(() => {
    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (cancelled || !containerRef.current) return;
      const YT = (window as any).YT;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e: any) => {
            currentVideo.current = videoId;
            if (muted) e.target.mute();
            seekToLive(e.target);
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            // 0 = ended
            if (e.data === 0) onEnded?.();
          },
        },
      });
    });
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        playerRef.current?.destroy();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // videoId / startedAt 변경 시 곡 교체 + 재동기화
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !p.loadVideoById) return;
    if (currentVideo.current !== videoId) {
      currentVideo.current = videoId;
      const offset = Math.max(0, (Date.now() - startedAt) / 1000);
      p.loadVideoById({ videoId, startSeconds: offset });
    } else {
      seekToLive(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, startedAt]);

  // 음소거 토글
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !p.mute) return;
    muted ? p.mute() : p.unMute();
  }, [muted]);

  // 진행률 추적 + drift 보정
  useEffect(() => {
    function tick() {
      const p = playerRef.current;
      if (p && p.getCurrentTime && p.getDuration) {
        const cur = p.getCurrentTime() ?? 0;
        const dur = p.getDuration() ?? 0;
        onProgress?.(cur, dur);
        // drift 보정: 기대 위치와 2초 이상 어긋나면 다시 seek
        const expected = (Date.now() - startedAt) / 1000;
        if (dur > 0 && expected < dur && Math.abs(expected - cur) > 2) {
          p.seekTo(expected, true);
        }
      }
      rafRef.current = window.setTimeout(tick, 1000) as unknown as number;
    }
    rafRef.current = window.setTimeout(tick, 1000) as unknown as number;
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  function seekToLive(p: any) {
    const offset = Math.max(0, (Date.now() - startedAt) / 1000);
    try {
      p.seekTo(offset, true);
    } catch {}
  }

  return (
    <div className="w-full h-full overflow-hidden rounded-2xl bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
