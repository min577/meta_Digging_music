"use client";

import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import GenreIcon from "@/components/GenreIcon";
import { genre as genreOf } from "@/lib/genres";
import { matchPercent, sortedGenres } from "@/lib/taste";
import { personProfile } from "@/lib/people";
import type { GenreId } from "@/lib/genres";
import type { TasteVector } from "@/lib/types";

// 다른 사람 프로필 바텀시트 — 좋아하는 장르 · 프로필 뮤직 · 플레이리스트 · 취향 매칭
export default function ProfileSheet({
  handle,
  topGenre,
  myTaste,
  isFriend,
  onAddFriend,
  onClose,
}: {
  handle: string;
  topGenre: GenreId;
  myTaste: TasteVector;
  isFriend?: boolean;
  onAddFriend?: () => void;
  onClose: () => void;
}) {
  const p = personProfile(handle, topGenre);
  const g = genreOf(topGenre);
  const pct = matchPercent(myTaste, p.taste);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[440px] bg-cream-50 rounded-t-[28px] sm:rounded-[28px] shadow-soft max-h-[88vh] overflow-y-auto no-scrollbar"
        >
          {/* 헤더 */}
          <div
            className="relative px-5 pt-6 pb-5 rounded-t-[28px]"
            style={{ background: `linear-gradient(160deg, ${g.color}26, #FFFDF7)` }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/10 text-ink-700 grid place-items-center active:scale-90"
              aria-label="닫기"
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl p-1.5" style={{ background: `${g.color}22` }}>
                <Avatar appearance={p.appearance} size={84} aura={g.color} bob={false} />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-lg text-ink-900 truncate">{p.handle}</p>
                <p className="text-xs text-ink-700/60 mt-0.5">
                  {g.emoji} {g.label} 디깅러
                </p>
                <span
                  className="inline-flex items-center gap-1 mt-2 chip text-white font-bold py-1 px-2.5 text-xs"
                  style={{ background: g.color }}
                >
                  <Icon name="target" size={12} strokeWidth={2.4} /> 취향 {pct}% 일치
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* 좋아하는 장르 */}
            <section>
              <p className="text-sm font-bold text-ink-800 mb-2">좋아하는 장르</p>
              <div className="space-y-1.5">
                {sortedGenres(p.taste).map(([gid, v]) => (
                  <div key={gid} className="flex items-center gap-2">
                    <span className="text-xs w-14 text-ink-700 inline-flex items-center gap-1">
                      <GenreIcon genre={gid as GenreId} size={12} className="shrink-0" /> {genreOf(gid).label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${v * 100}%`, background: genreOf(gid).color }}
                      />
                    </div>
                    <span className="text-xs text-ink-700/55 w-9 text-right">
                      {Math.round(v * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 프로필 뮤직 */}
            {p.profileTrack && (
              <section>
                <p className="text-sm font-bold text-ink-800 mb-2 flex items-center gap-1.5"><Icon name="music" size={15} className="text-brand-dark" /> 프로필 뮤직</p>
                <a
                  href={p.profileTrack.previewUrl || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="card p-3 flex items-center gap-3 active:scale-[0.99] transition"
                >
                  <span
                    className="w-11 h-11 rounded-xl grid place-items-center text-xl shrink-0"
                    style={{ background: genreOf(p.profileTrack.genre).color + "22" }}
                  >
                    {genreOf(p.profileTrack.genre).emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{p.profileTrack.title}</p>
                    <p className="text-xs text-ink-700/50 truncate">{p.profileTrack.artist}</p>
                  </div>
                  <Icon name="play" size={16} className="text-brand-dark" fill="currentColor" />
                </a>
              </section>
            )}

            {/* 플레이리스트 */}
            {p.playlist.length > 0 && (
              <section>
                <p className="text-sm font-bold text-ink-800 mb-2">{p.handle}님의 플레이리스트</p>
                <div className="space-y-2">
                  {p.playlist.map((t) => (
                    <div key={t.id} className="card px-3 py-2 flex items-center gap-3">
                      <GenreIcon genre={t.genre as GenreId} size={18} className="shrink-0 text-ink-700/70" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{t.title}</p>
                        <p className="text-[10px] text-ink-700/50 truncate">
                          {t.artist} · {genreOf(t.genre).label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 액션 */}
            {!isFriend && onAddFriend && (
              <button
                onClick={() => {
                  onAddFriend();
                  onClose();
                }}
                className="btn-primary w-full"
              >
                + 친구 추가
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
