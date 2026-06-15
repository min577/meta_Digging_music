"use client";

import { useEffect, useReducer, useRef } from "react";
import Avatar, { type Dir } from "./Avatar";
import type { Appearance } from "@/lib/appearance";
import type { GenreId } from "@/lib/genres";
import { GENRES } from "@/lib/genres";

// 논리 맵 크기 (좌표계). 컨테이너에 비율로 스케일.
const W = 600;
const H = 380;
const PAD = 36;
const SPEED = 165; // units/sec
const RANGE = 165; // 자유모드 스피커 가청 거리

export interface MapAvatar {
  id: string;
  handle: string;
  appearance: Appearance;
  x: number;
  y: number;
  dir?: Dir;
  walking?: boolean;
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
  npcs,
  remote = [],
  speakers = [],
  bg,
  onMove,
  onNearestSource,
}: {
  meAppearance: Appearance;
  meHandle: string;
  npcs: MapAvatar[];
  remote?: MapAvatar[];
  speakers?: Speaker[];
  bg: [string, string];
  onMove?: (x: number, y: number, dir: Dir) => void;
  onNearestSource?: (id: string | null, volume: number) => void;
}) {
  const me = useRef({ x: W / 2, y: H * 0.62, dir: "down" as Dir, walking: false });
  const keys = useRef<Set<string>>(new Set());
  const movers = useRef<Record<string, Mover>>({});
  const lastEmit = useRef(0);
  const lastNearest = useRef<{ id: string | null; vol: number }>({ id: null, vol: 0 });
  const [, force] = useReducer((c) => c + 1, 0);

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

      // 내 이동
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
        m.x = clamp(m.x + (dx / len) * SPEED * dt, PAD, W - PAD);
        m.y = clamp(m.y + (dy / len) * SPEED * dt, PAD, H - PAD);
        if (Math.abs(dx) > Math.abs(dy)) m.dir = dx < 0 ? "left" : "right";
        else m.dir = dy < 0 ? "up" : "down";
      }

      // NPC 배회
      for (const id in movers.current) {
        const v = movers.current[id];
        v.next -= dt;
        if (v.next <= 0 || Math.hypot(v.tx - v.x, v.ty - v.y) < 6) {
          if (v.next <= 0) {
            const seed = hashStr(id) + acc;
            v.tx = PAD + pseudo(seed) * (W - 2 * PAD);
            v.ty = PAD + pseudo(seed + 9.1) * (H - 2 * PAD);
            v.next = 2 + pseudo(seed + 3.3) * 4;
          }
        }
        const ddx = v.tx - v.x,
          ddy = v.ty - v.y;
        const d = Math.hypot(ddx, ddy);
        if (d > 4) {
          v.walking = true;
          v.x += (ddx / d) * SPEED * 0.55 * dt;
          v.y += (ddy / d) * SPEED * 0.55 * dt;
          v.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? "left" : "right") : ddy < 0 ? "up" : "down";
        } else {
          v.walking = false;
        }
      }

      // 근접 오디오 (자유모드)
      if (speakers.length && onNearestSource) {
        let best: { id: string | null; vol: number } = { id: null, vol: 0 };
        for (const s of speakers) {
          const dist = Math.hypot(m.x - s.x, m.y - s.y);
          const vol = Math.max(0, 1 - dist / RANGE);
          if (vol > best.vol) best = { id: s.id, vol };
        }
        if (
          best.id !== lastNearest.current.id ||
          Math.abs(best.vol - lastNearest.current.vol) > 0.04
        ) {
          lastNearest.current = best;
          onNearestSource(best.id, +best.vol.toFixed(2));
        }
      }

      // 위치 broadcast (throttle)
      if (onMove && now - lastEmit.current > 120 && m.walking) {
        lastEmit.current = now;
        onMove(Math.round(m.x), Math.round(m.y), m.dir);
      }

      force();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakers.length]);

  // 렌더용 아바타 목록 (y 정렬 = 깊이감)
  const all: (MapAvatar & { me?: boolean; dir: Dir; walking: boolean })[] = [
    { id: "__me", handle: meHandle, appearance: meAppearance, x: me.current.x, y: me.current.y, dir: me.current.dir, walking: me.current.walking, me: true },
    ...npcs.map((n) => {
      const v = movers.current[n.id];
      return { ...n, x: v?.x ?? n.x, y: v?.y ?? n.y, dir: v?.dir ?? "down", walking: v?.walking ?? false };
    }),
    ...remote.map((r) => ({ ...r, dir: r.dir ?? "down", walking: r.walking ?? false })),
  ];
  all.sort((a, b) => a.y - b.y);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-soft select-none"
      style={{
        aspectRatio: `${W} / ${H}`,
        background: `radial-gradient(120% 90% at 50% 0%, ${bg[1]}, ${bg[0]})`,
      }}
    >
      {/* 바닥 격자 */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
          backgroundSize: `${100 / 8}% ${100 / 6}%`,
        }}
      />

      {/* 스피커(음악 존) */}
      {speakers.map((s) => {
        const g = GENRES[s.genre];
        const dist = Math.hypot(me.current.x - s.x, me.current.y - s.y);
        const near = dist < RANGE;
        return (
          <div
            key={s.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%`, zIndex: Math.floor(s.y) }}
          >
            <div
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none transition-opacity"
              style={{
                width: RANGE * 2,
                height: RANGE * 2,
                background: `radial-gradient(circle, ${g.color}33, transparent 70%)`,
                opacity: near ? 0.9 : 0.4,
              }}
            />
            <div className="relative grid place-items-center w-12 h-12 rounded-2xl bg-black/35 backdrop-blur text-2xl">
              🔊
            </div>
            <span className="relative block text-center text-[10px] font-bold text-white/90 mt-0.5 whitespace-nowrap">
              {g.emoji} {s.label}
            </span>
          </div>
        );
      })}

      {/* 아바타들 */}
      {all.map((p) => (
        <div
          key={p.id}
          className="absolute -translate-x-1/2 -translate-y-full transition-none"
          style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, zIndex: Math.floor(p.y) + 100 }}
        >
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] font-bold mb-0.5 px-1.5 rounded-full whitespace-nowrap ${
                p.me ? "bg-brand text-white" : "bg-black/35 text-white"
              }`}
            >
              {p.handle}
            </span>
            <Avatar appearance={p.appearance} size={52} dir={p.dir} walking={p.walking} bob={!p.walking} />
          </div>
        </div>
      ))}

      {/* 조작 힌트 */}
      <div className="absolute bottom-2 left-2 chip bg-black/35 text-white text-[10px] z-[999]">
        WASD / 화살표로 이동
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
// 결정적 의사난수 (Math.random 회피, id+시간 기반)
function pseudo(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}
