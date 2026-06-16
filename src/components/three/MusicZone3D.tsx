"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { GENRES, type GenreId } from "@/lib/genres";

// 네온 댄스플로어 + DJ부스 음악 존. 발광 플로어 반경 = 가청 거리.
// 가까이 갈수록 플로어가 밝아지고(=존 안), 사운드웨이브 링이 퍼진다.
export default function MusicZone3D({
  x,
  y,
  genre,
  label,
  range,
  meRef,
}: {
  x: number;
  y: number;
  genre: GenreId;
  label: string;
  range: number;
  meRef: { current: { x: number; z: number } };
}) {
  const g = GENRES[genre];
  const col = new THREE.Color(g.color);

  const floorRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const beamsRef = useRef<THREE.Group>(null);
  const vinylRef = useRef<THREE.Mesh>(null);
  const wave1 = useRef<THREE.Mesh>(null);
  const wave2 = useRef<THREE.Mesh>(null);
  const wave3 = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const t = performance.now() / 1000;
    const dist = Math.hypot(meRef.current.x - x, meRef.current.z - y);
    const intensity = Math.max(0, 1 - dist / range); // 0~1
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);

    // 플로어 발광 (가까울수록 밝게 + 박자 펄스)
    if (floorRef.current) floorRef.current.emissiveIntensity = 0.25 + intensity * (0.7 + pulse * 0.4);
    if (coreRef.current) {
      const s = 1 + intensity * 0.12 + pulse * 0.05;
      coreRef.current.scale.set(s, 1, s);
    }
    // 라이트빔 회전 + 펄스
    if (beamsRef.current) {
      beamsRef.current.rotation.y += dt * 0.5;
      beamsRef.current.scale.y = 0.9 + pulse * 0.25 + intensity * 0.2;
    }
    // 턴테이블 회전
    if (vinylRef.current) vinylRef.current.rotation.y += dt * 2.2;
    // 사운드웨이브 (중심→가장자리 확장 반복)
    [wave1, wave2, wave3].forEach((w, i) => {
      if (!w.current) return;
      const p = ((t * 0.45 + i / 3) % 1); // 0~1
      w.current.scale.setScalar(0.15 + p * 0.95);
      (w.current.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (0.25 + intensity * 0.4);
    });
  });

  return (
    <group position={[x, 0, y]}>
      {/* 발광 댄스플로어 (가청 반경) */}
      <mesh ref={coreRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1, 0]} receiveShadow>
        <circleGeometry args={[range, 64]} />
        <meshStandardMaterial
          ref={floorRef}
          color={g.bg[0]}
          emissive={col}
          emissiveIntensity={0.4}
          transparent
          opacity={0.55}
          roughness={0.5}
        />
      </mesh>
      {/* 플로어 테두리 링 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
        <ringGeometry args={[range - 10, range, 64]} />
        <meshBasicMaterial color={col} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* 안쪽 격자 타일 느낌 (얇은 동심 링 2개) */}
      {[0.45, 0.72].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.6, 0]}>
          <ringGeometry args={[range * r - 3, range * r, 64]} />
          <meshBasicMaterial color={col} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 사운드웨이브 링 */}
      {[wave1, wave2, wave3].map((w, i) => (
        <mesh key={i} ref={w} rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
          <ringGeometry args={[range - 14, range, 64]} />
          <meshBasicMaterial color={col} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      {/* DJ 부스 */}
      <group>
        {/* 콘솔 */}
        <RoundedBox args={[86, 34, 50]} radius={6} smoothness={3} castShadow position={[0, 17, 0]}>
          <meshStandardMaterial color="#23232e" roughness={0.6} />
        </RoundedBox>
        {/* 네온 트림 */}
        <mesh position={[0, 35.5, 0]}>
          <boxGeometry args={[88, 2.5, 52]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} />
        </mesh>
        {/* 턴테이블 2개 */}
        {[-22, 22].map((tx) => (
          <group key={tx} position={[tx, 37, 6]}>
            <mesh><cylinderGeometry args={[11, 11, 2, 24]} /><meshStandardMaterial color="#1a1a20" /></mesh>
            <mesh ref={tx < 0 ? vinylRef : undefined} position={[0, 1.4, 0]}>
              <cylinderGeometry args={[9, 9, 1, 24]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[0, 2, 0]}><cylinderGeometry args={[2.5, 2.5, 1.4, 16]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.8} /></mesh>
          </group>
        ))}

        {/* 스피커 스택 2개 */}
        {[-58, 58].map((sx) => (
          <group key={sx} position={[sx, 0, 0]}>
            <RoundedBox args={[30, 64, 26]} radius={4} smoothness={3} castShadow position={[0, 32, 0]}>
              <meshStandardMaterial color="#2a2a34" roughness={0.7} />
            </RoundedBox>
            <mesh position={[0, 24, 13.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[9, 9, 2, 20]} /><meshStandardMaterial color="#15151b" /></mesh>
            <mesh position={[0, 46, 13.5]}><cylinderGeometry args={[5, 5, 2, 16]} /><meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} /></mesh>
          </group>
        ))}

        {/* 라이트 빔 (위로 퍼짐, 회전) */}
        <group ref={beamsRef} position={[0, 40, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[Math.PI, (i / 4) * Math.PI * 2, 0.18]} position={[Math.cos((i / 4) * Math.PI * 2) * 14, 60, Math.sin((i / 4) * Math.PI * 2) * 14]}>
              <coneGeometry args={[18, 120, 16, 1, true]} />
              <meshBasicMaterial color={col} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 떠다니는 음표 + 라벨 */}
      <Html position={[0, 95, 0]} center distanceFactor={520} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center pointer-events-none">
          <div className="flex gap-2 mb-1 text-lg">
            <span className="note-float" style={{ animationDelay: "0s" }}>♪</span>
            <span className="note-float" style={{ animationDelay: "0.6s" }}>♫</span>
            <span className="note-float" style={{ animationDelay: "1.2s" }}>♪</span>
          </div>
          <span className="chip bg-black/55 text-white text-[11px] whitespace-nowrap">
            {g.emoji} {label}
          </span>
        </div>
      </Html>
    </group>
  );
}
