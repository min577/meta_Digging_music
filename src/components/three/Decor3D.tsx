"use client";

import { useMemo } from "react";
import { RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { DecorKind } from "@/components/DecorSprite";

// CC0 KayKit 가구 GLTF 매핑 (있으면 실제 모델, 없으면 프리미티브 폴백)
const GLB: Partial<Record<DecorKind, { file: string; h: number; flat?: boolean }>> = {
  sofa: { file: "couch_pillows", h: 34 },
  chair: { file: "chair_A", h: 36 },
  table: { file: "table_medium", h: 34 },
  bed: { file: "bed_double_A", h: 30 },
  bookshelf: { file: "shelf_B_large_decorated", h: 78 },
  lamp: { file: "lamp_table", h: 40 },
  floorlamp: { file: "lamp_standing", h: 66 },
  plant: { file: "cactus_medium_A", h: 44 },
  painting: { file: "pictureframe_standing_A", h: 48 },
  cushion: { file: "pillow_A", h: 14 },
  counter: { file: "cabinet_medium_decorated", h: 44 },
  rug: { file: "rug_rectangle_A", h: 180, flat: true },
  // 변형(반복감 완화)
  chair2: { file: "armchair", h: 38 },
  chair3: { file: "chair_stool", h: 30 },
  table2: { file: "table_small", h: 30 },
  plant2: { file: "cactus_small_A", h: 30 },
  shelf2: { file: "shelf_A_big", h: 70 },
  painting2: { file: "pictureframe_large_A", h: 52 },
  books: { file: "book_set", h: 16 },
};
const glbUrl = (f: string) => `/models/kaykit/${f}.gltf`;
Object.values(GLB).forEach((v) => v && useGLTF.preload(glbUrl(v.file)));

// 로드한 GLTF 정규화(세움=높이, 평면=가로폭) + 바닥 안착 + 그림자
function GlbProp({ file, targetH, flat }: { file: string; targetH: number; flat?: boolean }) {
  const { scene } = useGLTF(glbUrl(file));
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    if (flat) {
      const w = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) || 1;
      c.scale.setScalar(targetH / w);
    } else {
      const h = box.max.y - box.min.y || 1;
      c.scale.setScalar(targetH / h);
    }
    const box2 = new THREE.Box3().setFromObject(c);
    c.position.y = -box2.min.y + (flat ? 0.6 : 0);
    c.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = !flat;
        o.receiveShadow = !!flat;
      }
    });
    return c;
  }, [scene, targetH, flat]);
  return <primitive object={obj} />;
}

// DecorKind를 3D로. KayKit 가구가 있으면 실제 모델, 없으면 프리미티브.
export default function Decor3D({ kind }: { kind: DecorKind }) {
  const g = GLB[kind];
  if (g) return <GlbProp file={g.file} targetH={g.h} flat={g.flat} />;
  return <group>{render(kind)}</group>;
}

const M = (color: string, emissive?: string, ei = 0.6) => (
  <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissive ? ei : 0} roughness={0.85} />
);

// 둥근 모서리 박스 (동물의 숲 느낌)
function box(w: number, h: number, d: number, y: number, color: string, pos: [number, number, number] = [0, 0, 0], em?: string) {
  const r = Math.min(4, Math.min(w, h, d) * 0.28);
  return (
    <RoundedBox args={[w, h, d]} radius={r} smoothness={3} castShadow position={[pos[0], y + h / 2, pos[2]]}>
      {M(color, em)}
    </RoundedBox>
  );
}
function cyl(r: number, h: number, y: number, color: string, pos: [number, number, number] = [0, 0, 0], em?: string) {
  return (
    <mesh castShadow position={[pos[0], y + h / 2, pos[2]]}>
      <cylinderGeometry args={[r, r, h, 20]} />
      {M(color, em)}
    </mesh>
  );
}
function sph(r: number, pos: [number, number, number], color: string, em?: string) {
  return (
    <mesh castShadow position={pos}>
      <sphereGeometry args={[r, 18, 18]} />
      {M(color, em)}
    </mesh>
  );
}

