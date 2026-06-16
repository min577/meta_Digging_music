"use client";

import { useEffect, useState } from "react";

export type Phase = "dawn" | "day" | "dusk" | "night";

export interface TimePhase {
  phase: Phase;
  label: string;
  icon: string; // 해/달
  /** 맵 위에 덮는 조명 오버레이 (rgba) */
  overlay: string;
  isNight: boolean;
  clock: string; // HH:MM
}

function compute(d: Date): TimePhase {
  const h = d.getHours();
  const clock = `${String(h).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (h >= 5 && h < 8)
    return { phase: "dawn", label: "새벽", icon: "🌅", overlay: "rgba(255,150,90,0.16)", isNight: false, clock };
  if (h >= 8 && h < 17)
    return { phase: "day", label: "낮", icon: "☀️", overlay: "rgba(255,240,200,0.04)", isNight: false, clock };
  if (h >= 17 && h < 20)
    return { phase: "dusk", label: "노을", icon: "🌇", overlay: "rgba(255,100,60,0.22)", isNight: false, clock };
  return { phase: "night", label: "밤", icon: "🌙", overlay: "rgba(12,16,44,0.5)", isNight: true, clock };
}

// 실시간 낮/밤 — 분 단위로 갱신.
export function useTimePhase(): TimePhase {
  const [tp, setTp] = useState<TimePhase>(() => compute(new Date()));
  useEffect(() => {
    const tick = () => setTp(compute(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return tp;
}
