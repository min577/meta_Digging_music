"use client";

import { useRef } from "react";
import { Billboard, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { avatarSrc, type Appearance } from "@/lib/appearance";

// 디자인 PNG(또는 합성 dataURL)를 빌보드 스프라이트로 렌더 (항상 카메라를 향함). 발끝 y=0.
// 걷는 방향으로 좌우 반전 + 걸을 때 흔들림으로 자연스럽게.

export interface AvatarMotion {
  walking?: boolean;
  /** 좌우 속도 — 부호로 바라보는 방향 결정 */
  vx?: number;
  /** 또는 heading(atan2(vx,vz)) — vx 없을 때 */
  heading?: number;
}

export default function BeanAvatar3D({
  a,
  move,
}: {
  a: Appearance;
  move?: { current?: AvatarMotion | null };
}) {
  const tex = useTexture(avatarSrc(a));
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  const img = (tex as THREE.Texture).image as HTMLImageElement | undefined;
  const ar = img && img.width ? img.width / img.height : 0.86;
  const h = 60;
  const w = h * ar;

  const meshRef = useRef<THREE.Mesh>(null);
  const facing = useRef(1);

  useFrame(() => {
    const m = meshRef.current;
    if (!m) return;
    const now = performance.now() / 1000;
    const mv = move?.current;
    const walking = !!mv?.walking;
    // 좌우 방향: vx 우선, 없으면 heading의 x성분
    const sideVel = mv?.vx ?? (mv?.heading != null ? Math.sin(mv.heading) * 100 : 0);
    if (sideVel > 6) facing.current = 1;
    else if (sideVel < -6) facing.current = -1;

    // 걸을 때 좌우 흔들림 + 살짝 통통, 정지 시 은은한 숨쉬기
    const sway = walking ? Math.sin(now * 9) * 0.08 : Math.sin(now * 1.6) * 0.018;
    m.rotation.z = sway;
    m.scale.x = facing.current;
    m.scale.y = walking ? 1 + Math.abs(Math.sin(now * 9)) * 0.04 : 1;
  });

  return (
    <Billboard position={[0, h * 0.5, 0]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.5} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  );
}
