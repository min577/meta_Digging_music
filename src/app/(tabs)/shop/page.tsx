"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import Avatar from "@/components/Avatar";
import { useAppStore } from "@/store/useAppStore";
import { FACES, FACE_LABEL, defaultAppearance, type Appearance, type FaceStyle } from "@/lib/appearance";

// Bean 마스코트 커스터마이즈 상점 — 본체색/목도리/안테나/표정
type Slot = "outfit" | "pants" | "hairColor" | "face";
type CosItem = { id: string; slot: Slot; value: string; name: string; price: number };

const PREMIUM_BODY = ["#5B7CFA", "#1ABC9C", "#E84393", "#9B59B6", "#FF7675", "#00B894", "#2D3436", "#F5A623"];
const PREMIUM_ACCENT = ["#FFE27A", "#FF6EC7", "#7CF5C8", "#FF8A5B", "#B388FF", "#FF5252", "#40C4FF", "#FFD23A"];

const ITEMS: CosItem[] = [
  ...PREMIUM_BODY.map((c, i) => ({ id: `body_${i}`, slot: "outfit" as Slot, value: c, name: "본체 컬러", price: 120 })),
  ...PREMIUM_ACCENT.map((c, i) => ({ id: `scarf_${i}`, slot: "pants" as Slot, value: c, name: "목도리", price: 100 })),
  ...PREMIUM_ACCENT.map((c, i) => ({ id: `ant_${i}`, slot: "hairColor" as Slot, value: c, name: "안테나 글로우", price: 90 })),
  ...FACES.map((f) => ({ id: `face_${f}`, slot: "face" as Slot, value: f, name: FACE_LABEL[f], price: 150 })),
];

const TABS: { id: Slot; label: string }[] = [
  { id: "outfit", label: "본체색" },
  { id: "pants", label: "목도리" },
  { id: "hairColor", label: "안테나" },
  { id: "face", label: "표정" },
];

export default function ShopPage() {
  const user = useAppStore((s) => s.user);
  const coins = user?.coins ?? 0;
  const spend = useAppStore((s) => s.spendCoins);
  const setAppearance = useAppStore((s) => s.setAppearance);
  const ap = user?.character.appearance ?? defaultAppearance();

  const [tab, setTab] = useState<Slot>("outfit");
  const [owned, setOwned] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<CosItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const items = useMemo(() => ITEMS.filter((i) => i.slot === tab), [tab]);

  const equip = (i: CosItem) => setAppearance({ ...ap, [i.slot]: i.value } as Appearance);
  const isEquipped = (i: CosItem) => (ap as any)[i.slot] === i.value;

  const act = (i: CosItem) => {
    if (owned.includes(i.id)) {
      equip(i);
      setToast(`착용 완료! ✨`);
      setTimeout(() => setToast(null), 1300);
      return;
    }
    setConfirm(i);
  };

  const buy = (i: CosItem) => {
    if (spend(i.price)) {
      setOwned((o) => [...o, i.id]);
      equip(i);
      setToast(`${i.name} 구매·착용! 🎉`);
    } else {
      setToast("코인이 부족해요 🪙");
    }
    setConfirm(null);
    setTimeout(() => setToast(null), 1600);
  };

  const preview = (i: CosItem): Appearance => ({ ...ap, [i.slot]: i.value } as Appearance);

  return (
    <div>
      <TopBar title="상점" sub="나의 Bean을 꾸며보세요" />

      {/* 미리보기 + 코인 */}
      <div className="px-5 flex items-center gap-4">
        <div className="rounded-3xl bg-cream-50 border border-cream-200 px-6 py-3 shadow-card">
          <Avatar appearance={ap} size={96} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-ink-700/60">보유 코인</p>
          <p className="text-2xl font-extrabold text-ink-900">🪙 {coins}</p>
          <p className="text-[11px] text-ink-700/45 mt-1">디깅·퀘스트로 코인을 모아요</p>
        </div>
      </div>

      {/* 슬롯 탭 */}
      <div className="px-5 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
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
          const own = owned.includes(i.id);
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
                <Avatar appearance={preview(confirm)} size={110} />
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
