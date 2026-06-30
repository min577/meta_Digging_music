"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "@/components/AudioPlayer";
import Icon from "@/components/Icon";
import dynamic from "next/dynamic";
import type { MapAvatar3D, Speaker3D } from "@/components/three/RoomScene3D";
import DecorSprite, { type DecorKind } from "@/components/DecorSprite";

// 3D 룸은 클라이언트 전용 (three.js)
const RoomScene3D = dynamic(() => import("@/components/three/RoomScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-items-center bg-cream-200 rounded-2xl text-ink-700/60">
      3D 룸 불러오는 중…
    </div>
  ),
});
import TrackSearch from "@/components/TrackSearch";
import Avatar from "@/components/Avatar";
import ProfileSheet from "@/components/ProfileSheet";
import CoachTour, { type TourStep } from "@/components/CoachTour";
import { useRoomSession } from "@/hooks/useRoomSession";
import { useAppStore, useMyTopGenre } from "@/store/useAppStore";
import { GENRES, GENRE_LIST, genre as genreOf, type GenreId } from "@/lib/genres";
import { topGenre, matchPercent } from "@/lib/taste";
import { tracksByTerm } from "@/lib/music";
import { place as getPlace } from "@/lib/places";
import { appearanceFromSeed, defaultAppearance } from "@/lib/appearance";
import type { Track } from "@/lib/types";

const REACTIONS = ["❤️", "🔥", "🎶", "😭", "🕺", "👏"];

const ROOM_TOUR: TourStep[] = [
  { target: "room-scene", title: "룸 둘러보기", desc: "WASD·방향키나 화면 드래그로 움직여요. 음악 존이나 다른 사람 곁으로 가면 소리가 켜지고 ‘같이 듣기’ 버튼이 떠요. 직접 움직여보세요!", advance: "move" },
  { target: "room-nowplaying", title: "지금 나오는 곡", desc: "＋로 디깅함에 저장해요. 자유모드에선 ‘내 음악 틀기’로 내가 DJ가 될 수도 있어요." },
  { target: "room-reactions", title: "반응 보내기", desc: "❤️🔥 같은 반응으로 같은 공간의 사람들과 분위기를 함께 즐겨요." },
  { target: "room-panel", title: "채팅 & 협업 큐", desc: "채팅하고, 큐에 곡을 제안해 다음에 같이 들을 곡을 함께 정해요." },
];
const QUEUE_LABEL: Record<string, string> = { dj: "DJ", collab: "협업 큐", radio: "라디오" };
// 음악 존 배치 (월드 1400x1000 기준)
const SPOTS = [
  { x: 380, y: 350 },
  { x: 1020, y: 350 },
  { x: 380, y: 740 },
  { x: 1020, y: 740 },
];
type SpeakerT = Speaker3D & { track?: Track };

