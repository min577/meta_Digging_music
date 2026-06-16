"use client";

import type { Appearance } from "@/lib/appearance";

// 외형(피부/헤어/옷/모자)을 반영한 로우폴리 라운드 3D 캐릭터 (동물의 숲 느낌).
// 발끝이 y=0, 키 약 58. 부모가 group을 이동/회전/애니메이션한다.
export default function Avatar3D({ a }: { a: Appearance }) {
  return (
    <group>
      {/* 다리 */}
      <mesh castShadow position={[-4, 7, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 14, 12]} />
        <meshStandardMaterial color={a.pants} />
      </mesh>
      <mesh castShadow position={[4, 7, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 14, 12]} />
        <meshStandardMaterial color={a.pants} />
      </mesh>

      {/* 몸통 */}
      <mesh castShadow position={[0, 26, 0]}>
        <capsuleGeometry args={[9, 12, 6, 16]} />
        <meshStandardMaterial color={a.outfit} />
      </mesh>
      {/* 팔 */}
      <mesh castShadow position={[-10.5, 28, 0]} rotation={[0, 0, 0.25]}>
        <capsuleGeometry args={[3, 10, 4, 12]} />
        <meshStandardMaterial color={a.outfit} />
      </mesh>
      <mesh castShadow position={[10.5, 28, 0]} rotation={[0, 0, -0.25]}>
        <capsuleGeometry args={[3, 10, 4, 12]} />
        <meshStandardMaterial color={a.outfit} />
      </mesh>

      {/* 머리 */}
      <mesh castShadow position={[0, 50, 0]}>
        <sphereGeometry args={[14, 28, 28]} />
        <meshStandardMaterial color={a.skin} />
      </mesh>

      {/* 볼터치 */}
      <mesh position={[-8.5, 47, 9.5]}>
        <sphereGeometry args={[2.4, 12, 12]} />
        <meshStandardMaterial color="#ff9bb0" transparent opacity={0.6} />
      </mesh>
      <mesh position={[8.5, 47, 9.5]}>
        <sphereGeometry args={[2.4, 12, 12]} />
        <meshStandardMaterial color="#ff9bb0" transparent opacity={0.6} />
      </mesh>

      {/* 눈 */}
      <Eyes face={a.face} />
      <Glasses kind={a.glasses} />

      {/* 헤어 */}
      <Hair style={a.hair} color={a.hairColor} />

      {/* 모자 */}
      <Hat kind={a.hat} />
    </group>
  );
}

function Eyes({ face }: { face: Appearance["face"] }) {
  const eye = (x: number) => (
    <mesh position={[x, 52, 12.4]}>
      <sphereGeometry args={[1.7, 12, 12]} />
      <meshStandardMaterial color="#2a251d" />
    </mesh>
  );
  return (
    <group>
      {eye(-5)}
      {face === "wink" ? null : eye(5)}
      {/* 입 */}
      <mesh position={[0, 45.5, 12.8]} rotation={[0, 0, 0]}>
        <boxGeometry args={[5, 1, 0.6]} />
        <meshStandardMaterial color="#2a251d" />
      </mesh>
    </group>
  );
}

function Glasses({ kind }: { kind: Appearance["glasses"] }) {
  if (kind === "none") return null;
  if (kind === "sun")
    return (
      <group position={[0, 52, 13]}>
        <mesh position={[-5, 0, 0]}>
          <boxGeometry args={[6, 4, 1]} />
          <meshStandardMaterial color="#16161e" />
        </mesh>
        <mesh position={[5, 0, 0]}>
          <boxGeometry args={[6, 4, 1]} />
          <meshStandardMaterial color="#16161e" />
        </mesh>
      </group>
    );
  // round / star → 링
  return (
    <group position={[0, 52, 13]}>
      <mesh position={[-5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.5, 8, 16]} />
        <meshStandardMaterial color="#3a2d20" />
      </mesh>
      <mesh position={[5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.5, 8, 16]} />
        <meshStandardMaterial color="#3a2d20" />
      </mesh>
    </group>
  );
}

