"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import Icon from "@/components/Icon";
import GenreIcon from "@/components/GenreIcon";
import { useAppStore } from "@/store/useAppStore";
import { ROOMS } from "@/lib/mock";
import { GENRES, type GenreId } from "@/lib/genres";
import { ACHIEVEMENTS, buildStats } from "@/lib/achievements";

// 무드 선택 퀘스트(후궁선택 방식) — 분기 트리. 잎 노드는 추천 장르.
type Node =
  | { q: string; options: { label: string; emoji: string; next: Node }[] }
  | { result: GenreId };

const MOOD_TREE: Node = {
  q: "오늘 밤, 어떤 기분이에요?",
  options: [
    {
      label: "차분하게 가라앉히고 싶어",
      emoji: "🌙",
      next: {
        q: "혼자만의 시간엔?",
        options: [
          { label: "잔잔한 인디", emoji: "🎸", next: { result: "indie" } },
          { label: "무드 있는 R&B", emoji: "🍸", next: { result: "rnb" } },
          { label: "감성 발라드", emoji: "🎙️", next: { result: "ballad" } },
        ],
      },
    },
    {
      label: "설레고 들뜨고 싶어",
      emoji: "✨",
      next: {
        q: "어떤 설렘?",
        options: [
          { label: "네온 도시의 밤", emoji: "🌃", next: { result: "citypop" } },
          { label: "떼창하는 무대", emoji: "💖", next: { result: "kpop" } },
        ],
      },
    },
    {
      label: "에너지를 폭발시키고 싶어",
      emoji: "🔥",
      next: {
        q: "어떤 에너지?",
        options: [
          { label: "춤추는 루프탑", emoji: "🔊", next: { result: "edm" } },
          { label: "쿵쾅 힙합", emoji: "🎤", next: { result: "hiphop" } },
          { label: "기분 좋은 팝", emoji: "✨", next: { result: "pop" } },
        ],
      },
    },
  ],
};

