"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Appearance, AnimalType } from "@/lib/appearance";

// 실제 귀여운 동물 3D 모델 (Poly Pizza). 발끝 y=0, 키 ~58. 부모가 이동/회전/바운스.
const ANIMAL: Record<AnimalType, { file: string; h: number; yaw?: number }> = {
  cat: { file: "animal_cat", h: 56 },
  dog: { file: "animal_dog", h: 56 },
  rabbit: { file: "animal_rabbit", h: 60 },
  bear: { file: "animal_bear", h: 62 },
  fox: { file: "animal_fox", h: 58 },
  frog: { file: "animal_frog", h: 48 },
  bird: { file: "animal_penguin", h: 52 },
  hamster: { file: "animal_hamster", h: 48 },
};
const url = (f: string) => `/models/poly/${f}.glb`;
Object.values(ANIMAL).forEach((v) => useGLTF.preload(url(v.file)));

export default function Avatar3D({ a }: { a: Appearance }) {
  const m = ANIMAL[a.animal ?? "cat"] ?? ANIMAL.cat;
  return <AnimalModel file={m.file} h={m.h} yaw={m.yaw ?? 0} />;
}

function AnimalModel({ file, h, yaw }: { file: string; h: number; yaw: number }) {
  const { scene } = useGLTF(url(file));
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.rotation.y = yaw;
    const box = new THREE.Box3().setFromObject(c);
    const sz = new THREE.Vector3();
    box.getSize(sz);
    c.scale.setScalar(h / (sz.y || 1));
    const b2 = new THREE.Box3().setFromObject(c);
    c.position.y = -b2.min.y;
    c.traverse((o: any) => {
      if (o.isMesh) o.castShadow = true;
    });
    return c;
  }, [scene, h, yaw]);
  return <primitive object={obj} />;
}
