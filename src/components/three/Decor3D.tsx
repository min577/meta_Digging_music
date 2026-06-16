"use client";

import type { DecorKind } from "@/components/DecorSprite";

// DecorKind를 로우폴리 3D 메시로. 바닥 y=0 기준, 높이는 아바타(~58)와 어울리게.
export default function Decor3D({ kind }: { kind: DecorKind }) {
  return <group>{render(kind)}</group>;
}

const M = (color: string, emissive?: string, ei = 0.6) => (
  <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissive ? ei : 0} />
);

function box(w: number, h: number, d: number, y: number, color: string, pos: [number, number, number] = [0, 0, 0], em?: string) {
  return (
    <mesh castShadow position={[pos[0], y + h / 2, pos[2]]}>
      <boxGeometry args={[w, h, d]} />
      {M(color, em)}
    </mesh>
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
    default:
      return box(20, 24, 20, 0, "#9aa0b5");
  }
}
