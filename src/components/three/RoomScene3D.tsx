"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import Avatar3D from "./Avatar3D";
import Decor3D from "./Decor3D";
import MusicZone3D from "./MusicZone3D";
import type { Appearance } from "@/lib/appearance";
import { appearanceFromSeed } from "@/lib/appearance";
import type { GenreId } from "@/lib/genres";
import type { Track, PlacedItem } from "@/lib/types";
import type { DecorKind } from "@/components/DecorSprite";
import { sceneFor } from "@/lib/scenes";
import { useTimePhase, type TimePhase } from "@/hooks/useTimePhase";

const WORLD_W = 1400;
const WORLD_H = 1000;
const PAD = 60;
const SPEED = 240;
const RANGE = 260;

export interface MapAvatar3D {
  id: string;
  handle: string;
  appearance: Appearance;
  x: number;
  y: number;
  dir?: "down" | "up" | "left" | "right";
  track?: Track;
}
export interface Speaker3D {
  id: string;
  x: number;
  y: number;
  genre: GenreId;
  label: string;
}
export interface AudioVol {
  id: string;
  volume: number;
}

interface Props {
  meAppearance: Appearance;
  meHandle: string;
  meTrack?: Track | null;
  genre: GenreId;
  npcs: MapAvatar3D[];
  remote?: MapAvatar3D[];
  speakers?: Speaker3D[];
  placed?: PlacedItem[];
  editMode?: boolean;
  onMove?: (x: number, y: number, dir: "down" | "up" | "left" | "right") => void;
  onAudio?: (vols: AudioVol[]) => void;
  onPlaceAt?: (x: number, y: number) => void;
  onRemovePlaced?: (id: string) => void;
}

const SKY: Record<string, string> = {
  day: "#aedcf0", dawn: "#f6cdb0", dusk: "#e89a78", night: "#141a33",
};

export default function RoomScene3D(props: Props) {
  const time = useTimePhase();
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-soft">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ fov: 46, near: 1, far: 4000, position: [700, 320, 920] }}
      >
        <color attach="background" args={[SKY[time.phase]]} />
        <fog attach="fog" args={[SKY[time.phase], 1100, 2600]} />
        <Scene {...props} time={time} />
      </Canvas>

      {/* DOM 오버레이 */}
      <div className="absolute top-2 left-2 chip bg-black/40 text-white text-[11px] z-20 flex items-center gap-1">
        <span className="text-sm">{time.icon}</span> {time.clock} · {time.label}
      </div>
      <div className="absolute bottom-2 left-2 chip bg-black/40 text-white text-[10px] z-20">
        WASD / 화살표로 이동
      </div>
      {props.editMode && (
        <div className="absolute top-2 right-2 chip bg-live text-white text-[10px] z-20">
          🔨 바닥을 탭해 배치
        </div>
      )}
    </div>
  );
}

