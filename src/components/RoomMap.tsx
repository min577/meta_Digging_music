"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Avatar, { type Dir } from "./Avatar";
import type { Appearance } from "@/lib/appearance";
import type { GenreId } from "@/lib/genres";
import { GENRES } from "@/lib/genres";
import type { Track, PlacedItem } from "@/lib/types";
import DecorSprite from "./DecorSprite";
import { sceneFor, floorPattern, WORLD_W, WORLD_H } from "@/lib/scenes";
import { useTimePhase } from "@/hooks/useTimePhase";

const PAD = 54;
const SPEED = 235; // units/sec
const RANGE = 240; // 가청 거리

export interface AudioVol {
  id: string;
  volume: number;
}

export interface MapAvatar {
  id: string;
  handle: string;
  appearance: Appearance;
  x: number;
  y: number;
  dir?: Dir;
  walking?: boolean;
  track?: Track;
}

export interface Speaker {
  id: string;
  x: number;
  y: number;
  genre: GenreId;
  label: string;
}

interface Mover {
  x: number;
  y: number;
  tx: number;
  ty: number;
  dir: Dir;
  walking: boolean;
  next: number;
}

export default function RoomMap({
  meAppearance,
  meHandle,
  meTrack,
  genre,
  npcs,
  remote = [],
  speakers = [],
  placed = [],
  editMode = false,
  onMove,
  onAudio,
  onPlaceAt,
  onRemovePlaced,
}: {
  meAppearance: Appearance;
  meHandle: string;
  meTrack?: Track | null;
  genre: GenreId;
  npcs: MapAvatar[];
  remote?: MapAvatar[];
  speakers?: Speaker[];
  placed?: PlacedItem[];
  editMode?: boolean;
  onMove?: (x: number, y: number, dir: Dir) => void;
  onAudio?: (vols: AudioVol[]) => void;
  onPlaceAt?: (x: number, y: number) => void;
  onRemovePlaced?: (id: string) => void;
}) {
  const me = useRef({ x: WORLD_W / 2, y: WORLD_H * 0.6, dir: "down" as Dir, walking: false });
  const keys = useRef<Set<string>>(new Set());
  const movers = useRef<Record<string, Mover>>({});
  const lastEmit = useRef(0);
  const lastAudio = useRef("");
  const lastAudioAt = useRef(0);
  const [, force] = useReducer((c) => c + 1, 0);

  const viewRef = useRef<HTMLDivElement>(null);
  const camRef = useRef({ x: 0, y: 0 });
  const [view, setView] = useState({ w: 360, h: 360 });

  const remoteRef = useRef(remote);
  remoteRef.current = remote;
  const speakersRef = useRef(speakers);
  speakersRef.current = speakers;
  const onAudioRef = useRef(onAudio);
  onAudioRef.current = onAudio;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const scene = sceneFor(genre);
  const time = useTimePhase();

  // 뷰포트 크기 측정 (카메라용)
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const update = () => setView({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // NPC 무버 초기화
  useEffect(() => {
    const next: Record<string, Mover> = {};
    for (const n of npcs) {
      next[n.id] = movers.current[n.id] ?? {
        x: n.x,
        y: n.y,
        tx: n.x,
        ty: n.y,
        dir: "down",
        walking: false,
        next: 0,
      };
    }
    movers.current = next;
  }, [npcs]);

  // 키 입력
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        keys.current.add(k);
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // 게임 루프
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      acc += dt;

      const k = keys.current;
      let dx = 0,
        dy = 0;
      if (k.has("w") || k.has("arrowup")) dy -= 1;
      if (k.has("s") || k.has("arrowdown")) dy += 1;
      if (k.has("a") || k.has("arrowleft")) dx -= 1;
      if (k.has("d") || k.has("arrowright")) dx += 1;
      const m = me.current;
      m.walking = dx !== 0 || dy !== 0;
      if (m.walking) {
        const len = Math.hypot(dx, dy) || 1;
        m.x = clamp(m.x + (dx / len) * SPEED * dt, PAD, WORLD_W - PAD);
        m.y = clamp(m.y + (dy / len) * SPEED * dt, PAD, WORLD_H - PAD);
        if (Math.abs(dx) > Math.abs(dy)) m.dir = dx < 0 ? "left" : "right";
        else m.dir = dy < 0 ? "up" : "down";
      }

      // NPC 배회
      for (const id in movers.current) {
        const v = movers.current[id];
        v.next -= dt;
        if (v.next <= 0 || Math.hypot(v.tx - v.x, v.ty - v.y) < 8) {
          if (v.next <= 0) {
            const seed = hashStr(id) + acc;
            v.tx = PAD + pseudo(seed) * (WORLD_W - 2 * PAD);
            v.ty = PAD + pseudo(seed + 9.1) * (WORLD_H - 2 * PAD);
            v.next = 2 + pseudo(seed + 3.3) * 4;
          }
        }
        const ddx = v.tx - v.x,
          ddy = v.ty - v.y;
        const d = Math.hypot(ddx, ddy);
        if (d > 5) {
          v.walking = true;
          v.x += (ddx / d) * SPEED * 0.5 * dt;
          v.y += (ddy / d) * SPEED * 0.5 * dt;
          v.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? "left" : "right") : ddy < 0 ? "up" : "down";
        } else {
          v.walking = false;
        }
      }

      // 다중소스 공간 오디오
      if (onAudioRef.current && now - lastAudioAt.current > 160) {
        const out: AudioVol[] = [];
        for (const s of speakersRef.current) {
          const v = 1 - Math.hypot(m.x - s.x, m.y - s.y) / RANGE;
          if (v > 0.03) out.push({ id: s.id, volume: +v.toFixed(2) });
        }
        for (const r of remoteRef.current) {
          if (!r.track) continue;
          const v = 1 - Math.hypot(m.x - r.x, m.y - r.y) / RANGE;
          if (v > 0.03) out.push({ id: `player_${r.id}`, volume: +v.toFixed(2) });
        }
        const sig = out.map((o) => `${o.id}:${o.volume}`).join("|");
        if (sig !== lastAudio.current) {
          lastAudio.current = sig;
          lastAudioAt.current = now;
          onAudioRef.current(out);
        }
      }

      if (onMoveRef.current && now - lastEmit.current > 120 && m.walking) {
        lastEmit.current = now;
        onMoveRef.current(Math.round(m.x), Math.round(m.y), m.dir);
      }

      force();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 카메라 (플레이어 중심, 월드 경계 clamp)
  const camX = clamp(me.current.x - view.w / 2, 0, Math.max(0, WORLD_W - view.w));
  const camY = clamp(me.current.y - view.h / 2, 0, Math.max(0, WORLD_H - view.h));
  camRef.current = { x: camX, y: camY };

  // 꾸미기 모드: 맵 클릭 → 월드 좌표로 변환해 배치
  const handlePlaceClick = (e: React.MouseEvent) => {
    if (!editMode || !onPlaceAt) return;
    const rect = viewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const wx = e.clientX - rect.left + camRef.current.x;
    const wy = e.clientY - rect.top + camRef.current.y;
    onPlaceAt(
      clamp(Math.round(wx), PAD, WORLD_W - PAD),
      clamp(Math.round(wy), PAD, WORLD_H - PAD)
    );
  };

  // 깊이 정렬 대상 (소품 + 아바타)
  const avatars: (MapAvatar & { me?: boolean; dir: Dir; walking: boolean })[] = [
    { id: "__me", handle: meHandle, appearance: meAppearance, x: me.current.x, y: me.current.y, dir: me.current.dir, walking: me.current.walking, track: meTrack ?? undefined, me: true },
    ...npcs.map((n) => {
      const v = movers.current[n.id];
      return { ...n, x: v?.x ?? n.x, y: v?.y ?? n.y, dir: v?.dir ?? "down", walking: v?.walking ?? false };
    }),
    ...remote.map((r) => ({ ...r, dir: r.dir ?? "down", walking: r.walking ?? false })),
  ];

  return (
    <div
      ref={viewRef}
      onClick={handlePlaceClick}
      className={`relative w-full h-full overflow-hidden rounded-2xl shadow-soft select-none ${
        editMode ? "cursor-crosshair ring-2 ring-brand" : ""
      }`}
      style={{ background: `linear-gradient(180deg, ${scene.wall}, ${scene.floor[0]})` }}
    >
      {/* 월드 (카메라 이동) */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: WORLD_W,
          height: WORLD_H,
          transform: `translate(${-camX}px, ${-camY}px)`,
          background: `radial-gradient(120% 80% at 50% 18%, ${scene.floor[1]}, ${scene.floor[0]})`,
        }}
      >
        {/* 상단 벽 띠 */}
        <div
          className="absolute top-0 left-0 w-full"
          style={{ height: 150, background: scene.wall, opacity: 0.88 }}
        />
        {/* 무대 러그 */}
        <div
          className="absolute rounded-[50%] -translate-x-1/2"
          style={{
            left: WORLD_W / 2,
            top: 170,
            width: 720,
            height: 300,
            background: scene.stage,
            opacity: 0.32,
          }}
        />
        {/* 바닥 패턴 (잔디/마루/타일/네온) */}
        <div className="absolute inset-0" style={floorPattern(scene.floorType)} />

        {/* 소품 (SVG, 깊이 정렬) */}
        {scene.decor.map((d, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{
              left: d.x,
              top: d.y,
              zIndex: Math.floor(d.y),
              filter: "drop-shadow(0 5px 4px rgba(0,0,0,0.35))",
            }}
          >
            <DecorSprite kind={d.kind} size={d.size} />
          </div>
        ))}

        {/* 배치한 가구/소품 (꾸미기) */}
        {placed.map((p) => (
          <div
            key={p.id}
            onClick={(e) => {
              if (!editMode) return;
              e.stopPropagation();
              onRemovePlaced?.(p.id);
            }}
            className={`absolute -translate-x-1/2 -translate-y-full ${
              editMode ? "cursor-pointer" : ""
            }`}
            style={{
              left: p.x,
              top: p.y,
              zIndex: Math.floor(p.y),
              filter: "drop-shadow(0 5px 4px rgba(0,0,0,0.35))",
            }}
            title={editMode ? "클릭해서 삭제" : undefined}
          >
            <DecorSprite kind={p.kind} size={52} />
            {editMode && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-live text-white rounded-full w-4 h-4 grid place-items-center">
                ×
              </span>
            )}
          </div>
        ))}

        {/* 스피커(음악 존) */}
        {speakers.map((s) => {
          const g = GENRES[s.genre];
          return (
            <div
              key={s.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: s.x, top: s.y, zIndex: Math.floor(s.y) }}
            >
              <div
                className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none"
                style={{
                  width: RANGE * 2,
                  height: RANGE * 2,
                  background: `radial-gradient(circle, ${g.color}30, transparent 68%)`,
                }}
              />
              <div className="relative grid place-items-center w-14 h-14 rounded-2xl bg-black/40 backdrop-blur text-2xl border border-white/15">
                🔊
              </div>
              <span className="relative block text-center text-[11px] font-bold text-white/90 mt-1 whitespace-nowrap drop-shadow">
                {g.emoji} {s.label}
              </span>
            </div>
          );
        })}

        {/* 아바타들 */}
        {avatars.map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: p.x, top: p.y, zIndex: Math.floor(p.y) + 1 }}
          >
            <div className="flex flex-col items-center">
              {p.track && (
                <span className="text-base animate-bob mb-0.5" title={`${p.track.title} 송출 중`}>
                  🎵
                </span>
              )}
              <span
                className={`text-[10px] font-bold mb-0.5 px-1.5 rounded-full whitespace-nowrap ${
                  p.me ? "bg-brand text-white" : "bg-black/40 text-white"
                }`}
              >
                {p.handle}
              </span>
              <Avatar appearance={p.appearance} size={58} dir={p.dir} walking={p.walking} bob={!p.walking} />
            </div>
          </div>
        ))}
      </div>

      {/* 실시간 낮/밤 조명 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none z-[1500] transition-colors duration-1000"
        style={{ background: time.overlay }}
      >
        {time.isNight &&
          NIGHT_STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.r,
                height: s.r,
                opacity: 0.8,
                animation: `twinkle ${1.5 + (i % 4) * 0.6}s ease-in-out infinite`,
              }}
            />
          ))}
      </div>

      {/* 시계 + 해/달 (뷰포트 고정) */}
      <div className="absolute top-2 left-2 chip bg-black/40 text-white text-[11px] z-[2000] flex items-center gap-1">
        <span className="text-sm">{time.icon}</span> {time.clock} · {time.label}
      </div>
      <div className="absolute bottom-2 left-2 chip bg-black/40 text-white text-[10px] z-[2000]">
        WASD / 화살표로 이동
      </div>
      <div className="absolute top-2 right-2 chip bg-black/40 text-white text-[10px] z-[2000]">
        🗺️ {Math.round((me.current.x / WORLD_W) * 100)},{Math.round((me.current.y / WORLD_H) * 100)}
      </div>
    </div>
  );
}

const NIGHT_STARS = [
  { x: 12, y: 14, r: 2 }, { x: 28, y: 8, r: 1.5 }, { x: 44, y: 16, r: 2.5 },
  { x: 62, y: 10, r: 1.5 }, { x: 78, y: 18, r: 2 }, { x: 90, y: 9, r: 1.5 },
  { x: 20, y: 26, r: 1.5 }, { x: 70, y: 28, r: 2 }, { x: 52, y: 6, r: 1.5 },
];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function pseudo(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}
