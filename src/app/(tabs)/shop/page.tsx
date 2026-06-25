"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import Avatar from "@/components/Avatar";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import { GENRES } from "@/lib/genres";
import {
  HATS,
  HAT_LABEL,
  GLASSES,
  GLASSES_LABEL,
  defaultAppearance,
  type Appearance,
  type HatStyle,
  type GlassesStyle,
} from "@/lib/appearance";

// Bean 악세서리 상점 — 부가적인 모자/안경을 코인으로 구매·착용.
// (본체색/목도리/머리/표정 기본 외형은 무료 — 마이페이지 "기본 꾸미기"에서 변경)
type Slot = "hat" | "glasses";
type ShopItem = { id: string; slot: Slot; value: string; name: string; price: number };

const HAT_PRICE: Record<HatStyle, number> = {
  none: 0, cap: 120, beanie: 120, headphones: 160, fedora: 150, flower: 90, crown: 300, party: 140,
};
const GLASSES_PRICE: Record<GlassesStyle, number> = {
  none: 0, round: 110, sun: 160, star: 150, heart: 130,
};

const ITEMS: ShopItem[] = [
  ...HATS.filter((h) => h !== "none").map((h) => ({
    id: `hat_${h}`, slot: "hat" as Slot, value: h, name: HAT_LABEL[h], price: HAT_PRICE[h],
  })),
  ...GLASSES.filter((g) => g !== "none").map((g) => ({
    id: `glasses_${g}`, slot: "glasses" as Slot, value: g, name: GLASSES_LABEL[g], price: GLASSES_PRICE[g],
  })),
];

const TABS: { id: Slot; label: string }[] = [
  { id: "hat", label: "🎩 모자" },
  { id: "glasses", label: "🕶️ 안경" },
];

export default function ShopPage() {
  const user = useAppStore((s) => s.user);
  const coins = user?.coins ?? 0;
  const spend = useAppStore((s) => s.spendCoins);
  const setAppearance = useAppStore((s) => s.setAppearance);
  const ownedItems = useAppStore((s) => s.ownedItems);
  const ownItem = useAppStore((s) => s.ownItem);
  const myGenre = useMyTopGenre();
  const auraColor = GENRES[myGenre].color;
  const ap = user?.character.appearance ?? defaultAppearance();

  const [tab, setTab] = useState<Slot>("hat");
  const [confirm, setConfirm] = useState<ShopItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const items = useMemo(() => ITEMS.filter((i) => i.slot === tab), [tab]);

  const isEquipped = (i: ShopItem) => (ap as any)[i.slot] === i.value;
  // 구매했거나(영구보유) 이미 착용 중(업적 보상 등)이면 보유로 간주
  const isOwned = (i: ShopItem) => ownedItems.includes(i.id) || isEquipped(i);
  const equip = (i: ShopItem) => setAppearance({ ...ap, [i.slot]: i.value } as Appearance);
  const preview = (i: ShopItem): Appearance => ({ ...ap, [i.slot]: i.value } as Appearance);

  const flash = (msg: string, ms = 1400) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const act = (i: ShopItem) => {
    if (isEquipped(i)) {
      // 착용 중인 슬롯을 다시 누르면 해제
      setAppearance({ ...ap, [i.slot]: "none" } as Appearance);
      flash("벗었어요 👋");
      return;
    }
    if (isOwned(i)) {
      equip(i);
      flash("착용 완료! ✨");
      return;
    }
    setConfirm(i);
  };

  const buy = (i: ShopItem) => {
    if (spend(i.price)) {
      ownItem(i.id);
      equip(i);
      flash(`${i.name} 구매·착용! 🎉`, 1600);
    } else {
      flash("코인이 부족해요 🪙", 1600);
    }
    setConfirm(null);
  };

  return (
    <div>
      <TopBar title="상점" sub="모자·안경으로 나의 Bean을 꾸며보세요" />

      {/* 미리보기 + 코인 */}
      <div className="px-5 flex items-center gap-4">
        <div className="rounded-3xl bg-cream-50 border border-cream-200 px-6 py-3 shadow-card">
          <Avatar appearance={ap} size={96} aura={auraColor} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-ink-700/60">보유 코인</p>
          <p className="text-2xl font-extrabold text-ink-900">🪙 {coins}</p>
          <p className="text-[11px] text-ink-700/45 mt-1">디깅·퀘스트로 코인을 모아요</p>
        </div>
      </div>

      <p className="px-5 mt-3 text-[11px] text-ink-700/50">
        본체색·목도리·머리·표정은 <span className="font-bold text-ink-700/70">마이페이지 › 기본 꾸미기</span>에서 무료로 바꿀 수 있어요.
      </p>

      {/* 슬롯 탭 */}
      <div className="px-5 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`chip py-1.5 px-4 shrink-0 ${
              tab === t.id ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      <section className="px-5 mt-3 grid grid-cols-3 gap-3 pb-4">
        {items.map((i) => {
          const eq = isEquipped(i);
          const own = isOwned(i);
          return (
            <button
              key={i.id}
              onClick={() => act(i)}
              className={`card p-2 flex flex-col items-center transition active:scale-[0.98] ${
                eq ? "ring-2 ring-brand" : ""
              }`}
            >
              <Avatar appearance={preview(i)} size={62} bob={false} />
              <span className="text-[10px] text-ink-700/60 mt-1">{i.name}</span>
              <span
                className={`mt-1 chip py-0.5 px-2 text-[11px] font-bold ${
                  eq ? "bg-brand/15 text-brand-dark" : own ? "bg-cream-200 text-ink-700" : "bg-brand text-white"
                }`}
              >
                {eq ? "착용 중" : own ? "착용" : `🪙 ${i.price}`}
              </span>
            </button>
          );
        })}
      </section>

      {/* 구매 확인 */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirm(null)}
            className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 w-full max-w-[320px] text-center"
            >
              <div className="flex justify-center">
                <Avatar appearance={preview(confirm)} size={110} aura={auraColor} />
              </div>
              <p className="font-extrabold text-lg mt-2">{confirm.name}</p>
              <p className="mt-2 font-bold text-brand-dark">
                🪙 {confirm.price} <span className="text-xs text-ink-700/40">(보유 {coins})</span>
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setConfirm(null)} className="btn-ghost flex-1">
                  취소
                </button>
                <button onClick={() => buy(confirm)} className="btn-primary flex-1">
                  구매·착용
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-ink-900 text-cream-50 px-5 py-3 rounded-2xl shadow-soft text-sm font-bold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
