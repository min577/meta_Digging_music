"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import { SHOP_ITEMS } from "@/lib/mock";
import { useAppStore } from "@/store/useAppStore";
import type { ShopItem } from "@/lib/types";

const CATS: { id: ShopItem["category"] | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "costume", label: "의상" },
  { id: "theme", label: "룸 테마" },
  { id: "boost", label: "부스트" },
  { id: "evolution", label: "진화" },
];

export default function ShopPage() {
  const coins = useAppStore((s) => s.user?.coins ?? 0);
  const spend = useAppStore((s) => s.spendCoins);
  const [cat, setCat] = useState<ShopItem["category"] | "all">("all");
  const [confirm, setConfirm] = useState<ShopItem | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const items =
    cat === "all" ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === cat);
  const deals = SHOP_ITEMS.filter((i) => i.discountPct);

  const priceOf = (i: ShopItem) =>
    i.discountPct ? Math.round(i.price * (1 - i.discountPct / 100)) : i.price;

  const buy = (i: ShopItem) => {
    const ok = spend(priceOf(i));
    if (ok) {
      setOwned((o) => [...o, i.id]);
      setToast(`${i.name} 구매 완료! 🎉`);
    } else {
      setToast("코인이 부족해요 🪙");
    }
    setConfirm(null);
    setTimeout(() => setToast(null), 1600);
  };

  return (
    <div>
      <TopBar title="상점" sub="아바타를 꾸미고 룸을 단장해요" />

      {/* 오늘의 할인 */}
      {deals.length > 0 && (
        <section className="px-5">
          <p className="font-bold text-ink-900 mb-2">🔥 오늘의 할인</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {deals.map((i) => (
              <button
                key={i.id}
                onClick={() => setConfirm(i)}
                className="card shrink-0 w-36 p-3 text-left relative"
              >
                <span className="absolute top-2 right-2 chip bg-live text-white">
                  -{i.discountPct}%
                </span>
                <div className="text-3xl">{i.emoji}</div>
                <p className="font-bold text-sm mt-2">{i.name}</p>
                <p className="text-[11px] text-ink-700/50 line-through">
                  🪙 {i.price}
                </p>
                <p className="text-sm font-bold text-brand-dark">🪙 {priceOf(i)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 카테고리 */}
      <div className="px-5 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`chip py-1.5 px-4 shrink-0 ${
              cat === c.id ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      <section className="px-5 mt-3 grid grid-cols-2 gap-3">
        {items.map((i) => {
          const isOwned = owned.includes(i.id);
          return (
            <div key={i.id} className="card p-4 flex flex-col">
              <div className="text-3xl">{i.emoji}</div>
              <p className="font-bold text-sm mt-2">{i.name}</p>
              <p className="text-[11px] text-ink-700/50 flex-1 leading-snug mt-0.5">
                {i.desc}
              </p>
              <button
                onClick={() => !isOwned && setConfirm(i)}
                disabled={isOwned}
                className={`mt-3 rounded-2xl py-2 text-sm font-bold transition ${
                  isOwned
                    ? "bg-cream-200 text-ink-700/50"
                    : "bg-brand text-white active:scale-[0.98]"
                }`}
              >
                {isOwned ? "보유 중" : `🪙 ${priceOf(i)}`}
              </button>
            </div>
          );
        })}
      </section>

      {/* 구매 확인 모달 */}
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
              <div className="text-5xl">{confirm.emoji}</div>
              <p className="font-extrabold text-lg mt-3">{confirm.name}</p>
              <p className="text-sm text-ink-700/55 mt-1">{confirm.desc}</p>
              <p className="mt-3 font-bold text-brand-dark">
                🪙 {priceOf(confirm)}{" "}
                <span className="text-xs text-ink-700/40">
                  (보유 {coins})
                </span>
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setConfirm(null)} className="btn-ghost flex-1">
                  취소
                </button>
                <button onClick={() => buy(confirm)} className="btn-primary flex-1">
                  구매
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 토스트 */}
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