// 꾸미기 가구 팔레트 (SVG 소품)
const FURNITURE: DecorKind[] = [
  "plant", "tree", "palm", "sofa", "chair", "bed", "table", "lamp", "floorlamp",
  "tv", "painting", "bookshelf", "window", "cushion", "candle", "lantern",
  "fountain", "speaker", "piano", "guitar", "drum", "disco", "arcade", "vinyl",
  "cocktail", "balloon", "crystal", "star",
];

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const myGenre = useMyTopGenre();
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);
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
  const [npcTracks, setNpcTracks] = useState<Record<string, Track>>({});
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(FURNITURE[0]);
  const [lockedId, setLockedId] = useState<string | null>(null); // 같이 듣기 연결 대상
  const [myBubble, setMyBubble] = useState<{ text: string; at: number } | null>(null); // 머리 위 말풍선
  const [inviteCopied, setInviteCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selPerson, setSelPerson] = useState<{ handle: string; topGenre: GenreId } | null>(null);
  const listenAccum = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);

  const captureRoom = () => {
    const c = mapWrapRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `digtown_room_${Date.now()}.png`;
    a.click();
  };

  const room = session.room;
  const mode = room?.roomMode ?? "party";

  useEffect(() => {
    enterRoom(id);
  }, [id, enterRoom]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "nearest" }); // 페이지 전체 스크롤(흔들림) 방지
  }, [session.chat.length]);
  useEffect(() => {
    listenAccum.current = 0;
  }, [session.play?.track.id]);
  useEffect(() => {
    setTab(mode === "party" && room?.queueMode === "collab" ? "queue" : "chat");
  }, [mode, room?.queueMode]);
  useEffect(() => {
    if (mode !== "free") setLockedId(null); // 파티모드 전환 시 동행 해제
  }, [mode]);
  // 같이 듣기 대상 변경을 브로드캐스트(그룹 손잡기 사슬 동기화)
  useEffect(() => {
    session.broadcastListen(mode === "free" ? lockedId : null);
  }, [lockedId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const roomGenre = room ? topGenre(room.tasteVector) : "pop";

  // 음악 소스 구성
  // - 파티모드: 중앙 무대 1개(글로벌 동기화)
  // - 자유모드: 고정 존 없음 → 룸 테마에 맞는 곡을 사람마다 송출, 가까이 가면 그 사람 음악이 들림
  useEffect(() => {
    if (!room) return;
    let active = true;
    const p = getPlace(room.place);
    (async () => {
      if (mode === "party") {
        setSpeakers([{ id: "stage", x: 500, y: 220, genre: roomGenre, label: "메인 무대" }]);
        setNpcTracks({});
        return;
      }
      // 자유모드: 사람-대-사람
      setSpeakers([]);
      const songs = await tracksByTerm(p.zones[0].term, 9);
      if (active && songs.length) {
        const map: Record<string, Track> = {};
        // 멤버 절반쯤이 룸 테마 곡을 각자 송출
        room.members.forEach((m, i) => {
          if (i % 2 === 0) map[m.userId] = songs[i % songs.length];
        });
        setNpcTracks(map);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, mode]);

  // 맵 NPC (룸 멤버)
  const npcs = useMemo<MapAvatar3D[]>(() => {
    if (!room) return [];
    return room.members.slice(0, 8).map((m, i) => ({ // 성능: 표시 NPC 수 제한
      id: m.userId,
      handle: m.handle,
      appearance: appearanceFromSeed(m.handle),
      x: 100 + ((i * 191 + 70) % 800),
      y: 130 + ((i * 157 + 50) % 460),
      track: npcTracks[m.userId],
    }));
  }, [room, npcTracks]);

  if (!room) {
    return (
      <div className="phone-shell min-h-[100dvh] grid place-items-center">
        <div className="text-center">
          <p className="text-ink-700">룸을 찾을 수 없어요</p>
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
  for (const s of speakers) if (s.track) sourceTrack[s.id] = s.track;
  for (const p of remoteWithTrack) sourceTrack[`player_${p.id}`] = p.track!;
  for (const [uid, tr] of Object.entries(npcTracks)) sourceTrack[`npc_${uid}`] = tr;
  const sortedVols = [...vols].sort((a, b) => b.volume - a.volume);
  const loudest = sortedVols[0];
  const loudestTrack = loudest ? sourceTrack[loudest.id] : undefined;

  // 같이 듣기: 소스 id → 핸들, 가까이서 음악을 틀고 있는 사람
  const handleForSource = (sid: string | null): string => {
    if (!sid) return "";
    if (sid.startsWith("npc_")) return npcs.find((n) => n.id === sid.slice(4))?.handle ?? "디깅러";
    if (sid.startsWith("player_")) return session.remotePlayers.find((p) => p.id === sid.slice(7))?.handle ?? "디깅러";
    return "";
  };
  const nearbyPerson = sortedVols.find(
    (v) => (v.id.startsWith("npc_") || v.id.startsWith("player_")) && sourceTrack[v.id]
  );

  // 현재 들리는 곡: party=동기화 곡 / free=내 송출곡 우선, 없으면 가장 큰 주변 음악
  const track =
    mode === "free" ? myTrack ?? loudestTrack : session.play?.track;
  const headerVol = myTrack ? 1 : loudest?.volume ?? 0;
  const g = genreOf(track ? track.genre : roomGenre);
  const pct = progress.dur > 0 ? (progress.cur / progress.dur) * 100 : 0;
  const isDJ = room.queueMode === "dj";
  // 실제 호스트만 DJ 스킵 가능 (핸들 일치 기준)
  const amHost = !!user && room.hostHandle === user.handle;

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
      kind: selectedItem,
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

  const invite = async () => {
    const url = `${window.location.origin}/room/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 1800);
    } catch {
      window.prompt("이 링크를 친구에게 공유하세요", url);
    }
  };

  const sendChat = () => {
    const v = chatInput.trim();
    if (!v) return;
    session.sendChat(v);
    const at = Date.now();
    setMyBubble({ text: v, at }); // 내 머리 위 말풍선
    setTimeout(() => setMyBubble((b) => (b && b.at === at ? null : b)), 4800);
    setChatInput("");
  };

  return (
    <div
      className="phone-shell min-h-[100dvh] flex flex-col"
      style={{ background: `linear-gradient(180deg, ${g.bg[0]}, ${g.bg[1]})` }}
    >
      <CoachTour tourKey="room" steps={ROOM_TOUR} />
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2 text-white">
        <button
          onClick={() => router.push("/home")}
          className="w-9 h-9 rounded-full bg-black/25 grid place-items-center shrink-0"
        >
          ←
        </button>
        <div className="text-center min-w-0">
          <div className="flex items-center justify-center gap-1.5">
            {mode === "party" && (
              <span className="chip bg-live text-white text-[10px] font-bold flex items-center gap-1 px-2 py-0.5">
                <span className="live-dot bg-white" /> LIVE
              </span>
            )}
            <p className="font-bold text-sm truncate max-w-[170px]">{room.title}</p>
          </div>
          <p className="text-[11px] text-white/75 flex items-center gap-1">
            <span>{mode === "free" ? "자유모드" : QUEUE_LABEL[room.queueMode]}</span> ·
            <Icon name="friends" size={11} /> {session.online} ·
            <span className={`w-1.5 h-1.5 rounded-full ${session.connected === "realtime" ? "bg-emerald-400" : "bg-amber-400"}`} />
            {session.connected === "realtime" ? "동기화" : "데모"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setShowMembers(true)} className="w-9 h-9 rounded-full bg-black/25 text-white grid place-items-center" title="이 룸의 사람들">
            <Icon name="friends" size={16} />
          </button>
          <button onClick={invite} className="w-9 h-9 rounded-full bg-black/25 text-white grid place-items-center" title="친구 초대">
            <Icon name="plus" size={18} />
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="w-9 h-9 rounded-full bg-black/25 text-white grid place-items-center"
          >
            <Icon name={muted ? "mute" : "volume"} size={16} />
          </button>
        </div>
      </header>

      {/* Now Playing 바 */}
      <div className="px-4">
        <div data-tour="room-nowplaying" className="card p-2.5 flex items-center gap-3">
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
                  {track.artist} · {g.label}
                  {mode === "free" && (
                    <span className="ml-1 text-brand-dark font-bold">
                      {myTrack ? "내 음악 송출 중" : `${Math.round(headerVol * 100)}%`}
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-700/50">
                {mode === "free" ? "음악 존으로 다가가 보세요" : "곡 불러오는 중…"}
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
              <Icon name={hasDigg(track.id) ? "music" : "plus"} size={hasDigg(track.id) ? 15 : 18} />
            </button>
          )}
          {mode === "party" && (!isDJ || amHost) && (
            <button
              onClick={session.skip}
              className="w-9 h-9 rounded-full bg-cream-100 text-ink-800 grid place-items-center"
              title={isDJ ? "다음 곡 (호스트)" : "다음 곡"}
            >
              <Icon name="skip" size={16} />
            </button>
          )}
          {mode === "party" && isDJ && !amHost && (
            <span className="chip bg-black/25 text-white text-[10px] inline-flex items-center gap-1">
              <Icon name="headphones" size={12} /> 호스트가 선곡 중
            </span>
          )}
          {mode === "free" && (
            <button
              onClick={() => (myTrack ? stopMyMusic() : setShowMyMusic(true))}
              className={`shrink-0 chip py-2 px-3 font-bold ${
                myTrack ? "bg-live/15 text-live" : "bg-brand text-white"
              }`}
            >
              {myTrack ? "내 음악 끄기" : "내 음악 틀기"}
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
          onEnded={!isDJ || amHost ? session.skip : undefined}
        />
      )}
      {/* 자유모드: 내 송출곡 — 단, 같이 듣기 중엔 끔(겹침 방지) */}
      {mode === "free" && !lockedId && myTrack?.previewUrl && (
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

      {/* 본문: 웹(md+)에서 맵 꽉 채우고 채팅은 우측 오버레이, 모바일은 세로 스택 */}
      <div className="flex flex-col">
      <div className="flex flex-col">

      {/* 맵 툴바 */}
      <div className="px-4 mt-2 flex items-center justify-between">
        <span className="text-[11px] text-white/70">
          {editMode ? "꾸미기 중 — 맵을 탭해 배치, 소품을 탭해 삭제" : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={captureRoom} className="w-8 h-8 rounded-full grid place-items-center bg-black/30 text-white" title="사진 촬영">
            <Icon name="camera" size={15} />
          </button>
          <button
            onClick={() => setEditMode((e) => !e)}
            className={`chip py-1.5 px-3 font-bold inline-flex items-center gap-1 ${
              editMode ? "bg-live text-white" : "bg-black/30 text-white"
            }`}
          >
            {editMode ? "완료" : (<><Icon name="build" size={13} /> 꾸미기</>)}
          </button>
        </div>
      </div>

      {/* 가구 팔레트 (꾸미기 모드) */}
      {editMode && (
        <div className="px-4 mt-1 flex gap-1.5 overflow-x-auto no-scrollbar">
          {FURNITURE.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedItem(f)}
              className={`shrink-0 w-11 h-11 rounded-xl grid place-items-center ${
                selectedItem === f ? "bg-brand/30 ring-2 ring-brand" : "bg-black/25"
              }`}
            >
              <DecorSprite kind={f} size={34} />
            </button>
          ))}
        </div>
      )}

      {/* 맵 */}
      <div ref={mapWrapRef} data-tour="room-scene" className="relative px-4 mt-2 h-[52vh]">
        {/* 같이 듣기 — 맵 위 오버레이(레이아웃 안 밀림) */}
        {mode === "free" && (lockedId || nearbyPerson) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            {lockedId ? (
              <button
                onClick={() => setLockedId(null)}
                className="chip bg-live text-white font-bold py-2 px-4 flex items-center gap-1.5 shadow-soft whitespace-nowrap"
              >
                <Icon name="headphones" size={14} /> {handleForSource(lockedId)}님과 함께 듣는 중 · 연결 끊기
              </button>
            ) : (
              <button
                onClick={() => setLockedId(nearbyPerson!.id)}
                className="chip bg-brand text-white font-bold py-2 px-4 flex items-center gap-1.5 shadow-soft animate-bob whitespace-nowrap"
              >
                <Icon name="headphones" size={14} /> {handleForSource(nearbyPerson!.id)}님과 같이 듣기
              </button>
            )}
          </div>
        )}
        <RoomScene3D
          meAppearance={user?.character.appearance ?? defaultAppearance()}
          meHandle={user?.handle ?? "나"}
          meTrack={myTrack}
          meGenre={myGenre}
          place={room.place}
          npcs={npcs}
          remote={session.remotePlayers as MapAvatar3D[]}
          speakers={mode === "free" ? speakers : []}
          placed={[...myDecor, ...session.othersDecor]}
          editMode={editMode}
          lockedId={mode === "free" ? lockedId : null}
          myId={session.myId}
          chat={session.chat}
          myBubble={myBubble}
          onMove={session.broadcastMove}
          onJump={session.broadcastJump}
          onAudio={(v) => setVols(v)}
          onPlaceAt={placeAt}
          onRemovePlaced={removePlaced}
        />
      </div>

      {/* 반응 버튼 */}
      <div data-tour="room-reactions" className="px-4 mt-2 flex gap-2 justify-center">
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

      </div>{/* /좌측 컬럼 */}

      {/* 채팅/큐 — 웹(md+)에서 우측 오버레이(맵 위에 겹침) */}
      <div className="flex flex-col">
      {/* 큐 / 채팅 패널 */}
      <div data-tour="room-panel" className="bg-cream-50 rounded-t-3xl mt-2 flex flex-col flex-1 min-h-[16vh] max-h-[34vh]">
        <div className="flex items-center gap-2 px-4 pt-3">
          <button
            onClick={() => setTab("queue")}
            className={`chip py-1.5 px-4 inline-flex items-center gap-1.5 ${
              tab === "queue" ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            <Icon name="music" size={13} /> 큐 ({session.queue.length})
          </button>
          <button
            onClick={() => setTab("chat")}
            className={`chip py-1.5 px-4 inline-flex items-center gap-1.5 ${
              tab === "chat" ? "bg-brand text-white" : "bg-cream-100 text-ink-700"
            }`}
          >
            <Icon name="chat" size={13} /> 채팅
          </button>
          {tab === "queue" && (
            <button
              onClick={() => setShowSuggest(true)}
              className="ml-auto chip py-1.5 px-3 bg-brand/10 text-brand-dark font-bold"
            >
              ＋ 곡 제안
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
          {tab === "queue" ? (
            <div className="space-y-2">
              {session.queue.length === 0 && (
                <p className="text-center text-ink-700/40 text-sm py-6">
                  큐가 비었어요. 좋은 곡을 제안해보세요!
                </p>
              )}
              {session.queue.map((item, idx) => {
                const ig = genreOf(item.track.genre);
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
                      <Icon name="heart" size={12} fill={item.likedByMe ? "currentColor" : "none"} /> {item.likes}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {mode === "free" && (
                <p className="text-[11px] text-ink-700/45 text-center pb-1">
                  맵의 음악 존에 가까이 갈수록 그 음악이 크게 들려요.
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
            <button onClick={sendChat} className="btn-primary btn-sm">
              전송
            </button>
          </div>
        )}
      </div>
      </div>{/* /우측 컬럼 */}
      </div>{/* /본문 2단 */}

      {/* 디깅 저장 토스트 */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink-900 text-cream-50 px-5 py-3 rounded-2xl shadow-soft text-sm font-bold inline-flex items-center gap-1.5"
          >
            <Icon name="music" size={15} /> 디깅함에 저장했어요! (+10 <Icon name="gem" size={13} />)
          </motion.div>
        )}
      </AnimatePresence>

      {/* 친구 초대 링크 복사 토스트 — 화면 중앙 */}
      <AnimatePresence>
        {inviteCopied && (
          <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-brand text-white px-5 py-3 rounded-2xl shadow-soft text-sm font-bold"
            >
              초대 링크 복사됨 · 친구에게 공유하세요!
            </motion.div>
          </div>
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

      {/* 이 룸의 사람들 — 탭하면 프로필 → 친구 추가 */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={() => setShowMembers(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] bg-cream-50 rounded-t-3xl p-5 max-h-[72vh] flex flex-col"
            >
              <div className="w-10 h-1 bg-cream-300 rounded-full mx-auto mb-3" />
              <h3 className="font-extrabold text-ink-900 mb-1 flex items-center gap-1.5">
                <Icon name="friends" size={18} className="text-brand-dark" /> 이 룸의 사람들 ({room.members.length})
              </h3>
              <p className="text-xs text-ink-700/55 mb-3">탭하면 취향을 보고 친구를 추가할 수 있어요.</p>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {room.members.map((m) => {
                  const isFriend = friends.some((f) => f.userId === m.userId && f.status === "accepted");
                  const isMe = !!user && m.handle === user.handle;
                  const pct = matchPercent(user?.tasteVector ?? {}, { [m.topGenre]: 1 });
                  return (
                    <button
                      key={m.userId}
                      onClick={() => !isMe && setSelPerson({ handle: m.handle, topGenre: m.topGenre })}
                      className="w-full card px-3 py-2.5 flex items-center gap-3 text-left active:scale-[0.99] transition"
                    >
                      <Avatar appearance={appearanceFromSeed(m.handle)} size={42} bob={false} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {m.handle} {isMe && <span className="text-ink-700/40 text-xs">(나)</span>}
                          {m.handle === room.hostHandle && (
                            <span className="ml-1 chip bg-brand/10 text-brand-dark text-[10px] font-bold py-0 px-1.5">호스트</span>
                          )}
                        </p>
                        <p className="text-[11px] text-ink-700/50">
                          {genreOf(m.topGenre).emoji} {genreOf(m.topGenre).label} · 취향 {pct}%
                        </p>
                      </div>
                      {!isMe && (
                        <span className={`chip font-bold py-1 px-2.5 ${isFriend ? "bg-cream-200 text-ink-700/50" : "bg-brand/10 text-brand-dark"}`}>
                          {isFriend ? "친구" : "+ 친구"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selPerson && (
        <ProfileSheet
          handle={selPerson.handle}
          topGenre={selPerson.topGenre}
          myTaste={user?.tasteVector ?? {}}
          isFriend={friends.some((f) => f.handle === selPerson.handle && f.status === "accepted")}
          onAddFriend={() =>
            addFriend({
              userId: `u_${selPerson.handle}`,
              handle: selPerson.handle,
              topGenre: selPerson.topGenre,
              status: "pending",
              matchPct: matchPercent(user?.tasteVector ?? {}, { [selPerson.topGenre]: 1 }),
            })
          }
          onClose={() => setSelPerson(null)}
        />
      )}

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
              <h3 className="font-bold text-ink-900 mb-1">내 음악 틀기</h3>
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
