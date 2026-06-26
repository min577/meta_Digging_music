"use client";

import type { Appearance } from "@/lib/appearance";
import { DEFAULT_PRESET, COSTUME_PRESETS } from "@/lib/characters";

export type Dir = "down" | "up" | "left" | "right";

// (구) costume(svg)값 → 프리셋 파일 매핑 (백워드 호환)
const COSTUME_SRC: Record<string, string> = Object.fromEntries(
  COSTUME_PRESETS.map((c) => [c.id, c.src])
);

function presetOf(a?: Appearance): string {
  if (!a) return DEFAULT_PRESET;
  if (a.preset) return a.preset;
  if (a.costume && a.costume !== "none" && COSTUME_SRC[a.costume]) return COSTUME_SRC[a.costume];
  return DEFAULT_PRESET;
}

// 디깅타운 마스코트 — 디자인 가이드의 실제 PNG를 그대로 렌더.
export default function Avatar({
  appearance,
  size = 72,
  walking = false,
  dir = "down",
  bob = true,
  aura,
}: {
  appearance?: Appearance;
  size?: number;
  walking?: boolean;
  dir?: Dir;
  bob?: boolean;
  /** 발밑 취향 오라 색 (대표 장르) */
  aura?: string;
}) {
  const flip = dir === "left";
  const src = `/characters/${presetOf(appearance)}`;
  const h = size * 1.18;

  return (
    <div
      style={{
        width: size,
        height: h,
        transform: flip ? "scaleX(-1)" : undefined,
        animation: walking
          ? "avatarWalk 0.5s ease-in-out infinite"
          : bob
          ? "avatarIdle 2.6s ease-in-out infinite"
          : undefined,
      }}
      className="relative select-none"
      aria-label="아바타"
    >
      {/* 발밑 취향 오라 */}
      {aura && (
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            bottom: h * 0.02,
            width: size * 0.7,
            height: size * 0.18,
            background: `radial-gradient(closest-side, ${aura}, transparent)`,
            opacity: 0.55,
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="relative w-full h-full object-contain"
        style={{ filter: "drop-shadow(0 4px 5px rgba(62,55,44,0.18))" }}
      />
    </div>
  );
}
