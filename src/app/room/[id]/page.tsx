"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "@/components/AudioPlayer";
import RoomMap, { type MapAvatar, type Speaker } from "@/components/RoomMap";
import TrackSearch from "@/components/TrackSearch";
import { useRoomSession } from "@/hooks/useRoomSession";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import { GENRES, GENRE_LIST } from "@/lib/genres";
import { topGenre } from "@/lib/taste";
import { tracksByGenre } from "@/lib/music";
import { appearanceFromSeed, defaultAppearance } from "@/lib/appearance";
import type { Track } from "@/lib/types";

const REACTIONS = ["❤️", "🔥", "🎶", "😭", "🕺", "👏"];
// 음악 존 배치 (월드 1400x1000 기준)
const SPOTS = [
  { x: 380, y: 350 },
  { x: 1020, y: 350 },
  { x: 380, y: 740 },
  { x: 1020, y: 740 },
];
type SpeakerT = Speaker & { track: Track };

// 꾸미기 가구 팔레트
const FURNITURE = [
  "🪴", "🛋️", "🪑", "🛏️", "🌳", "🌸", "🪩", "🎹", "📺", "🕯️",
  "🧸", "🖼️", "⛲", "🪵", "☕", "🎮", "🪟", "🎸", "🏮", "🛼",
];

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
  const roomDecorMap = useAppStore((s) => s.roomDecor);
  const placeDecorStore = useAppStore((s) => s.placeDecor);
  const removeDecorStore = useAppStore((s) => s.removeDecor);

  const session = useRoomSession(
    id,
    user?.handle ?? "나",
    user?.character.baseType ?? "custom",
    myGenre,
    user?.character.appearance
  );

  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState({ cur: 0, dur: 0 });
  const [tab, setTab] = useState<"queue" | "chat">("chat");
  const [showSuggest, setShowSuggest] = useState(false);
  const [showMyMusic, setShowMyMusic] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [savedToast, setSavedToast] = useState(false);
  const [speakers, setSpeakers] = useState<SpeakerT[]>([]);
  const [vols, setVols] = useState<{ id: string; volume: number }[]>([]);
  const [myTrack, setMyTrack] = useState<Track | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(FURNITURE[0]);
  const listenAccum = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const room = session.room;
  const mode = room?.roomMode ?? "party";

  useEffect(() => {
    enterRoom(id);
  }, [id, enterRoom]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.chat.length]);
  useEffect(() => {
    listenAccum.current = 0;
  }, [session.play?.track.id]);
  useEffect(() => {
    setTab(mode === "party" && room?.queueMode === "collab" ? "queue" : "chat");
  }, [mode, room?.queueMode]);

  const roomGenre = room ? topGenre(room.tasteVector) : "lofi";

  // 자유모드: 맵에 장르별 음악 존(스피커) 배치
  useEffect(() => {
    if (!room || mode !== "free") return;
    let active = true;
    (async () => {
      const genres = [
        roomGenre,
        ...GENRE_LIST.map((g) => g.id).filter((x) => x !== roomGenre),
      ].slice(0, SPOTS.length);
      const out: SpeakerT[] = [];
      for (let i = 0; i < genres.length; i++) {
        const tr = await tracksByGenre(genres[i], 1);
        if (tr[0])
          out.push({
            id: `spk_${genres[i]}`,
            x: SPOTS[i].x,
            y: SPOTS[i].y,
            genre: genres[i],
            label: GENRES[genres[i]].label,
            track: tr[0],
          });
      }
      if (active) setSpeakers(out);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, mode, roomGenre]);

  // 맵 NPC (룸 멤버)
  const npcs = useMemo<MapAvatar[]>(() => {
    if (!room) return [];
    return room.members.map((m, i) => ({
      id: m.userId,
      handle: m.handle,
      appearance: appearanceFromSeed(m.handle),
      x: 300 + (i % 4) * 300,
      y: 450 + Math.floor(i / 4) * 240,
    }));
  }, [room]);

  if (!room) {
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

  // 자유모드 오디오 소스 레지스트리: 스피커 존 + 플레이어 송출곡
  const remoteWithTrack = session.remotePlayers.filter((p) => p.track);
  const sourceTrack: Record<string, Track> = {};
  for (const s of speakers) sourceTrack[s.id] = s.track;
  for (const p of remoteWithTrack) sourceTrack[`player_${p.id}`] = p.track!;
  const sortedVols = [...vols].sort((a, b) => b.volume - a.volume);
  const loudest = sortedVols[0];
  const loudestTrack = loudest ? sourceTrack[loudest.id] : undefined;

  // 현재 들리는 곡: party=동기화 곡 / free=내 송출곡 우선, 없으면 가장 큰 주변 음악
  const track =
    mode === "free" ? myTrack ?? loudestTrack : session.play?.track;
  const headerVol = myTrack ? 1 : loudest?.volume ?? 0;
  const g = GENRES[track ? track.genre : roomGenre];
  const pct = progress.dur > 0 ? (progress.cur / progress.dur) * 100 : 0;
  const isHost = room.queueMode === "dj";

  const pickMyMusic = (t: Track) => {
    setMyTrack(t);
    session.setMyTrack(t);
    setShowMyMusic(false);
  };
  const stopMyMusic = () => {
    setMyTrack(null);
    session.setMyTrack(null);
  };

  // 꾸미기: 배치 / 삭제 (store 저장 + Realtime 동기화)
  const myDecor = roomDecorMap[id] ?? [];
  const placeAt = (x: number, y: number) => {
    const item = {
      id: `d_${Date.now()}_${Math.floor(Math.random() * 1e4)}`,
      emoji: selectedItem,
      x,
      y,
    };
    placeDecorStore(id, item);
    session.broadcastDecor([...myDecor, item]);
  };
  const removePlaced = (itemId: string) => {
    removeDecorStore(id, itemId);
    session.broadcastDecor(myDecor.filter((d) => d.id !== itemId));
  };

  const handleProgress = (cur: number, dur: number) => {
    setProgress({ cur, dur });
    listenAccum.current += 1;
    if (listenAccum.current === 30 && track) logListen(track, 30);
  };

  const onSaveDigg = () => {
    if (!track) return;
    addDigg(track, room.id);
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
            {mode === "free" ? "🎐 자유모드" : "🎙 리스닝 파티"} · 👥 {session.online} ·{" "}
            {session.connected === "realtime" ? "🟢 동기화" : "🟡 데모"}
          </p>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          className="w-9 h-9 rounded-full bg-black/25 grid place-items-center"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      {/* Now Playing 바 */}
      <div className="px-4">
        <div className="card p-2.5 flex items-center gap-3">
          {track?.artwork ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.artwork} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div
              className="w-12 h-12 rounded-xl grid place-items-center text-xl"
              style={{ background: g.color + "22" }}
            >
              {g.emoji}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {track ? (
              <>
                <p className="text-sm font-bold truncate text-ink-900">{track.title}</p>
                <p className="text-[11px] text-ink-700/55 truncate">
                  {track.artist} · {g.emoji} {g.label}
                  {mode === "free" && (
                    <span className="ml-1 text-brand-dark font-bold">
                      {myTrack ? "🎵 내 음악 송출 중" : `🔊 ${Math.round(headerVol * 100)}%`}
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-700/50">
                {mode === "free" ? "음악 존으로 다가가 보세요 🎐" : "곡 불러오는 중…"}
              </p>
            )}
          </div>
          {track && (
            <button
              onClick={onSaveDigg}
              className={`w-9 h-9 rounded-full grid place-items-center ${
                hasDigg(track.id) ? "bg-brand text-white" : "bg-cream-100"
              }`}
              title="디깅함 저장"
            >
              {hasDigg(track.id) ? "💾" : "＋"}
            </button>
          )}
          {mode === "party" && isHost && (
            <button
              onClick={session.skip}
              className="w-9 h-9 rounded-full bg-cream-100 grid place-items-center"
            >
              ⏭
            </button>
          )}
          {mode === "free" && (
            <button
              onClick={() => (myTrack ? stopMyMusic() : setShowMyMusic(true))}
              className={`shrink-0 chip py-2 px-3 font-bold ${
                myTrack ? "bg-live/15 text-live" : "bg-brand text-white"
              }`}
            >
              {myTrack ? "⏹ 내 음악 끄기" : "🎶 내 음악 틀기"}
            </button>
          )}
        </div>
        {mode === "party" && (
          <div className="mt-1.5 h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      {/* 오디오 엔진 */}
      {mode === "party" && session.play && track?.previewUrl && (
        <AudioPlayer
          previewUrl={track.previewUrl}
          startedAt={session.play.startedAt}
          muted={muted}
          onProgress={handleProgress}
          onEnded={session.skip}
        />
      )}
      {/* 자유모드: 내 송출곡(풀볼륨) + 주변 소스 거리별 볼륨 동시 믹싱 */}
      {mode === "free" && myTrack?.previewUrl && (
        <AudioPlayer
          key={`me_${myTrack.id}`}
          previewUrl={myTrack.previewUrl}
          startedAt={0}
          loop
          volume={1}
          muted={muted}
        />
      )}
      {mode === "free" &&
        vols.map((v) => {
          const t = sourceTrack[v.id];
          if (!t?.previewUrl) return null;
          return (
            <AudioPlayer
              key={v.id}
              previewUrl={t.previewUrl}
              startedAt={0}
              loop
              volume={v.volume}
              muted={muted || v.volume <= 0}
            />
          );
        })}

      {/* 맵 툴바 */}
      <div className="px-4 mt-2 flex items-center justify-between">
        <span className="text-[11px] text-white/70">
          {editMode ? "🔨 꾸미기 중 — 맵을 탭해 배치, 소품을 탭해 삭제" : ""}
        </span>
        <button
          onClick={() => setEditMode((e) => !e)}
          className={`chip py-1.5 px-3 font-bold ${
            editMode ? "bg-live text-white" : "bg-black/30 text-white"
          }`}
        >
          {editMode ? "완료" : "🔨 꾸미기"}
        </button>
      </div>

      {/* 가구 팔레트 (꾸미기 모드) */}
      {editMode && (
        <div className="px-4 mt-1 flex gap-1.5 overflow-x-auto no-scrollbar">
          {FURNITURE.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedItem(f)}
              className={`shrink-0 w-10 h-10 rounded-xl grid place-items-center text-xl ${
                selectedItem === f ? "bg-brand/30 ring-2 ring-brand" : "bg-black/25"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* 맵 */}
      <div className="px-4 mt-2 h-[46vh]">
        <RoomMap
          meAppearance={user?.character.appearance ?? defaultAppearance()}
          meHandle={user?.handle ?? "나"}
          meTrack={myTrack}
          genre={roomGenre}
          npcs={npcs}
          remote={session.remotePlayers}
          speakers={mode === "free" ? speakers : []}
          placed={[...myDecor, ...session.othersDecor]}
          editMode={editMode}
          onMove={session.broadcastMove}
          onAudio={(v) => setVols(v)}
          onPlaceAt={placeAt}
          onRemovePlaced={removePlaced}
        />
      </div>

      {/* 반응 버튼 */}
      <div className="px-4 mt-2 flex gap-2 justify-center">
        {REACTIONS.map((e) => (
          <button
            key={e}
            onClick={() => session.react(e)}
            className="w-9 h-9 rounded-full bg-black/20 backdrop-blur grid place-items-center text-lg active:scale-90 transition"
          >
            {e}
          </button>
        ))}
      </div>

      {/* 떠다니는 반응 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[40vh] max-w-[440px] mx-auto h-0">
        <AnimatePresence>
          {session.reactions.map((r, i) => (
            <span
              key={r.id}
              className="float-heart absolute text-2xl"
              style={{ left: `${15 + ((i * 23) % 70)}%` }}
            >
              {r.emoji}
            </span>
          ))}
        </AnimatePresence>
      </div>

      {/* 큐 / 채팅 패널 */}
      <div className="bg-cream-50 rounded-t-3xl mt-2 flex flex-col flex-1 min-h-[26vh] max-h-[40vh]">
        <div className="flex items-center gap-2 px-4 pt-3">
          {mode === "party" && (
            <button
              onClick={() => setTab("queue")}
              className={`chip py-1.5 px-4 ${
                tab === "queue" ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
              }`}
            >
              🤝 큐 ({session.queue.length})
            </button>
          )}
          <button
            onClick={() => setTab("chat")}
            className={`chip py-1.5 px-4 ${
              tab === "chat" ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            💬 채팅
          </button>
          {mode === "party" && room.queueMode === "collab" && tab === "queue" && (
            <button
              onClick={() => setShowSuggest(true)}
              className="ml-auto chip py-1.5 px-3 bg-brand/10 text-brand-dark font-bold"
            >
              ＋ 곡 제안
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
          {tab === "queue" && mode === "party" ? (
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
                    <span className="text-xs font-bold text-ink-700/40 w-4">{idx + 1}</span>
                    <span
                      className="w-8 h-8 rounded-lg grid place-items-center"
                      style={{ background: ig.color + "22" }}
                    >
                      {ig.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{item.track.title}</p>
                      <p className="text-[11px] text-ink-700/50 truncate">
                        {item.track.artist} · {item.suggestedByHandle} 제안
                      </p>
                    </div>
                    <button
                      onClick={() => session.like(item.id)}
                      className={`flex items-center gap-1 chip py-1 px-2.5 ${
                        item.likedByMe ? "bg-live/15 text-live" : "bg-cream-100 text-ink-700"
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
              {mode === "free" && (
                <p className="text-[11px] text-ink-700/45 text-center pb-1">
                  맵의 🔊 음악 존에 가까이 갈수록 그 음악이 크게 들려요.
                </p>
              )}
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

      {/* 내 음악 틀기 모달 (자유모드) */}
      <AnimatePresence>
        {showMyMusic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={() => setShowMyMusic(false)}
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
              <h3 className="font-bold text-ink-900 mb-1">내 음악 틀기 🎶</h3>
              <p className="text-xs text-ink-700/55 mb-3">
                고른 곡이 내 캐릭터 주변에 흘러나와요. 가까이 온 사람에게 들려요.
              </p>
              <TrackSearch onPick={pickMyMusic} placeholder="내가 틀 곡 검색" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
