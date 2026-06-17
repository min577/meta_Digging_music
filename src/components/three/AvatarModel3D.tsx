"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { AnimalType } from "@/lib/appearance";

// CC0 Poly Pizza 동물 캐릭터 GLB를 아바타로 사용 (라이선스 깨끗 → 공개 배포 OK).
const MODEL: Record<AnimalType, string> = {
  cat: "animal_cat",
  rabbit: "animal_rabbit",
  bear: "animal_bear",
  dog: "animal_dog",
  fox: "animal_fox",
  frog: "animal_frog",
  hamster: "animal_hamster",
  bird: "animal_penguin", // bird 대체(가용 모델)
};
const url = (a: AnimalType) => `/models/poly/${MODEL[a] ?? "animal_cat"}.glb`;
Object.keys(MODEL).forEach((a) => useGLTF.preload(url(a as AnimalType)));

const TARGET_H = 64; // 절차적 아바타와 키 정렬
const FACING = Math.PI; // 모델 정면을 +Z(카메라 시작쪽)에 맞추는 오프셋

export default function AvatarModel3D({ animal }: { animal: AnimalType }) {
  const { scene } = useGLTF(url(animal));
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const h = box.max.y - box.min.y || 1;
    c.scale.setScalar(TARGET_H / h);
    const b2 = new THREE.Box3().setFromObject(c);
    c.position.y = -b2.min.y; // 발끝 y=0
    c.traverse((o: THREE.Object3D) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <group rotation={[0, FACING, 0]}>
      <primitive object={obj} />
    </group>
  );
}
