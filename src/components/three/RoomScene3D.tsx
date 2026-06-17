"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import Avatar3D from "./Avatar3D";
import Decor3D from "./Decor3D";
import MusicZone3D from "./MusicZone3D";
import type { Appearance } from "@/lib/appearance";
import { appearanceFromSeed } from "@/lib/appearance";
import type { GenreId } from "@/lib/genres";
import { GENRES } from "@/lib/genres";
import type { Track, PlacedItem } from "@/lib/types";
import type { DecorKind } from "@/components/DecorSprite";
import { placeScene, type PlaceId, type EnvType } from "@/lib/places";
import { WORLD_W, WORLD_H } from "@/lib/scenes";
import { useTimePhase, type TimePhase } from "@/hooks/useTimePhase";

const PAD = 48;
const SPEED = 210;
const RANGE = 220; // 파티 중앙 무대
const PERSON_RANGE = 150; // 사람-대-사람 근접 청취 거리

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
  place: PlaceId;
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
  day: "#aedcf0", dawn: "#f6cdb0", dusk: "#e89a78", night: "#2b3666",
};

export default function RoomScene3D(props: Props) {
  const time = useTimePhase();
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-soft">
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ fov: 46, near: 1, far: 4000, position: [500, 320, 820] }}
      >
        <color attach="background" args={[SKY[time.phase]]} />
        <fog attach="fog" args={[SKY[time.phase], 1100, 2600]} />
        <Suspense fallback={null}>
          <Scene {...props} time={time} />
        </Suspense>
      </Canvas>

      {/* DOM 오버레이 */}
      <div className="absolute top-2 left-2 chip bg-black/40 text-white text-[11px] z-20 flex items-center gap-1">
        <span className="text-sm">{time.icon}</span> {time.clock} · {time.label}
      </div>
      <div className="absolute bottom-2 left-2 chip bg-black/40 text-white text-[10px] z-20">
        WASD 이동 · E 앉기
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
  meAppearance, meHandle, meTrack, place, npcs, remote = [], speakers = [],
  placed = [], editMode, onMove, onAudio, onPlaceAt, onRemovePlaced, time,
}: Props & { time: TimePhase }) {
  const { camera } = useThree();
  const scene = placeScene(place);

  const me = useRef({ x: WORLD_W / 2, z: WORLD_H * 0.62, heading: Math.PI, walking: false, seated: false });
  const keys = useRef<Set<string>>(new Set());

  // 앉을 수 있는 좌석(의자/벤치) 위치
  const seats = useMemo(
    () => scene.decor.filter((d) => d.kind === "chair" || d.kind === "bench").map((d) => ({ x: d.x, z: d.y })),
    [scene]
  );
  const seatsRef = useRef(seats); seatsRef.current = seats;
  const nearSeatRef = useRef<{ x: number; z: number } | null>(null);
  const lastPrompt = useRef("");
  const [prompt, setPrompt] = useState<{ x: number; z: number; text: string } | null>(null);
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
  const npcsR = useRef(npcs); npcsR.current = npcs;
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
      if (k === "e") {
        e.preventDefault();
        const m = me.current;
        if (m.seated) {
          m.seated = false;
          m.z = Math.min(WORLD_H - PAD, m.z + 40); // 일어나 앞으로
        } else if (nearSeatRef.current) {
          m.seated = true;
          m.x = nearSeatRef.current.x;
          m.z = nearSeatRef.current.z;
          keys.current.clear();
        }
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
    m.walking = !m.seated && (dx !== 0 || dz !== 0);
    if (m.walking) {
      const len = Math.hypot(dx, dz) || 1;
      m.x = clamp(m.x + (dx / len) * SPEED * dt, PAD, WORLD_W - PAD);
      m.z = clamp(m.z + (dz / len) * SPEED * dt, PAD, WORLD_H - PAD);
      m.heading = Math.atan2(dx, dz);
    }
    if (playerRef.current) {
      const py = m.seated ? 22 : bob(now, m.walking); // 앉으면 좌석 높이
      playerRef.current.position.set(m.x, py, m.z);
      playerRef.current.rotation.y = lerpAngle(playerRef.current.rotation.y, m.heading, 0.2);
    }

    // 근처 좌석 탐지 + 안내 프롬프트
    if (!m.seated) {
      let best: { x: number; z: number } | null = null;
      let bd = 70;
      for (const s of seatsRef.current) {
        const d = Math.hypot(m.x - s.x, m.z - s.z);
        if (d < bd) { bd = d; best = s; }
      }
      nearSeatRef.current = best;
    }
    const sig = m.seated ? `seat@${Math.round(m.x)}` : nearSeatRef.current ? `near@${nearSeatRef.current.x}` : "";
    if (sig !== lastPrompt.current) {
      lastPrompt.current = sig;
      if (m.seated) setPrompt({ x: m.x, z: m.z, text: "일어서기 (E)" });
      else if (nearSeatRef.current) setPrompt({ x: nearSeatRef.current.x, z: nearSeatRef.current.z, text: "앉기 (E)" });
      else setPrompt(null);
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
    const target = new THREE.Vector3(m.x, 55, m.z - 40);
    const camPos = new THREE.Vector3(m.x, 320, m.z + 380);
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
        const v = 1 - Math.hypot(m.x - r.x, m.z - r.y) / PERSON_RANGE;
        if (v > 0.03) out.push({ id: `player_${r.id}`, volume: +v.toFixed(2) });
      }
      for (const n of npcsR.current) {
        if (!n.track) continue;
        const st = npcState.current[n.id];
        const nx = st?.x ?? n.x, nz = st?.z ?? n.y;
        const v = 1 - Math.hypot(m.x - nx, m.z - nz) / PERSON_RANGE;
        if (v > 0.03) out.push({ id: `npc_${n.id}`, volume: +v.toFixed(2) });
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
        position={[WORLD_W * 0.3, 620, WORLD_H * 0.1]}
        intensity={L.dir}
        color={L.dirColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-700}
        shadow-camera-right={700}
        shadow-camera-top={700}
        shadow-camera-bottom={-700}
        shadow-camera-near={1}
        shadow-camera-far={1800}
      />
      <hemisphereLight intensity={time.isNight ? 0.45 : 0.4} color={SKY[time.phase]} groundColor="#3a3530" />
      {time.isNight && (
        <>
          <pointLight position={[320, 220, 300]} intensity={1.0} color="#aebbff" distance={1600} />
          <pointLight position={[720, 220, 460]} intensity={0.9} color="#9ad0ff" distance={1600} />
        </>
      )}

      {/* 바닥 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[WORLD_W / 2, 0, WORLD_H / 2]}
        receiveShadow
        onPointerDown={onGroundDown}
      >
        <planeGeometry args={[WORLD_W, WORLD_H]} />
        <meshStandardMaterial color={adjust(scene.floor[0], scene.floorTint)} />
      </mesh>
      {/* 벽 (실내 장소: 뒤+좌우, 밝은 실내색 + 걸레받이) */}
      {scene.env === "indoor" && (
        <>
          <mesh position={[WORLD_W / 2, 80, -4]} receiveShadow>
            <boxGeometry args={[WORLD_W, 160, 12]} />
            <meshStandardMaterial color={scene.wallColor} />
          </mesh>
          <mesh position={[WORLD_W / 2, 13, 4]}>
            <boxGeometry args={[WORLD_W, 26, 8]} />
            <meshStandardMaterial color={adjust(scene.wallColor, -36)} />
          </mesh>
          <mesh position={[3, 65, WORLD_H / 2]} receiveShadow>
            <boxGeometry args={[10, 130, WORLD_H]} />
            <meshStandardMaterial color={adjust(scene.wallColor, -12)} />
          </mesh>
          <mesh position={[WORLD_W - 3, 65, WORLD_H / 2]} receiveShadow>
            <boxGeometry args={[10, 130, WORLD_H]} />
            <meshStandardMaterial color={adjust(scene.wallColor, -12)} />
          </mesh>
          {/* 따뜻한 실내 조명 */}
          <pointLight position={[300, 150, 250]} intensity={0.55} color="#ffd9a0" distance={700} />
          <pointLight position={[700, 150, 250]} intensity={0.55} color="#ffd9a0" distance={700} />
        </>
      )}

      {/* 장소별 특수 환경 */}
      <EnvFx env={scene.env} night={time.isNight} />
      {place === "library" && <LibraryWindows />}

      {/* 씬 소품 (정렬 배치) */}
      {scene.decor.map((d, i) => (
        <group key={i} position={[d.x, 0, d.y]} rotation={[0, d.rot ?? 0, 0]} scale={d.size / 56}>
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

      {/* 앉기 안내 */}
      {prompt && (
        <Html position={[prompt.x, 70, prompt.z]} center distanceFactor={500} style={{ pointerEvents: "none" }}>
          <div className="chip bg-brand text-white text-[11px] whitespace-nowrap shadow-soft">⌨ {prompt.text}</div>
        </Html>
      )}

      {/* 나 */}
      <group ref={playerRef}>
        <Avatar3D a={meAppearance} />
        <NameTag handle={meHandle} me track={meTrack ?? undefined} />
        {meTrack && <AudioAura genre={meTrack.genre} />}
      </group>

      {/* NPC */}
      {npcs.map((n) => (
        <group key={n.id} ref={(el) => { if (el) npcRefs.current[n.id] = el; }} position={[n.x, 0, n.y]}>
          <Avatar3D a={n.appearance ?? appearanceFromSeed(n.handle)} />
          <NameTag handle={n.handle} track={n.track} />
          {n.track && <AudioAura genre={n.track.genre} />}
        </group>
      ))}

      {/* 원격 플레이어 */}
      {remote.map((r) => (
        <group key={r.id} ref={(el) => { if (el) remoteRefs.current[r.id] = el; }} position={[r.x, 0, r.y]}>
          <Avatar3D a={r.appearance ?? appearanceFromSeed(r.handle)} />
          <NameTag handle={r.handle} track={r.track} />
          {r.track && <AudioAura genre={r.track.genre} />}
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

// 음악을 송출 중인 사람 발밑의 가청 영역 (개인 단위 존)
function AudioAura({ genre }: { genre: GenreId }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const col = GENRES[genre]?.color ?? "#6c8ae4";
  useFrame(() => {
    const p = 0.5 + 0.5 * Math.sin(performance.now() / 1000 * 3);
    if (ringRef.current) {
      const s = 0.86 + p * 0.14;
      ringRef.current.scale.set(s, s, 1);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + p * 0.28;
    }
  });
  return (
    <group position={[0, 1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[PERSON_RANGE, 48]} />
        <meshBasicMaterial color={col} transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[PERSON_RANGE - 12, PERSON_RANGE, 48]} />
        <meshBasicMaterial color={col} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// 장소별 특수 배경 (한강 물 / 비행기 구름 / 도시 스카이라인)
function EnvFx({ env, night }: { env: EnvType; night: boolean }) {
  if (env === "water") {
    const cx = WORLD_W / 2;
    return (
      <>
        {/* 강물 (정면 먼 쪽으로 크게) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -2, -260]}>
          <planeGeometry args={[3000, 1300]} />
          <meshStandardMaterial color="#3f86ad" roughness={0.16} metalness={0.55} emissive={night ? "#205a82" : "#1a4e72"} emissiveIntensity={night ? 0.55 : 0.2} />
        </mesh>
        {/* 강변(잔디→물 경계) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.5, 10]}>
          <planeGeometry args={[WORLD_W + 200, 40]} />
          <meshStandardMaterial color="#caa46e" />
        </mesh>
        {/* 한강 다리 */}
        <mesh position={[cx, 70, -70]} castShadow><boxGeometry args={[1500, 16, 34]} /><meshStandardMaterial color="#3a3f48" /></mesh>
        {[-300, -50, 200, 450, 700, 950, 1200].map((x, i) => (
          <mesh key={i} position={[x, 44, -70]}><boxGeometry args={[13, 52, 13]} /><meshStandardMaterial color="#2e333b" /></mesh>
        ))}
        {/* 다리 조명 */}
        {night && [-50, 200, 450, 700, 950].map((x, i) => (
          <mesh key={"l" + i} position={[x, 84, -70]}><sphereGeometry args={[4, 10, 10]} /><meshStandardMaterial color="#ffe6a0" emissive="#ffcf6a" emissiveIntensity={1} /></mesh>
        ))}
        <Skyline z={-560} night={night} />
      </>
    );
  }
  if (env === "cabin") return <AirplaneScene />;
  if (env === "skyline") return <Skyline z={-360} night={night} tall />;
  if (env === "sky") {
    const spots: [number, number, number][] = [
      [120, 70, 160], [1300, 100, 120], [700, 130, -260], [180, 50, 780],
      [1260, 90, 820], [760, 40, 1080], [430, 160, -120], [1010, 160, -120],
    ];
    return (
      <>
        {spots.map((p, i) => (
          <group key={i} position={p}>
            <mesh><sphereGeometry args={[28, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
            <mesh position={[-26, -5, 5]}><sphereGeometry args={[19, 14, 14]} /><meshStandardMaterial color="#eef3f8" /></mesh>
            <mesh position={[26, -5, -5]}><sphereGeometry args={[19, 14, 14]} /><meshStandardMaterial color="#eef3f8" /></mesh>
          </group>
        ))}
      </>
    );
  }
  return null;
}

// 실제 GLB 모델을 최대 치수 기준으로 스케일해 바닥에 배치
useGLTF.preload("/models/poly/airplane.glb");
function EnvModel({ url, targetMax, position, rotationY = 0 }: { url: string; targetMax: number; position: [number, number, number]; rotationY?: number }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    const m = Math.max(sz.x, sz.y, sz.z) || 1;
    c.scale.setScalar(targetMax / m);
    const b2 = new THREE.Box3().setFromObject(c);
    c.position.y = -b2.min.y;
    c.traverse((o: any) => { if (o.isMesh) o.castShadow = true; });
    return c;
  }, [scene, targetMax]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <primitive object={obj} />
    </group>
  );
}

// 비행기 룸: 실제 비행기 모델(Poly Pizza, CC-BY)을 배경 히어로로
function AirplaneScene() {
  return <EnvModel url="/models/poly/airplane.glb" targetMax={820} position={[WORLD_W / 2, 6, 330]} rotationY={Math.PI / 2} />;
}

// (구) 절차적 기내 — 미사용
function AirplaneCabin({ night }: { night: boolean }) {
  const cz = 370; // 동체 중심
  const hull = "#e7eaf0";
  const hullDk = "#c7ccd6";
  const rows = [230, 400, 570, 740];
  const seatZ = [255, 312, 432, 489];
  return (
    <group>
      {/* 주날개 (바닥에 낮게, 동체 밖 멀리 — 위에서 보면 비행기) */}
      <mesh castShadow position={[480, 1, -120]} rotation={[0, 0.28, 0]}>
        <boxGeometry args={[200, 8, 130]} />
        <meshStandardMaterial color={hullDk} />
      </mesh>
      <mesh castShadow position={[480, 1, 840]} rotation={[0, -0.28, 0]}>
        <boxGeometry args={[200, 8, 130]} />
        <meshStandardMaterial color={hullDk} />
      </mesh>

      {/* 노즈(기수) — 왼쪽 끝, 작게/낮게 */}
      <mesh castShadow position={[60, 40, cz]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[120, 150, 24]} />
        <meshStandardMaterial color={hull} />
      </mesh>

      {/* 꼬리 — 오른쪽 끝 */}
      <mesh castShadow position={[955, 40, cz]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[120, 140, 24]} />
        <meshStandardMaterial color={hull} />
      </mesh>
      {/* 수직 꼬리날개 (비행기 신호) */}
      <mesh castShadow position={[980, 95, cz]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[14, 120, 70]} />
        <meshStandardMaterial color="#6c8ae4" />
      </mesh>

      {/* 동체 측벽(낮게) + 창문 + 치트라인 */}
      {[150, 590].map((z, wi) => (
        <group key={wi}>
          <mesh position={[510, 56, z]} receiveShadow>
            <boxGeometry args={[760, 112, 18]} />
            <meshStandardMaterial color={hull} />
          </mesh>
          <mesh position={[510, 86, z + (wi === 0 ? 9 : -9)]}>
            <boxGeometry args={[760, 8, 2]} />
            <meshStandardMaterial color="#6c8ae4" />
          </mesh>
          {[210, 330, 450, 570, 690, 810].map((x, i) => (
            <mesh key={i} position={[x, 64, z + (wi === 0 ? 10 : -10)]}>
              <boxGeometry args={[42, 34, 2]} />
              <meshStandardMaterial color="#bfe6f4" emissive="#9fd4ec" emissiveIntensity={night ? 0.5 : 0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 좌석열 (통로 양쪽) */}
      {rows.flatMap((x) =>
        seatZ.map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]} rotation={[0, z < cz ? Math.PI / 2 : -Math.PI / 2, 0]} scale={0.8}>
            <Decor3D kind="planeseat" />
          </group>
        ))
      )}
    </group>
  );
}

// 도서관 뒷벽 아치 창문 (따뜻한 빛) — 책장 위로 보임
function LibraryWindows() {
  const xs = [120, 290, 460, 630, 800, 950];
  return (
    <group>
      {xs.map((x, i) => (
        <group key={i} position={[x, 128, 3]}>
          <mesh position={[0, 0, -3]}>
            <boxGeometry args={[120, 168, 6]} />
            <meshStandardMaterial color="#6e4a2c" />
          </mesh>
          <mesh>
            <boxGeometry args={[104, 140, 3]} />
            <meshStandardMaterial color="#ffe6b0" emissive="#ffcf80" emissiveIntensity={0.75} />
          </mesh>
          <mesh position={[0, 70, 0]} rotation={[0, 0, 0]}>
            <circleGeometry args={[52, 24, 0, Math.PI]} />
            <meshStandardMaterial color="#ffe6b0" emissive="#ffcf80" emissiveIntensity={0.75} />
          </mesh>
          <mesh position={[0, 0, 1]}>
            <boxGeometry args={[6, 140, 1]} />
            <meshStandardMaterial color="#6e4a2c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Skyline({ z, night, tall }: { z: number; night: boolean; tall?: boolean }) {
  const items = [];
  for (let i = 0; i < 14; i++) {
    const x = -150 + i * 90;
    const h = (180 + ((i * 53) % 5) * 80) * (tall ? 1.4 : 1);
    items.push(
      <mesh key={i} position={[x, h / 2, z - ((i * 37) % 3) * 130]}>
        <boxGeometry args={[88, h, 88]} />
        <meshStandardMaterial color={night ? "#1a2030" : "#39414f"} emissive={night ? "#ffd98a" : "#000000"} emissiveIntensity={night ? 0.08 : 0} />
      </mesh>
    );
  }
  return <>{items}</>;
}

// ---- helpers ----
function lightCfg(t: TimePhase) {
  switch (t.phase) {
    case "dawn": return { amb: 0.55, ambColor: "#ffd8c0", dir: 0.95, dirColor: "#ffd0a0" };
    case "dusk": return { amb: 0.5, ambColor: "#ffc0a0", dir: 0.85, dirColor: "#ff9a6a" };
    case "night": return { amb: 0.72, ambColor: "#a6b2e0", dir: 0.82, dirColor: "#c2cdf2" };
    default: return { amb: 0.78, ambColor: "#ffffff", dir: 1.15, dirColor: "#fff6e0" };
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