function render(kind: DecorKind): React.ReactNode {
  switch (kind) {
    case "plant":
      return (<>
        {cyl(7, 12, 0, "#c97a45")}
        {sph(10, [0, 24, 0], "#5bb073")}
        {sph(7, [6, 20, 3], "#4f9d63")}
        {sph(7, [-5, 22, -2], "#63bd7d")}
      </>);
    case "tree":
      return (<>
        {cyl(5, 36, 0, "#8a5a34")}
        {sph(18, [0, 56, 0], "#4f9d62")}
        {sph(12, [-12, 50, 4], "#469058")}
        {sph(12, [12, 50, -4], "#58ad6e")}
      </>);
    case "palm":
      return (<>
        {cyl(4, 60, 0, "#9a6b3c")}
        {sph(9, [-12, 62, 6], "#3fae6a")}
        {sph(9, [12, 62, -6], "#359a5c")}
        {sph(9, [0, 66, 10], "#4fbe76")}
        {sph(9, [0, 64, -10], "#5cc784")}
      </>);
    case "sofa":
      return (<>
        {box(54, 16, 26, 0, "#7177b8")}
        {box(54, 18, 8, 16, "#7d83c4", [0, 0, -9])}
        {box(8, 14, 26, 16, "#6166a6", [-23, 0, 0])}
        {box(8, 14, 26, 16, "#6166a6", [23, 0, 0])}
      </>);
    case "chair":
      return (<>
        {box(22, 14, 22, 0, "#c2724a")}
        {box(22, 22, 5, 14, "#b5654a", [0, 0, -9])}
      </>);
    case "bed":
      return (<>
        {box(56, 14, 38, 0, "#a9647f")}
        {box(54, 6, 34, 14, "#e7b3c8")}
        {box(18, 9, 28, 16, "#ffffff", [-16, 0, 0])}
        {box(8, 26, 38, 0, "#8f5772", [-28, 0, 0])}
      </>);
    case "table":
      return (<>
        {[[-22, -14], [22, -14], [-22, 14], [22, 14]].map((p, i) => (
          <group key={i}>{box(4, 30, 4, 0, "#8a6038", [p[0], 0, p[1]])}</group>
        ))}
        {box(54, 5, 36, 30, "#caa46e")}
      </>);
    case "lamp":
      return (<>
        {cyl(8, 3, 0, "#6a5c40")}
        {cyl(1.5, 26, 3, "#8a7a5a")}
        {cyl(11, 12, 28, "#ffd98a", [0, 0, 0], "#ffcf6a")}
      </>);
    case "floorlamp":
      return (<>
        {cyl(8, 3, 0, "#6a5c40")}
        {cyl(1.5, 54, 3, "#7a6c50")}
        <mesh castShadow position={[0, 60, 0]}>
          <coneGeometry args={[10, 14, 20]} />
          {M("#ffe2a0", "#ffd98a")}
        </mesh>
      </>);
    case "tv":
      return (<>
        {box(40, 8, 18, 0, "#3a3a48")}
        {box(46, 28, 6, 8, "#23232e", [0, 0, -2])}
        {box(40, 22, 1, 16, "#5bc8e0", [0, 0, 1.5], "#3aa8c8")}
      </>);
    case "painting":
      return (<>
        {box(6, 8, 22, 0, "#8a6038")}
        {box(34, 26, 4, 28, "#caa46e")}
        {box(28, 20, 1, 31, "#7fb5d8", [0, 0, 2.5])}
      </>);
    case "bookshelf":
      return (<>
        {box(40, 80, 22, 0, "#8a5e3a")}
        {[20, 44].map((y) => <group key={y}>{box(34, 3, 18, y, "#6a4628")}</group>)}
        {[["#d85a5a", -10], ["#5a9ad8", -3], ["#5ad88a", 4], ["#d8c25a", 11]].map((b, i) => (
          <group key={i}>{box(4, 14, 14, 23, b[0] as string, [b[1] as number, 0, 0])}</group>
        ))}
      </>);
    case "window":
      return (<>
        {box(40, 64, 6, 0, "#7a5230")}
        {box(34, 56, 2, 4, "#8fd0ec", [0, 0, 2], "#2a7a9a")}
        {box(3, 56, 3, 4, "#7a5230", [0, 0, 2.5])}
        {box(34, 3, 3, 30, "#7a5230", [0, 0, 2.5])}
      </>);
    case "cushion":
      return <>{box(34, 12, 28, 0, "#e08a6a")}</>;
    case "candle":
      return (<>
        {cyl(5, 18, 0, "#f0e6d2")}
        <mesh position={[0, 22, 0]}>
          <coneGeometry args={[2.5, 7, 10]} />
          {M("#ffb13a", "#ff9a2a", 1.4)}
        </mesh>
      </>);
    case "lantern":
      return (<>
        {box(20, 26, 20, 0, "#d8632e")}
        {box(13, 16, 13, 5, "#ffd07a", [0, 0, 0], "#ffcf6a")}
      </>);
    case "fountain":
      return (<>
        {cyl(22, 8, 0, "#8fb6cc")}
        {cyl(18, 4, 8, "#bfe6f4", [0, 0, 0], "#5a9ac8")}
        {cyl(4, 18, 8, "#cfd6da")}
        {sph(6, [0, 30, 0], "#bfe6f4", "#5a9ac8")}
      </>);
    case "speaker":
      return (<>
        {box(26, 56, 22, 0, "#2a2a34")}
        <mesh position={[0, 26, 11.2]}><cylinderGeometry args={[8, 8, 2, 20]} /><meshStandardMaterial color="#43434f" /></mesh>
        <mesh position={[0, 44, 11.2]}><cylinderGeometry args={[4, 4, 2, 16]} /><meshStandardMaterial color="#43434f" /></mesh>
      </>);
    case "piano":
      return (<>
        {box(44, 26, 26, 0, "#26262e")}
        {box(40, 3, 12, 26, "#ffffff", [0, 0, 8])}
      </>);
    case "guitar":
      return (<>
        <mesh castShadow position={[0, 22, 0]} scale={[1, 1, 0.4]}>
          <sphereGeometry args={[15, 20, 20]} />{M("#c66a2e")}
        </mesh>
        {box(5, 36, 4, 30, "#7a4a28")}
      </>);
    case "drum":
      return <>{cyl(18, 22, 0, "#e0e6ea")}</>;
    case "mic":
      return (<>
        {box(14, 3, 14, 0, "#3a3a46")}
        {cyl(1.5, 36, 3, "#8a8a96")}
        {sph(7, [0, 44, 0], "#4a4a58")}
      </>);
    case "disco":
      return (<>
        {cyl(0.8, 10, 44, "#888")}
        {sph(13, [0, 32, 0], "#9fb6c8", "#6a8aa0")}
      </>);
    case "crystal":
      return (
        <mesh castShadow position={[0, 26, 0]}>
          <octahedronGeometry args={[18, 0]} />
          {M("#7fcfe0", "#3a8a9a", 0.3)}
        </mesh>
      );
    case "star":
      return (
        <mesh castShadow position={[0, 26, 0]} rotation={[0, 0, 0.2]}>
          <octahedronGeometry args={[16, 0]} />
          {M("#ffd23a", "#ffb000", 0.6)}
        </mesh>
      );
    case "balloon":
      return (<>
        <mesh castShadow position={[0, 40, 0]} scale={[1, 1.15, 1]}>
          <sphereGeometry args={[15, 20, 20]} />{M("#ff6ea0")}
        </mesh>
        {cyl(0.4, 26, 0, "#cfcfe0")}
      </>);
    case "building":
      return (<>
        {box(40, 90, 36, 0, "#3f4670")}
        {[20, 40, 60].map((y) =>
          [-12, 0, 12].map((x) => (
            <mesh key={`${y}-${x}`} position={[x, y, 18.2]}>
              <boxGeometry args={[7, 9, 0.6]} />
              {M((y + x) % 3 ? "#ffd98a" : "#5a6090", (y + x) % 3 ? "#ffcf6a" : undefined, 0.5)}
            </mesh>
          ))
        )}
      </>);
    case "neon":
      return (<>
        {box(40, 30, 8, 14, "#16161e")}
        {box(40, 8, 10, 0, "#2a2a3a")}
        {box(20, 4, 1, 30, "#ff5ea0", [-4, 0, 4], "#ff5ea0")}
        {box(4, 16, 1, 22, "#46d8c5", [10, 0, 4], "#46d8c5")}
      </>);
    case "column":
      return (<>
        {box(30, 6, 22, 0, "#d8cba0")}
        {cyl(9, 54, 6, "#e6dcbe")}
        {box(30, 6, 22, 60, "#d8cba0")}
      </>);
    case "cocktail":
      return (<>
        {cyl(8, 3, 0, "#cfd6da")}
        {cyl(1.5, 16, 3, "#cfd6da")}
        <mesh castShadow position={[0, 26, 0]}>
          <coneGeometry args={[11, 14, 18]} />{M("#ff8fb0", undefined, 0)}
        </mesh>
      </>);
    case "vinyl":
      return (<>
        {cyl(20, 2, 0, "#1a1a1a")}
        {cyl(6, 2.4, 0, "#d85a5a")}
      </>);
    case "arcade":
      return (<>
        {box(28, 60, 24, 0, "#d8484f")}
        {box(22, 16, 2, 38, "#5bc8e0", [0, 0, 11], "#3aa8c8")}
        {box(24, 6, 6, 30, "#2a2a3a", [0, 0, 11])}
      </>);
    case "treadmill":
      return (<>
        {box(40, 8, 26, 0, "#2a2d35")}
        {box(30, 2, 22, 8, "#16181e")}
        {box(5, 30, 4, 8, "#3a3f48", [-11, 0, -9])}
        {box(5, 30, 4, 8, "#3a3f48", [11, 0, -9])}
        {box(26, 6, 4, 38, "#43434f", [0, 0, -9], "#2a2d35")}
      </>);
    case "dumbbell":
      return (<>
        {box(10, 14, 14, 0, "#33363f", [-9, 0, 0])}
        {box(10, 14, 14, 0, "#33363f", [9, 0, 0])}
        {cyl(2.5, 14, 5, "#9aa0b5")}
      </>);
    case "bench":
      return (<>
        {box(44, 5, 16, 14, "#8a5e3a")}
        {box(44, 16, 4, 14, "#7a5230", [0, 0, -6])}
        {box(4, 14, 14, 0, "#6a4628", [-18, 0, 0])}
        {box(4, 14, 14, 0, "#6a4628", [18, 0, 0])}
      </>);
    case "locker":
      return (<>
        {box(34, 72, 22, 0, "#46505e")}
        {box(15, 70, 1, 1, "#3a424e", [-8, 0, 11.2])}
        {box(15, 70, 1, 1, "#3a424e", [8, 0, 11.2])}
      </>);
    case "mirror":
      return (<>
        {box(38, 72, 4, 0, "#7a5230")}
        {box(30, 64, 1, 4, "#cdd8e0", [0, 0, 2.5], "#90a0b0")}
      </>);
    case "desk":
      return (<>
        {box(54, 5, 30, 32, "#6e5234")}
        {box(50, 24, 4, 6, "#5a4228", [0, 0, -12])}
        {box(4, 32, 28, 0, "#5a4228", [-23, 0, 0])}
        {box(4, 32, 28, 0, "#5a4228", [23, 0, 0])}
      </>);
    case "globe":
      return (<>
        {cyl(4, 14, 0, "#5a4632")}
        {sph(11, [0, 26, 0], "#5aa0c8")}
        <mesh position={[0, 26, 0]} rotation={[0.3, 0, 0.3]}><torusGeometry args={[12, 0.8, 8, 24]} /><meshStandardMaterial color="#caa46e" /></mesh>
      </>);
    case "streetlamp":
      return (<>
        {cyl(2.5, 62, 0, "#3a3f48")}
        {box(20, 3, 4, 62, "#3a3f48", [6, 0, 0])}
        {sph(5, [12, 60, 0], "#ffe6a0", "#ffcf6a")}
      </>);
    case "bicycle":
      return (<>
        <mesh position={[-13, 14, 0]} rotation={[0, 0, 0]}><torusGeometry args={[12, 1.6, 8, 24]} /><meshStandardMaterial color="#2a2d35" /></mesh>
        <mesh position={[13, 14, 0]}><torusGeometry args={[12, 1.6, 8, 24]} /><meshStandardMaterial color="#2a2d35" /></mesh>
        {box(26, 3, 3, 16, "#d8484f")}
        {box(3, 14, 3, 16, "#d8484f", [-6, 0, 0])}
        {box(10, 3, 3, 28, "#33363f", [-13, 0, 0])}
      </>);
    case "tent":
      return (<>
        <mesh castShadow position={[0, 22, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[26, 40, 4]} /><meshStandardMaterial color="#d8632e" roughness={0.85} /></mesh>
        <mesh position={[0, 12, 19]}><coneGeometry args={[8, 22, 3]} /><meshStandardMaterial color="#7a3818" /></mesh>
      </>);
    case "planeseat":
      return (<>
        {box(28, 8, 26, 10, "#3a4150")}
        {box(28, 28, 5, 10, "#46505e", [0, 0, -10])}
        {box(4, 12, 24, 16, "#2e3440", [-13, 0, 0])}
        {box(4, 12, 24, 16, "#2e3440", [13, 0, 0])}
      </>);
    case "cloud":
      return (<>
        {sph(13, [0, 46, 0], "#ffffff")}
        {sph(10, [-13, 42, 2], "#f0f4f8")}
        {sph(10, [13, 42, -2], "#f0f4f8")}
        {sph(8, [0, 40, 10], "#ffffff")}
      </>);
    case "car":
      return (<>
        {box(50, 14, 24, 7, "#d8484f")}
        {box(30, 13, 21, 19, "#c44a50", [2, 0, 0])}
        {box(26, 9, 22, 20, "#8fd0ec", [2, 0, 0], "#2a7a9a")}
        {cyl(6, 5, 0, "#16161a", [-15, 2.5, 12])}
        {cyl(6, 5, 0, "#16161a", [15, 2.5, 12])}
        {sph(3, [25, 12, 10], "#ffe6a0", "#ffcf6a")}
      </>);
    case "counter":
      return (<>
        {box(64, 30, 26, 0, "#5a4632")}
        {box(70, 5, 30, 30, "#7a5234")}
        {box(60, 2, 1, 14, "#caa46e", [0, 0, 13.5])}
      </>);
    default:
      return box(20, 24, 20, 0, "#9aa0b5");
  }
}
