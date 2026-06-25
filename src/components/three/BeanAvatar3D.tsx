"use client";

import { Outlines, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";
import type { Appearance, FaceStyle, HatStyle, GlassesStyle } from "@/lib/appearance";

// 디깅타운 마스코트 — 후드 온지를 입은 캐릭터(디자인 가이드).
// 발끝 y=0, 키 ~62. 정면 = +Z (부모가 heading으로 회전).
// 색: outfit=후드(본체), lighten(outfit)=배 패치, pants=목도리, hairColor=앞머리.

const OUT = "#2b211a";

export default function BeanAvatar3D({ a }: { a: Appearance }) {
  const body = a.outfit || "#7B5EE6";
  const belly = tone(body, 26);
  const foot = tone(body, -34);
  const ear = tone(body, -8);
  const hoodInner = tone(body, -16);
  const hair = a.hairColor || "#2A251D";
  const scarf = a.pants || "none";

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
      {[-15.5, 15.5].map((x, i) => (
        <mesh key={x} position={[x, 22, 1]} rotation={[0, 0, i ? -0.2 : 0.2]} castShadow>
          <sphereGeometry args={[5, 18, 18]} />
          <meshStandardMaterial color={tone(body, -12)} roughness={0.58} />
          <Outlines thickness={2.2} color={OUT} />
        </mesh>
      ))}

      {/* 온지 본체(하단) */}
      <mesh position={[0, 23, 0]} scale={[1, 1.14, 1]} castShadow>
        <sphereGeometry args={[16.5, 36, 36]} />
        <meshStandardMaterial color={body} roughness={0.55} />
        <Outlines thickness={3} color={OUT} />
      </mesh>

      {/* 배 패치 (앞면 투톤) */}
      <mesh position={[0, 19, 14.6]} rotation={[-0.12, 0, 0]}>
        <circleGeometry args={[7.4, 30]} />
        <meshStandardMaterial color={belly} roughness={0.6} />
      </mesh>

      {/* 후드(머리 셸) */}
      <mesh position={[0, 44, -1]} scale={[1.04, 1.04, 1.02]} castShadow>
        <sphereGeometry args={[17.5, 38, 38]} />
        <meshStandardMaterial color={body} roughness={0.55} />
        <Outlines thickness={3} color={OUT} />
      </mesh>

      {/* 후드 양옆 귀(퍼프) */}
      {[-16.5, 16.5].map((x) => (
        <mesh key={x} position={[x, 45, -1]} castShadow>
          <sphereGeometry args={[6.6, 22, 22]} />
          <meshStandardMaterial color={ear} roughness={0.58} />
          <Outlines thickness={2.2} color={OUT} />
        </mesh>
      ))}

      {/* 후드 안감 림 (살짝 어둡게) */}
      <mesh position={[0, 43, 7]} scale={[1.04, 1.1, 0.55]}>
        <sphereGeometry args={[14.4, 30, 30]} />
        <meshStandardMaterial color={hoodInner} roughness={0.6} />
      </mesh>

      {/* 얼굴 (크림) */}
      <mesh position={[0, 43, 8]} scale={[1.02, 1.06, 0.92]} castShadow>
        <sphereGeometry args={[13.6, 32, 32]} />
        <meshStandardMaterial color="#F8E2C5" roughness={0.6} />
      </mesh>

      {/* 앞머리 (다크 마운드) — 얼굴 상단 풍성하게 */}
      <mesh position={[0, 48, 6.5]} rotation={[0.16, 0, 0]} scale={[1.05, 1.02, 1.04]}>
        <sphereGeometry args={[14.2, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color={hair} roughness={0.65} />
        <Outlines thickness={1.8} color={OUT} />
      </mesh>

      {/* 림 하이라이트 (좌상단 부드러운 광) */}
      <mesh position={[-8, 50, 9]} scale={[1.2, 1.6, 0.4]}>
        <sphereGeometry args={[4, 18, 18]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.14} roughness={1} depthWrite={false} />
      </mesh>

      {/* 목도리 (선택) — 'none'이면 미표시 */}
      {scarf !== "none" && (
        <mesh position={[0, 30, 2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[12.6, 2.3, 14, 36]} />
          <meshStandardMaterial color={scarf} roughness={0.7} />
          <Outlines thickness={1.8} color={OUT} />
        </mesh>
      )}

      {/* 볼터치 */}
      {[-9.5, 9.5].map((x) => (
        <mesh key={x} position={[x, 40, 15]}>
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshStandardMaterial color="#ff9bb0" transparent opacity={0.5} roughness={1} depthWrite={false} />
        </mesh>
      ))}

      {/* 얼굴 (표정) — 후드 얼굴 위치로 이동 */}
      <group position={[0, 7, 3]}>
        <Face3D face={a.face} eyeMat={eyeMat} />
      </group>

      {/* 안경 (상점 악세서리) */}
      <group position={[0, 7, 3]}>
        <Glasses3D kind={a.glasses} />
      </group>
      {/* 모자 (상점 악세서리) — 후드 위 */}
      <group position={[0, 9, 0]}>
        <Hat3D kind={a.hat} accent={hair} />
      </group>
    </group>
  );
}

// 눈 앞(z≈16, y≈36) 안경
function Glasses3D({ kind }: { kind: GlassesStyle }) {
  if (!kind || kind === "none") return null;
  if (kind === "round")
    return (
      <group>
        {[-6.4, 6.4].map((x) => (
          <mesh key={x} position={[x, 36, 15.4]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.4, 0.5, 8, 18]} />
            <meshStandardMaterial color="#3a2d20" />
          </mesh>
        ))}
        <mesh position={[0, 36, 15.4]}><boxGeometry args={[5, 0.7, 0.7]} /><meshStandardMaterial color="#3a2d20" /></mesh>
      </group>
    );
  if (kind === "sun")
    return (
      <group>
        {[-6.4, 6.4].map((x) => (
          <RoundedBox key={x} args={[5.6, 4, 1.1]} radius={1} smoothness={2} position={[x, 36, 15.4]}>
            <meshStandardMaterial color="#16161e" metalness={0.3} roughness={0.4} />
          </RoundedBox>
        ))}
        <mesh position={[0, 36, 15.4]}><boxGeometry args={[4, 1, 1]} /><meshStandardMaterial color="#16161e" /></mesh>
      </group>
    );
  // star / heart — 컬러 렌즈로 표현
  const col = kind === "heart" ? "#ff6ec7" : "#ffd23a";
  return (
    <group>
      {[-6.4, 6.4].map((x) => (
        <RoundedBox key={x} args={[5.4, 4.4, 1]} radius={1.6} smoothness={3} position={[x, 36, 15.4]}>
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} toneMapped={false} />
        </RoundedBox>
      ))}
    </group>
  );
}

// 본체 상단(y≈52) 모자
function Hat3D({ kind, accent }: { kind: HatStyle; accent: string }) {
  switch (kind) {
    case "cap":
      return (
        <group position={[0, 52, 0]}>
          <mesh castShadow><sphereGeometry args={[13, 22, 22, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#ff5a5f" roughness={0.7} /><Outlines thickness={2} color={OUT} /></mesh>
          <mesh castShadow position={[0, 0, 12]} rotation={[-0.32, 0, 0]}><RoundedBox args={[15, 1.6, 10]} radius={0.8} smoothness={2}><meshStandardMaterial color="#e0494e" /></RoundedBox></mesh>
        </group>
      );
    case "beanie":
      return (
        <group position={[0, 52, 0]}>
          <mesh castShadow><sphereGeometry args={[13.6, 22, 22, 0, Math.PI * 2, 0, Math.PI / 1.7]} /><meshStandardMaterial color="#46d8c5" roughness={0.85} /><Outlines thickness={2} color={OUT} /></mesh>
          <mesh position={[0, 9, 0]}><sphereGeometry args={[2.6, 14, 14]} /><meshStandardMaterial color="#eafffb" /></mesh>
        </group>
      );
    case "headphones":
      return (
        <group position={[0, 44, 0]}>
          <mesh position={[0, 10, 0]}><torusGeometry args={[14.5, 1.8, 12, 28, Math.PI]} /><meshStandardMaterial color="#C99A2E" metalness={0.3} roughness={0.5} /></mesh>
          {[-14.5, 14.5].map((x) => (
            <RoundedBox key={x} args={[4.5, 8, 8]} radius={2} smoothness={2} position={[x, 2, 0]}><meshStandardMaterial color="#F2C14E" metalness={0.3} roughness={0.45} /></RoundedBox>
          ))}
        </group>
      );
    case "fedora":
      return (
        <group position={[0, 53, 0]}>
          <mesh castShadow><cylinderGeometry args={[8.5, 8.5, 9, 22]} /><meshStandardMaterial color="#5a4632" /><Outlines thickness={2} color={OUT} /></mesh>
          <mesh castShadow position={[0, -4, 0]}><cylinderGeometry args={[15, 15, 1.6, 26]} /><meshStandardMaterial color="#4a3a2a" /></mesh>
          <mesh position={[0, -1.5, 0]}><cylinderGeometry args={[8.7, 8.7, 2.4, 22]} /><meshStandardMaterial color="#33271b" /></mesh>
        </group>
      );
    case "flower":
      return (
        <group position={[10, 50, 7]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 3, Math.sin((i / 5) * Math.PI * 2) * 3, 0]}>
              <sphereGeometry args={[2.2, 10, 10]} /><meshStandardMaterial color="#ff6ec7" />
            </mesh>
          ))}
          <mesh><sphereGeometry args={[2, 10, 10]} /><meshStandardMaterial color="#ffd23a" /></mesh>
        </group>
      );
    case "crown":
      return (
        <group position={[0, 53, 0]}>
          {[-9, -4.5, 0, 4.5, 9].map((x, i) => (
            <mesh key={i} castShadow position={[x, 2 + (i === 2 ? 2 : 0), 0]}>
              <coneGeometry args={[2.4, 7, 4]} /><meshStandardMaterial color="#ffd23a" emissive="#ffd23a" emissiveIntensity={0.2} />
            </mesh>
          ))}
          <mesh position={[0, -1, 0]}><cylinderGeometry args={[9, 9, 3, 20]} /><meshStandardMaterial color="#ffd23a" emissive="#e6ad17" emissiveIntensity={0.15} /><Outlines thickness={1.6} color={OUT} /></mesh>
        </group>
      );
    case "party":
      return (
        <group position={[0, 54, 0]}>
          <mesh castShadow><coneGeometry args={[7, 18, 20]} /><meshStandardMaterial color={accent} roughness={0.5} /><Outlines thickness={2} color={OUT} /></mesh>
          <mesh position={[0, 10, 0]}><sphereGeometry args={[2.4, 14, 14]} /><meshStandardMaterial color="#ffd23a" emissive="#ffd23a" emissiveIntensity={0.4} /></mesh>
        </group>
      );
    default:
      return null;
  }
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
