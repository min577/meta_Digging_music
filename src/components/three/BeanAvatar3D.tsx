"use client";

import { Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Appearance } from "@/lib/appearance";
import { DEFAULT_PRESET, COSTUME_PRESETS } from "@/lib/characters";

// 디자인 PNG를 빌보드 스프라이트로 렌더 (항상 카메라를 향함). 발끝 y=0.
const COSTUME_SRC: Record<string, string> = Object.fromEntries(
  COSTUME_PRESETS.map((c) => [c.id, c.src])
);

function srcOf(a?: Appearance): string {
  if (a?.preset) return `/characters/${a.preset}`;
  if (a?.costume && a.costume !== "none" && COSTUME_SRC[a.costume]) {
    return `/characters/${COSTUME_SRC[a.costume]}`;
  }
  return `/characters/${DEFAULT_PRESET}`;
}

export default function BeanAvatar3D({ a }: { a: Appearance }) {
  const tex = useTexture(srcOf(a));
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  const img = (tex as THREE.Texture).image as HTMLImageElement | undefined;
  const ar = img && img.width ? img.width / img.height : 0.86;
  const h = 60;
  const w = h * ar;

  return (
    <Billboard position={[0, h * 0.5, 0]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.5} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  );
}
