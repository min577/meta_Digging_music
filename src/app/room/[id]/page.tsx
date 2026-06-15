"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "@/components/AudioPlayer";
import Character from "@/components/Character";
import TrackSearch from "@/components/TrackSearch";
import { useRoomSession } from "@/hooks/useRoomSession";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import { GENRES } from "@/lib/genres";
import { topGenre } from "@/lib/taste";
import type { Track } from "@/lib/types";

const REACTIONS = ["❤️", "🔥", "🎶", "😭", "🕺", "👏"];

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const myGenre = useMyTopGenre();
  const addDigg = useAppStore((s) => s.addDigg);
  const hasDigg = useAppStore((s) => s.hasDigg);
  const logListen = useAppStore((s) => s.logListen);
  const enterRoom = useAppStore((s) => s.enterRoom);
  const progressQuest = useAppStore((s) => s.progressQuest);

  const session = useRoomSession(
    id,
    user?.handle ?? "나",
    user?.character.baseType ?? "hood",
    myGenre
  );

  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState({ cur: 0, dur: 0 });
  const [tab, setTab] = useState<"queue" | "chat">("queue");
  const [showSuggest, setShowSuggest] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [savedToast, setSavedToast] = useState(false);
  const listenAccum = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    enterRoom(id);
  }, [id, enterRoom]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.chat.length]);

  // 30초 이상 청취 시 취향 벡터에 반영
  useEffect(() => {
    listenAccum.current = 0;
  }, [session.play?.track.id]);

  if (!session.room) {
    return (
      <div className="phone-shell min-h-[100dvh] grid place-items-center">
        <div className="text-center">
          <p className="text-ink-700">룸을 찾을 수 없어요 😢</p>
          <button onClick={() => router.push("/home")} className="btn-primary mt-4">
            홈으로
          </button>
        </div>
      </div>
    );
  }

  const room = session.room;
  const g = GENRES[session.play ? session.play.track.genre : topGenre(room.tasteVector)];
  const track = session.play?.track;
  const pct = progress.dur > 0 ? (progress.cur / progress.dur) * 100 : 0;
  const isHost = room.queueMode === "dj"; // 데모: dj 모드면 스킵 권한

  const handleProgress = (cur: number, dur: number) => {
    setProgress({ cur, dur });
    listenAccum.current += 1;
    if (listenAccum.current === 30 && track) {
      logListen(track, 30);
    }
  };

  const onSaveDigg = () => {
    if (!track) return;
    const isNew = addDigg(track, room.id);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  const onSuggest = (t: Track) => {
    session.suggest(t);
    setShowSuggest(false);
    progressQuest("q_daily_3", 1);
  };

  const sendChat = () => {
    const v = chatInput.trim();
    if (!v) return;
    session.sendChat(v);
    setChatInput("");
  };

  return (
    <div
      className="phone-shell min-h-[100dvh] flex flex-col"
      style={{ background: `linear-gradient(180deg, ${g.bg[0]}, ${g.bg[1]})` }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2 text-white">
        <button
          onClick={() => router.push("/home")}
          className="w-9 h-9 rounded-full bg-black/25 grid place-items-center"
        >
          ←
        </button>
        <div className="text-center">
          <p className="font-bold text-sm truncate max-w-[200px]">{room.title}</p>
          <p className="text-[11px] text-white/70">
            👥 {session.online}명 ·{" "}
            {session.connected === "realtime" ? "🟢 실시간 동기화" : "🟡 데모 동기화"}
          </p>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          className="w-9 h-9 rounded-full bg-black/25 grid place-items-center"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      {/* Now Playing — 30초 미리듣기 + 앨범아트 */}
      <div className="px-4">
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-soft py-6 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${g.bg[0]}, ${g.bg[1]})` }}
        >
          <span className="absolute top-2 right-2 chip bg-black/35 text-white text-[10px]">
            ▶ 30초 미리듣기
          </span>
          {track?.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.artwork}
              alt={track.title}
              className="w-36 h-36 rounded-2xl object-cover shadow-soft"
            />
          ) : (
            <div className="w-36 h-36 rounded-2xl grid place-items-center text-5xl bg-black/20">
              {g.emoji}
            </div>
          )}
          {session.play && track?.previewUrl && (
            <AudioPlayer
              previewUrl={track.previewUrl}
              startedAt={session.play.startedAt}
              muted={muted}
              onProgress={handleProgress}
              onEnded={session.skip}
            />
          )}
        </div>
        {track && (
          <div className="mt-2 flex items-center justify-between text-white">
            <div className="min-w-0">
              <p className="font-bold truncate">{track.title}</p>
              <p className="text-xs text-white/70 truncate">
                {track.artist} · {g.emoji} {g.label}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onSaveDigg}
                className={`w-10 h-10 rounded-full grid place-items-center text-lg ${
                  hasDigg(track.id) ? "bg-white text-brand" : "bg-black/25"
                }`}
                title="디깅함 저장"
              >
                {hasDigg(track.id) ? "💾" : "＋"}
              </button>
              {isHost && (
                <button
                  onClick={session.skip}
                  className="w-10 h-10 rounded-full bg-black/25 grid place-items-center"
                  title="다음 곡"
                >
                  ⏭
                </button>
              )}
            </div>
          </div>
        )}
        {/* 진행바 */}
        <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 캐릭터 무대 + 반응 */}
      <div className="relative flex-1 min-h-[140px] mt-2 overflow-hidden">
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 px-4">
          {/* 나 */}
          <div className="flex flex-col items-center">
            <Character genre={myGenre} baseType={user?.character.baseType} size={64} bpm={g.bpm} />
            <span className="text-[10px] text-white/80 font-semibold">나</span>
          </div>
          {room.members.slice(0, 7).map((m) => (
            <div key={m.userId} className="flex flex-col items-center">
              <Character genre={m.topGenre} baseType={m.baseType} size={56} bpm={g.bpm} />
              <span className="text-[10px] text-white/70 truncate max-w-[56px]">
                {m.handle}
              </span>
            </div>
          ))}
        </div>

        {/* 떠다니는 반응 */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatePresence>
            {session.reactions.map((r, i) => (
              <span
                key={r.id}
                className="float-heart absolute text-2xl"
                style={{ left: `${15 + ((i * 23) % 70)}%`, bottom: 10 }}
              >
                {r.emoji}
              </span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 반응 버튼 */}
      <div className="px-4 flex gap-2 justify-center pb-1">
        {REACTIONS.map((e) => (
          <button
            key={e}
            onClick={() => session.react(e)}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur grid place-items-center text-lg active:scale-90 transition"
          >
            {e}
          </button>
        ))}
      </div>

      {/* 큐 / 채팅 패널 */}
      <div className="bg-cream-50 rounded-t-3xl mt-2 flex flex-col min-h-[34vh] max-h-[44vh]">
        <div className="flex items-center gap-2 px-4 pt-3">
          <button
            onClick={() => setTab("queue")}
            className={`chip py-1.5 px-4 ${
              tab === "queue" ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            🤝 큐 ({session.queue.length})
          </button>
          <button
            onClick={() => setTab("chat")}
            className={`chip py-1.5 px-4 ${
              tab === "chat" ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            💬 채팅
          </button>
          {room.queueMode === "collab" && tab === "queue" && (
            <button
              onClick={() => setShowSuggest(true)}
              className="ml-auto chip py-1.5 px-3 bg-brand/10 text-brand-dark font-bold"
            >
              ＋ 곡 제안
            </button>
          )}
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
          {tab === "queue" ? (
            <div className="space-y-2">
              {session.queue.length === 0 && (
                <p className="text-center text-ink-700/40 text-sm py-6">
                  큐가 비었어요. 좋은 곡을 제안해보세요!
                </p>
              )}
              {session.queue.map((item, idx) => {
                const ig = GENRES[item.track.genre];
                return (
                  <div key={item.id} className="flex items-center gap-3 card px-3 py-2">
                    <span className="text-xs font-bold text-ink-700/40 w-4">
                      {idx + 1}
                    </span>
                    <span
                      className="w-8 h-8 rounded-lg grid place-items-center"
                      style={{ background: ig.color + "22" }}
                    >
                      {ig.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {item.track.title}
                      </p>
                      <p className="text-[11px] text-ink-700/50 truncate">
                        {item.track.artist} · {item.suggestedByHandle} 제안
                      </p>
                    </div>
                    <button
                      onClick={() => session.like(item.id)}
                      className={`flex items-center gap-1 chip py-1 px-2.5 ${
                        item.likedByMe
                          ? "bg-live/15 text-live"
                          : "bg-cream-100 text-ink-700"
                      }`}
                    >
                      ❤️ {item.likes}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {session.chat.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-bold text-ink-800">{m.handle}</span>{" "}
                  <span className="text-ink-700">{m.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* 채팅 입력 */}
        {tab === "chat" && (
          <div className="px-4 pb-4 pt-1 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="메시지 보내기…"
              className="flex-1 card px-4 py-2.5 text-sm outline-none"
            />
            <button onClick={sendChat} className="btn-primary px-4 py-2.5">
              전송
            </button>
          </div>
        )}
      </div>

      {/* 디깅 저장 토스트 */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink-900 text-cream-50 px-5 py-3 rounded-2xl shadow-soft text-sm font-bold"
          >
            💾 디깅함에 저장했어요! (+10 💎)
          </motion.div>
        )}
      </AnimatePresence>

      {/* 곡 제안 모달 */}
      <AnimatePresence>
        {showSuggest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={() => setShowSuggest(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-cream-100 rounded-t-3xl p-5 max-h-[80vh]"
            >
              <div className="w-10 h-1 bg-cream-300 rounded-full mx-auto mb-4" />
              <h3 className="font-bold text-ink-900 mb-3">큐에 곡 제안하기</h3>
              <TrackSearch onPick={onSuggest} placeholder="제안할 곡 검색" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