function Scene({
  meAppearance, meHandle, meTrack, genre, npcs, remote = [], speakers = [],
  placed = [], editMode, onMove, onAudio, onPlaceAt, onRemovePlaced, time,
}: Props & { time: TimePhase }) {
  const { camera } = useThree();
  const scene = sceneFor(genre);

  const me = useRef({ x: 700, z: 560, heading: Math.PI, walking: false });
  const keys = useRef<Set<string>>(new Set());
  const playerRef = useRef<THREE.Group>(null);
  const npcRefs = useRef<Record<string, THREE.Group>>({});
  const npcState = useRef<Record<string, { x: number; z: number; tx: number; tz: number; next: number; heading: number; walking: boolean }>>({});
  const remoteRefs = useRef<Record<string, THREE.Group>>({});
  const lastEmit = useRef(0);
  const lastAudio = useRef("");
  const lastAudioAt = useRef(0);

  // 최신 props ref
  const remoteR = useRef(remote); remoteR.current = remote;
  const speakersR = useRef(speakers); speakersR.current = speakers;
  const cbR = useRef({ onMove, onAudio }); cbR.current = { onMove, onAudio };

  // NPC 상태 초기화
  useMemo(() => {
    for (const n of npcs) {
      if (!npcState.current[n.id])
        npcState.current[n.id] = { x: n.x, z: n.y, tx: n.x, tz: n.y, next: 0, heading: 0, walking: false };
    }
  }, [npcs]);

  // 키 입력
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        keys.current.add(k); e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw);
    const now = performance.now();
    const k = keys.current;
    let dx = 0, dz = 0;
    if (k.has("w") || k.has("arrowup")) dz -= 1;
    if (k.has("s") || k.has("arrowdown")) dz += 1;
    if (k.has("a") || k.has("arrowleft")) dx -= 1;
    if (k.has("d") || k.has("arrowright")) dx += 1;
    const m = me.current;
    m.walking = dx !== 0 || dz !== 0;
    if (m.walking) {
      const len = Math.hypot(dx, dz) || 1;
      m.x = clamp(m.x + (dx / len) * SPEED * dt, PAD, WORLD_W - PAD);
      m.z = clamp(m.z + (dz / len) * SPEED * dt, PAD, WORLD_H - PAD);
      m.heading = Math.atan2(dx, dz);
    }
    if (playerRef.current) {
      playerRef.current.position.set(m.x, bob(now, m.walking), m.z);
      playerRef.current.rotation.y = lerpAngle(playerRef.current.rotation.y, m.heading, 0.2);
    }

    // NPC
    for (const id in npcState.current) {
      const v = npcState.current[id];
      v.next -= dt;
      if (v.next <= 0 || Math.hypot(v.tx - v.x, v.tz - v.z) < 10) {
        if (v.next <= 0) {
          const s = hashStr(id) + now * 0.0003;
          v.tx = PAD + rand(s) * (WORLD_W - 2 * PAD);
          v.tz = PAD + rand(s + 9.1) * (WORLD_H - 2 * PAD);
          v.next = 2 + rand(s + 3.3) * 4;
        }
      }
      const ddx = v.tx - v.x, ddz = v.tz - v.z;
      const d = Math.hypot(ddx, ddz);
      v.walking = d > 6;
      if (v.walking) {
        v.x += (ddx / d) * SPEED * 0.5 * dt;
        v.z += (ddz / d) * SPEED * 0.5 * dt;
        v.heading = Math.atan2(ddx, ddz);
      }
      const g = npcRefs.current[id];
      if (g) {
        g.position.set(v.x, bob(now + hashStr(id), v.walking), v.z);
        g.rotation.y = lerpAngle(g.rotation.y, v.heading, 0.15);
      }
    }

    // 원격 플레이어
    for (const r of remoteR.current) {
      const g = remoteRefs.current[r.id];
      if (g) {
        g.position.x += (r.x - g.position.x) * 0.2;
        g.position.z += (r.y - g.position.z) * 0.2;
        g.position.y = bob(now + hashStr(r.id), true);
        g.rotation.y = lerpAngle(g.rotation.y, dirHeading(r.dir), 0.2);
      }
    }

    // 카메라 추적
    const target = new THREE.Vector3(m.x, 48, m.z);
    const camPos = new THREE.Vector3(m.x, 300, m.z + 330);
    camera.position.lerp(camPos, 0.12);
    camera.lookAt(target);

    // 근접 오디오
    if (cbR.current.onAudio && now - lastAudioAt.current > 160) {
      const out: AudioVol[] = [];
      for (const s of speakersR.current) {
        const v = 1 - Math.hypot(m.x - s.x, m.z - s.y) / RANGE;
        if (v > 0.03) out.push({ id: s.id, volume: +v.toFixed(2) });
      }
      for (const r of remoteR.current) {
        if (!r.track) continue;
        const v = 1 - Math.hypot(m.x - r.x, m.z - r.y) / RANGE;
        if (v > 0.03) out.push({ id: `player_${r.id}`, volume: +v.toFixed(2) });
      }
      const sig = out.map((o) => `${o.id}:${o.volume}`).join("|");
      if (sig !== lastAudio.current) {
        lastAudio.current = sig; lastAudioAt.current = now;
        cbR.current.onAudio(out);
      }
    }

    // 위치 broadcast
    if (cbR.current.onMove && now - lastEmit.current > 120 && m.walking) {
      lastEmit.current = now;
      const dir = Math.abs(dx) > Math.abs(dz) ? (dx < 0 ? "left" : "right") : dz < 0 ? "up" : "down";
      cbR.current.onMove(Math.round(m.x), Math.round(m.z), dir);
    }
  });

  const L = lightCfg(time);

  const onGroundDown = (e: ThreeEvent<PointerEvent>) => {
    if (!editMode || !onPlaceAt) return;
    e.stopPropagation();
    onPlaceAt(clamp(Math.round(e.point.x), PAD, WORLD_W - PAD), clamp(Math.round(e.point.z), PAD, WORLD_H - PAD));
  };

  return (
    <group>
      <ambientLight intensity={L.amb} color={L.ambColor} />
      <directionalLight
        position={[WORLD_W * 0.3, 700, WORLD_H * 0.1]}
        intensity={L.dir}
        color={L.dirColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-900}
        shadow-camera-right={900}
        shadow-camera-top={900}
        shadow-camera-bottom={-900}
        shadow-camera-near={1}
        shadow-camera-far={2000}
      />
      {time.isNight && <pointLight position={[700, 200, 500]} intensity={0.5} color="#8aa0ff" distance={1600} />}

      {/* 바닥 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[WORLD_W / 2, 0, WORLD_H / 2]}
        receiveShadow
        onPointerDown={onGroundDown}
      >
        <planeGeometry args={[WORLD_W, WORLD_H]} />
        <meshStandardMaterial color={adjust(scene.floor[0], 24)} />
      </mesh>
      {/* 벽 (뒤편) */}
      <mesh position={[WORLD_W / 2, 120, 0]} receiveShadow>
        <boxGeometry args={[WORLD_W, 240, 12]} />
        <meshStandardMaterial color={scene.wall} />
      </mesh>

      {/* 씬 소품 */}
      {scene.decor.map((d, i) => (
        <group key={i} position={[d.x, 0, d.y]} scale={d.size / 56}>
          <Decor3D kind={d.kind} />
        </group>
      ))}

      {/* 배치한 가구 */}
      {placed.map((p) => (
        <group
          key={p.id}
          position={[p.x, 0, p.y]}
          onPointerDown={(e) => { if (editMode) { e.stopPropagation(); onRemovePlaced?.(p.id); } }}
        >
          <Decor3D kind={p.kind as DecorKind} />
          {editMode && (
            <Html position={[0, 70, 0]} center distanceFactor={520}>
              <div className="bg-live text-white rounded-full w-5 h-5 grid place-items-center text-xs">×</div>
            </Html>
          )}
        </group>
      ))}

      {/* 음악 존 (네온 댄스플로어 + DJ부스) */}
      {speakers.map((s) => (
        <MusicZone3D key={s.id} x={s.x} y={s.y} genre={s.genre} label={s.label} range={RANGE} meRef={me} />
      ))}

      {/* 나 */}
      <group ref={playerRef}>
        <Avatar3D a={meAppearance} />
        <NameTag handle={meHandle} me track={meTrack ?? undefined} />
      </group>

      {/* NPC */}
      {npcs.map((n) => (
        <group key={n.id} ref={(el) => { if (el) npcRefs.current[n.id] = el; }} position={[n.x, 0, n.y]}>
          <Avatar3D a={n.appearance ?? appearanceFromSeed(n.handle)} />
          <NameTag handle={n.handle} />
        </group>
      ))}

      {/* 원격 플레이어 */}
      {remote.map((r) => (
        <group key={r.id} ref={(el) => { if (el) remoteRefs.current[r.id] = el; }} position={[r.x, 0, r.y]}>
          <Avatar3D a={r.appearance ?? appearanceFromSeed(r.handle)} />
          <NameTag handle={r.handle} track={r.track} />
        </group>
      ))}
    </group>
  );
}

