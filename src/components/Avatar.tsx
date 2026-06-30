"use client";

import { avatarSrc, type Appearance } from "@/lib/appearance";

export type Dir = "down" | "up" | "left" | "right";

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
  const src = avatarSrc(appearance);
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
