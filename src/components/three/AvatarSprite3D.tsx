"use client";

import { useMemo } from "react";
import { Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { spriteUrl } from "@/lib/avatarSprites";

// 프리셋 스프라이트를 3D 룸에 세우는 빌보드 standee.
// 절차적 Avatar3D와 키를 맞춘다(발끝 y=0, 키 ~76). Y축만 회전(항상 정립).
const HEIGHT = 76;

export default function AvatarSprite3D({ id }: { id: string }) {
  const tex = useTexture(spriteUrl(id));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  const aspect = useMemo(() => {
    const img = tex.image as { width?: number; height?: number } | undefined;
    return img && img.width && img.height ? img.width / img.height : 0.62;
  }, [tex]);
  const w = HEIGHT * aspect;

  return (
    <group>
      {/* 바닥 접지 그림자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.6, 2]}>
        <circleGeometry args={[w * 0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <Billboard lockX lockZ position={[0, HEIGHT / 2, 0]}>
        <mesh>
          <planeGeometry args={[w, HEIGHT]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.5} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  );
}