function NameTag({ handle, me, track }: { handle: string; me?: boolean; track?: Track }) {
  return (
    <Html position={[0, 78, 0]} center distanceFactor={560}>
      <div className="flex flex-col items-center pointer-events-none">
        {track && <span className="text-base animate-bob">🎵</span>}
        <span className={`text-[11px] font-bold px-1.5 rounded-full whitespace-nowrap ${me ? "bg-brand text-white" : "bg-black/45 text-white"}`}>
          {handle}
        </span>
      </div>
    </Html>
  );
}

// ---- helpers ----
function lightCfg(t: TimePhase) {
  switch (t.phase) {
    case "dawn": return { amb: 0.55, ambColor: "#ffd8c0", dir: 0.95, dirColor: "#ffd0a0" };
    case "dusk": return { amb: 0.5, ambColor: "#ffc0a0", dir: 0.85, dirColor: "#ff9a6a" };
    case "night": return { amb: 0.32, ambColor: "#5a6aa0", dir: 0.4, dirColor: "#7a8ad0" };
    default: return { amb: 0.72, ambColor: "#ffffff", dir: 1.15, dirColor: "#fff6e0" };
  }
}
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function bob(t: number, walking: boolean) {
  return walking ? Math.abs(Math.sin(t * 0.012)) * 5 : Math.sin(t * 0.003) * 1.5 + 1.5;
}
function rand(s: number) { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); }
function hashStr(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000; return h; }
function dirHeading(d?: string) {
  return d === "up" ? Math.PI : d === "down" ? 0 : d === "left" ? -Math.PI / 2 : d === "right" ? Math.PI / 2 : Math.PI;
}
function lerpAngle(a: number, b: number, t: number) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
function adjust(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