export default function QuestsPage() {
  const router = useRouter();
  const quests = useAppStore((s) => s.quests);
  const claimQuest = useAppStore((s) => s.claimQuest);
  const listenEvents = useAppStore((s) => s.listenEvents);
  const diggs = useAppStore((s) => s.diggs);
  const level = useAppStore((s) => s.user?.level ?? 1);
  const [moodOpen, setMoodOpen] = useState(false);
  const [node, setNode] = useState<Node>(MOOD_TREE);

  const dailies = quests.filter((q) => q.type === "daily");
  const coop = quests.find((q) => q.type === "coop");

  // 도전 과제(누적 마일스톤) — 퀘스트와 같은 화면에서 한눈에
  const stats = buildStats(listenEvents, diggs, level);

  const pickRoomForGenre = (genre: GenreId) => {
    const room =
      ROOMS.find((r) => r.tasteVector[genre] && r.tasteVector[genre]! > 0.3) ??
      ROOMS.find((r) => r.locationId.includes(genre)) ??
      ROOMS[0];
    setMoodOpen(false);
    setNode(MOOD_TREE);
    router.push(`/room/${room.id}`);
  };

  return (
    <div>
      <TopBar title="디깅 퀘스트" sub="퀘스트를 깨고 보상을 받아요" />

      {/* 무드 선택 퀘스트 */}
      <section className="px-5">
        <button
          onClick={() => setMoodOpen(true)}
          className="w-full rounded-3xl p-5 text-left text-white shadow-soft active:scale-[0.99] transition"
          style={{ background: "linear-gradient(135deg,#6C8AE4,#9B6CE4)" }}
        >
          <p className="text-xs font-bold opacity-80">오늘의 무드 퀘스트</p>
          <p className="text-lg font-extrabold mt-1">오늘 밤 어떤 기분?</p>
          <p className="text-xs opacity-80 mt-1">
            기분을 따라가면 딱 맞는 큐레이션 룸으로 안내해요
          </p>
        </button>
      </section>

      {/* 데일리 퀘스트 */}
      <section className="px-5 mt-4">
        <p className="font-bold text-ink-900 mb-2 flex items-center gap-1.5"><Icon name="quest" size={17} className="text-brand-dark" /> 데일리 퀘스트</p>
        <div className="space-y-2">
          {dailies.map((q) => {
            const done = q.progress >= q.goal;
            const claimed = !!q.completedAt;
            return (
              <div key={q.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{q.title}</p>
                    <p className="text-[11px] text-ink-700/50">{q.detail}</p>
                  </div>
                  <span className="text-[11px] text-ink-700/50 shrink-0 ml-2 inline-flex items-center gap-1">
                    <Icon name="coin" size={12} className="text-gold" />{q.rewardCoins}
                    <Icon name="gem" size={12} className="text-brand" />{q.rewardPoints}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all"
                      style={{ width: `${(q.progress / q.goal) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-700/55">
                    {q.progress}/{q.goal}
                  </span>
                  <button
                    onClick={() => claimQuest(q.id)}
                    disabled={!done || claimed}
                    className={`chip py-1.5 px-3 font-bold ${
                      claimed
                        ? "bg-cream-200 text-ink-700/40"
                        : done
                        ? "bg-brand text-white"
                        : "bg-cream-100 text-ink-700/40"
                    }`}
                  >
                    {claimed ? "완료" : "받기"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 협동 미션 */}
      {coop && (
        <section className="px-5 mt-4">
          <p className="font-bold text-ink-900 mb-2 flex items-center gap-1.5"><Icon name="friends" size={17} className="text-brand-dark" /> 협동 미션 (방탈출)</p>
          <div className="card p-4">
            <p className="font-bold text-sm">{coop.title}</p>
            <p className="text-[11px] text-ink-700/50 mt-0.5">{coop.detail}</p>
            <div className="flex items-center gap-2 mt-3">
              {Array.from({ length: coop.goal }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 rounded-xl grid place-items-center ${
                    i < coop.progress
                      ? "bg-live/15 text-live"
                      : "bg-cream-100 text-ink-700/25"
                  }`}
                >
                  <Icon name="heart" size={16} fill={i < coop.progress ? "currentColor" : "none"} />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-ink-700/45 mt-2 text-center inline-flex items-center justify-center gap-1 w-full">
              {coop.goal - coop.progress}명 더 같은 곡에 좋아요하면 보상 해금!
              <Icon name="coin" size={12} className="text-gold" />{coop.rewardCoins}
            </p>
          </div>
        </section>
      )}

      {/* 수집 퀘스트 (누적 마일스톤) — 업적을 퀘스트로 통합 */}
      <section className="px-5 mt-4">
        <p className="font-bold text-ink-900 mb-2 flex items-center gap-1.5">
          <Icon name="trophy" size={17} className="text-brand-dark" /> 수집 퀘스트
        </p>
        <p className="text-[11px] text-ink-700/50 mb-2">
          음악을 듣고 디깅할수록 자동으로 달성되는 장기 퀘스트예요.
        </p>
        <div className="space-y-2">
          {ACHIEVEMENTS.map((a) => {
            const cur = Math.min(a.goal, a.measure(stats));
            const done = cur >= a.goal;
            return (
              <div key={a.id} className={`card p-4 ${done ? "" : "opacity-90"}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${done ? "" : "grayscale opacity-50"}`}>
                    {done ? a.icon : "🔒"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">
                      {a.title} {done && <span className="text-brand">✓</span>}
                    </p>
                    <p className="text-[11px] text-ink-700/50">{a.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all"
                      style={{ width: `${(cur / a.goal) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ink-700/55 w-10 text-right">
                    {cur}/{a.goal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 예약형 파티 (Phase 7) */}
      <section className="px-5 mt-4 mb-4">
        <p className="font-bold text-ink-900 mb-2">예약 리스닝 파티</p>
        <div className="space-y-2">
          {[
            { t: "오늘 밤 22:00", title: "시티팝 야간열차 디깅", g: "citypop" as GenreId, h: "yuki" },
            { t: "내일 09:00", title: "출근길 K-pop", g: "kpop" as GenreId, h: "rain" },
          ].map((p, i) => (
            <div key={i} className="card px-4 py-3 flex items-center gap-3">
              <span style={{ color: GENRES[p.g].color }}><GenreIcon genre={p.g} size={24} strokeWidth={2} /></span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.title}</p>
                <p className="text-[11px] text-ink-700/50">
                  {p.t} · {p.h} 호스트
                </p>
              </div>
              <button className="chip bg-brand/10 text-brand-dark font-bold py-1.5 px-3">
                알림
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 무드 선택 모달 (후궁선택 분기) */}
      <AnimatePresence>
        {moodOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 grid place-items-center px-6"
            onClick={() => {
              setMoodOpen(false);
              setNode(MOOD_TREE);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 w-full max-w-[340px]"
            >
              {"q" in node ? (
                <>
                  <p className="font-extrabold text-lg text-center text-ink-900">
                    {node.q}
                  </p>
                  <div className="space-y-2 mt-4">
                    {node.options.map((o) => (
                      <button
                        key={o.label}
                        onClick={() =>
                          "result" in o.next
                            ? pickRoomForGenre(o.next.result)
                            : setNode(o.next)
                        }
                        className="w-full card px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition"
                      >
                        <span className="text-2xl">{o.emoji}</span>
                        <span className="font-semibold text-sm">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
