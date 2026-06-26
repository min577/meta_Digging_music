"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import Avatar from "@/components/Avatar";
import CoachTour, { type TourStep } from "@/components/CoachTour";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import { GENRES } from "@/lib/genres";
import { defaultAppearance, type Appearance } from "@/lib/appearance";
import { COSTUME_PRESETS, type CostumePreset } from "@/lib/characters";

const SHOP_TOUR: TourStep[] = [
  { target: "shop-preview", title: "내 캐릭터 미리보기", desc: "코스튬을 사면 바로 여기 미리 입혀져요." },
  { target: "shop-grid", title: "코스튬", desc: "마음에 드는 코스튬을 골라 구매·착용해요. 기본 캐릭터는 마이페이지에서 무료로 바꿔요." },
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

  const [confirm, setConfirm] = useState<CostumePreset | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isEquipped = (c: CostumePreset) => ap.preset === c.src;
  const isOwned = (c: CostumePreset) => ownedItems.includes(`costume_${c.id}`) || isEquipped(c);
  const equip = (c: CostumePreset) => setAppearance({ ...ap, preset: c.src } as Appearance);
  const preview = (c: CostumePreset): Appearance => ({ ...ap, preset: c.src } as Appearance);

  const flash = (m: string, ms = 1400) => {
    setToast(m);
    setTimeout(() => setToast(null), ms);
  };

  const act = (c: CostumePreset) => {
    if (isOwned(c)) {
      equip(c);
      flash("착용 완료! ✨");
      return;
    }
    setConfirm(c);
  };
  const buy = (c: CostumePreset) => {
    if (spend(c.price)) {
      ownItem(`costume_${c.id}`);
      equip(c);
      flash(`${c.name} 구매·착용! 🎉`, 1600);
    } else {
      flash("코인이 부족해요 🪙", 1600);
    }
    setConfirm(null);
  };

  return (
    <div>
      <CoachTour tourKey="shop" steps={SHOP_TOUR} />
      <TopBar title="상점" sub="코스튬으로 나의 캐릭터를 꾸며보세요" />

      {/* 미리보기 + 코인 */}
      <div data-tour="shop-preview" className="px-5 flex items-center gap-4">
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
        기본 캐릭터는 <span className="font-bold text-ink-700/70">마이페이지 › 캐릭터 고르기</span>에서 무료로 바꿀 수 있어요.
      </p>

      {/* 코스튬 그리드 */}
      <section data-tour="shop-grid" className="px-5 mt-3 grid grid-cols-2 gap-3 pb-4">
        {COSTUME_PRESETS.map((c) => {
          const eq = isEquipped(c);
          const own = isOwned(c);
          return (
            <button
              key={c.id}
              onClick={() => act(c)}
              className={`card p-3 flex flex-col items-center transition active:scale-[0.98] ${
                eq ? "ring-2 ring-brand" : ""
              }`}
            >
              <Avatar appearance={preview(c)} size={84} bob={false} />
              <span className="text-xs font-bold text-ink-800 mt-1">{c.name}</span>
              <span
                className={`mt-1.5 chip py-0.5 px-2.5 text-[11px] font-bold ${
                  eq ? "bg-brand/15 text-brand-dark" : own ? "bg-cream-200 text-ink-700" : "bg-brand text-white"
                }`}
              >
                {eq ? "착용 중" : own ? "착용" : `🪙 ${c.price}`}
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
                <Avatar appearance={preview(confirm)} size={120} aura={auraColor} />
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
