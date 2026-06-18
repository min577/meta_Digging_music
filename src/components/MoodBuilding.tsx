"use client";

import { motion } from "framer-motion";
import PlaceScene from "./PlaceScene";
import type { PlaceId } from "@/lib/places";

// 무드 공간 미리보기 — 장소별 오리지널 일러스트(둥근 카드) + 무드 이모지 배지.
export default function MoodBuilding({
  place,
  emoji,
  size = 120,
  float = true,
}: {
  place: PlaceId;
  emoji: string;
  size?: number;
  float?: boolean;
}) {
  return (
    <motion.div
      style={{ width: size, height: size * 0.74 }}
      className="relative"
      animate={float ? { y: [0, -6, 0] } : undefined}
      transition={float ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-card ring-1 ring-black/5">
        <PlaceScene place={place} />
      </div>
      {/* 무드 이모지 배지 */}
      <div
        className="absolute -top-2 -right-1 w-8 h-8 rounded-full bg-cream-50 grid place-items-center text-lg shadow-card"
        style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.12))" }}
      >
        {emoji}
      </div>
    </motion.div>
  );
}