function Hair({ style, color }: { style: Appearance["hair"]; color: string }) {
  if (style === "bald") return null;
  const mat = <meshStandardMaterial color={color} />;
  return (
    <group>
      {/* 기본 헤어 캡 (머리 위/뒤 덮음) */}
      <mesh castShadow position={[0, 53, -1.5]} scale={[1, 0.95, 1.02]}>
        <sphereGeometry args={[14.6, 24, 24]} />
        {mat}
      </mesh>
      {/* 앞을 비워 얼굴 노출 */}
      <mesh position={[0, 49, 9]} scale={[1, 1, 1]}>
        <sphereGeometry args={[13.2, 20, 20]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
      </mesh>

      {style === "ponytail" && (
        <mesh castShadow position={[0, 52, -14]}>
          <capsuleGeometry args={[4, 12, 4, 12]} />
          {mat}
        </mesh>
      )}
      {style === "long" && (
        <mesh castShadow position={[0, 40, -12]}>
          <boxGeometry args={[20, 26, 6]} />
          {mat}
        </mesh>
      )}
      {style === "bun" && (
        <mesh castShadow position={[0, 66, -2]}>
          <sphereGeometry args={[6, 16, 16]} />
          {mat}
        </mesh>
      )}
      {style === "spiky" &&
        [-7, 0, 7].map((x, i) => (
          <mesh key={i} castShadow position={[x, 64, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[3.5, 9, 8]} />
            {mat}
          </mesh>
        ))}
      {style === "curly" &&
        [
          [-10, 60, 2], [10, 60, 2], [0, 64, -2], [-12, 52, -4], [12, 52, -4],
        ].map((p, i) => (
          <mesh key={i} castShadow position={p as [number, number, number]}>
            <sphereGeometry args={[5, 14, 14]} />
            {mat}
          </mesh>
        ))}
    </group>
  );
}

function Hat({ kind }: { kind: Appearance["hat"] }) {
  switch (kind) {
    case "cap":
      return (
        <group position={[0, 60, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[12, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ff5a5f" />
          </mesh>
          <mesh castShadow position={[0, -1, 11]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[16, 1.5, 9]} />
            <meshStandardMaterial color="#e0494e" />
          </mesh>
        </group>
      );
    case "beanie":
      return (
        <mesh castShadow position={[0, 60, 0]}>
          <sphereGeometry args={[12.5, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color="#46d8c5" />
        </mesh>
      );
    case "headphones":
      return (
        <group position={[0, 52, 0]}>
          <mesh position={[0, 8, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[14, 1.6, 10, 24, Math.PI]} />
            <meshStandardMaterial color="#34495e" />
          </mesh>
          <mesh position={[-14, 0, 0]}>
            <boxGeometry args={[4, 8, 8]} />
            <meshStandardMaterial color="#6c8ae4" />
          </mesh>
          <mesh position={[14, 0, 0]}>
            <boxGeometry args={[4, 8, 8]} />
            <meshStandardMaterial color="#6c8ae4" />
          </mesh>
        </group>
      );
    case "fedora":
      return (
        <group position={[0, 61, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[9, 9, 9, 20]} />
            <meshStandardMaterial color="#5a4632" />
          </mesh>
          <mesh castShadow position={[0, -4, 0]}>
            <cylinderGeometry args={[15, 15, 1.5, 24]} />
            <meshStandardMaterial color="#4a3a2a" />
          </mesh>
        </group>
      );
    case "flower":
      return (
        <mesh castShadow position={[10, 58, 6]}>
          <sphereGeometry args={[3.5, 12, 12]} />
          <meshStandardMaterial color="#ff6ec7" />
        </mesh>
      );
    default:
      return null;
  }
}
