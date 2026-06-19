"use client";

import { Outlines } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";
import type { Appearance, FaceStyle } from "@/lib/appearance";

// "Bean" — 디깅타운 오리지널 마스코트.
// 머리·몸이 하나로 이어진 젤리빈 실루엣 + 큰 글로시 눈 + 음악 신호 안테나.
// 발끝 y=0, 키 ~62. 정면 = +Z (부모가 heading으로 회전).
// 색: outfit=본체, lighten(outfit)=배 패치, pants=목도리, hairColor=안테나 글로우.

const OUT = "#2b211a";

export default function BeanAvatar3D({ a }: { a: Appearance }) {
  const body = a.outfit || "#6C8AE4";
  const belly = tone(body, 30);
  const foot = tone(body, -34);
  const accent = a.hairColor || "#FF6EC7";
  const scarf = a.pants || "#3E4A5E";

  const eyeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#241d1a", roughness: 0.18, metalness: 0.1 }),
    []
  );

  return (
    <group>
      {/* 발 */}
      {[-6.5, 6.5].map((x) => (
        <mesh key={x} position={[x, 4.4, 5]} castShadow>
          <sphereGeometry args={[4.6, 20, 20]} />
          <meshStandardMaterial color={foot} roughness={0.6} />
          <Outlines thickness={2.4} color={OUT} />
        </mesh>
      ))}

      {/* 팔(작은 너브) */}
      {[-16.5, 16.5].map((x, i) => (
        <mesh key={x} position={[x, 25, 1]} rotation={[0, 0, i ? -0.2 : 0.2]} castShadow>
          <sphereGeometry args={[4.8, 18, 18]} />
          <meshStandardMaterial color={tone(body, -8)} roughness={0.58} />
          <Outlines thickness={2.2} color={OUT} />
        </mesh>
      ))}

      {/* 본체 (젤리빈 에그) */}
      <mesh position={[0, 30, 0]} scale={[1, 1.22, 1]} castShadow>
        <sphereGeometry args={[18, 40, 40]} />
        <meshStandardMaterial color={body} roughness={0.5} />
        <Outlines thickness={3} color={OUT} />
      </mesh>

      {/* 배 패치 (앞면 투톤) */}
      <mesh position={[0, 24, 16.9]} rotation={[-0.12, 0, 0]}>
        <circleGeometry args={[8.4, 32]} />
        <meshStandardMaterial color={belly} roughness={0.55} />
      </mesh>

      {/* 림 하이라이트 (좌상단 부드러운 광) */}
      <mesh position={[-7, 40, 11]} scale={[1.3, 1.8, 0.4]}>
        <sphereGeometry args={[4.2, 18, 18]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.16} roughness={1} depthWrite={false} />
      </mesh>

      {/* 목도리(액센트 컬러) */}
      <mesh position={[0, 43.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[12.4, 2.2, 14, 36]} />
        <meshStandardMaterial color={scarf} roughness={0.7} />
        <Outlines thickness={1.8} color={OUT} />
      </mesh>

      {/* 얼굴 (표정) */}
      <Face3D face={a.face} eyeMat={eyeMat} />

      {/* 볼터치 */}
      {[-11, 11].map((x) => (
        <mesh key={x} position={[x, 31.5, 12.5]}>
          <sphereGeometry args={[2.7, 16, 16]} />
          <meshStandardMaterial color="#ff9bb0" transparent opacity={0.55} roughness={1} depthWrite={false} />
        </mesh>
      ))}

      {/* 음악 신호 안테나 (시그니처) */}
      <mesh position={[2.5, 54.5, 0]} rotation={[0, 0, -0.18]}>
        <cylinderGeometry args={[0.55, 0.55, 8, 8]} />
        <meshStandardMaterial color={tone(body, -20)} roughness={0.5} />
      </mesh>
      <mesh position={[3.6, 59, 0]}>
        <sphereGeometry args={[2.6, 18, 18]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} roughness={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

// 표정 — 눈/입 변형
function Face3D({ face, eyeMat }: { face: FaceStyle; eyeMat: THREE.Material }) {
  const MOUTH = "#3a2d27";
  const EYE = "#241d1a";

  const RoundEye = ({ x }: { x: number }) => (
    <group position={[x, 36, 14.5]}>
      <mesh scale={[0.82, 1.18, 0.6]}>
        <sphereGeometry args={[3.9, 22, 22]} />
        <primitive object={eyeMat} attach="material" />
      </mesh>
      <mesh position={[-1, 1.4, 2.2]}>
        <sphereGeometry args={[1.05, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.1, -1.1, 2.1]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
  const ArchEye = ({ x }: { x: number }) => (
    <mesh position={[x, 36, 15]}>
      <torusGeometry args={[3, 0.7, 8, 16, Math.PI]} />
      <meshStandardMaterial color={EYE} />
    </mesh>
  );
  const LineEye = ({ x }: { x: number }) => (
    <mesh position={[x, 36, 15]}>
      <boxGeometry args={[6, 1.4, 1]} />
      <meshStandardMaterial color={EYE} />
    </mesh>
  );

  let eyes: React.ReactNode;
  if (face === "happy") eyes = <><ArchEye x={-6.4} /><ArchEye x={6.4} /></>;
  else if (face === "cool") eyes = <><LineEye x={-6.4} /><LineEye x={6.4} /></>;
  else if (face === "wink") eyes = <><RoundEye x={-6.4} /><ArchEye x={6.4} /></>;
  else eyes = <><RoundEye x={-6.4} /><RoundEye x={6.4} /></>; // smile, cat

  const mouth =
    face === "cool" ? (
      <mesh position={[0, 30.6, 16.4]}>
        <boxGeometry args={[5, 1.3, 1]} />
        <meshStandardMaterial color={MOUTH} />
      </mesh>
    ) : (
      <mesh position={[0, 30.6, 16.6]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[face === "happy" ? 3 : 2, 0.55, 8, 20, Math.PI]} />
        <meshStandardMaterial color={MOUTH} />
      </mesh>
    );

  return (<>{eyes}{mouth}</>);
}

function tone(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
