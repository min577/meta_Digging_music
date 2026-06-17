"use client";

import { RoundedBox, Outlines } from "@react-three/drei";
import type { Appearance } from "@/lib/appearance";

const OUT = "#2e241c";
function dark(hex: string, a = 34) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - a), g = Math.max(0, ((n >> 8) & 0xff) - a), b = Math.max(0, (n & 0xff) - a);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// 동물의 숲풍 큰머리 라운드 캐릭터 + 툰 외곽선. 발끝 y=0, 키 ~62. 부모가 이동/회전.
export default function Avatar3D({ a }: { a: Appearance }) {
  const skinMat = <meshStandardMaterial color={a.skin} roughness={0.7} />;
  return (
    <group>
      {/* 신발 */}
      {[-5.5, 5.5].map((x) => (
        <RoundedBox key={x} args={[7, 5, 10]} radius={2} smoothness={3} castShadow position={[x, 2.6, 1.5]}>
          <meshStandardMaterial color={dark(a.pants, 50)} roughness={0.8} />
          <Outlines thickness={2} color={OUT} />
        </RoundedBox>
      ))}

      {/* 몸통 (둥근 사다리꼴 느낌) */}
      <RoundedBox args={[20, 24, 16]} radius={6} smoothness={4} castShadow position={[0, 17, 0]}>
        <meshStandardMaterial color={a.outfit} roughness={0.75} />
        <Outlines thickness={2.4} color={OUT} />
      </RoundedBox>
      {/* 바지 밑단 */}
      <RoundedBox args={[18, 8, 14]} radius={4} smoothness={3} castShadow position={[0, 7, 0]}>
        <meshStandardMaterial color={a.pants} roughness={0.8} />
      </RoundedBox>

      {/* 팔 */}
      {[[-12.5, 0.3], [12.5, -0.3]].map(([x, rz], i) => (
        <RoundedBox key={i} args={[5.5, 15, 6]} radius={2.6} smoothness={3} castShadow position={[x, 19, 0]} rotation={[0, 0, rz]}>
          <meshStandardMaterial color={a.outfit} roughness={0.75} />
          <Outlines thickness={1.8} color={OUT} />
        </RoundedBox>
      ))}

      {/* 머리 (크게) */}
      <mesh castShadow position={[0, 45, 0]}>
        <sphereGeometry args={[16, 32, 32]} />
        {skinMat}
        <Outlines thickness={2.6} color={OUT} />
      </mesh>
      {/* 투톤 얼굴 패치 (밝은 머즐) — 주민 스타일 */}
      <mesh position={[0, 43, 8]} scale={[0.92, 0.82, 0.6]}>
        <sphereGeometry args={[16, 28, 28]} />
        <meshStandardMaterial color="#f5ede1" roughness={0.7} />
      </mesh>

      {/* 볼터치 */}
      {[-9.5, 9.5].map((x) => (
        <mesh key={x} position={[x, 42, 11]}>
          <sphereGeometry args={[2.7, 14, 14]} />
          <meshStandardMaterial color="#ff9bb0" transparent opacity={0.65} />
        </mesh>
      ))}

      <Animal type={a.animal ?? "cat"} fur={a.skin} />
      {["cat", "dog", "bear", "fox", "hamster", "rabbit"].includes(a.animal ?? "cat") && (
        <mesh position={[0, 43.5, 15.4]}>
          <sphereGeometry args={[2, 12, 12]} />
          <meshStandardMaterial color="#3a2a26" />
        </mesh>
      )}
      <Face a={a} />
      <Glasses kind={a.glasses} />
      <Hair style={a.hair} color={a.hairColor} />
      <Hat kind={a.hat} />
    </group>
  );
}

// 동물 귀/주둥이/꼬리 (동물의 숲풍). 털색 = a.skin
function Animal({ type, fur }: { type: Appearance["animal"]; fur: string }) {
  const mat = <meshStandardMaterial color={fur} roughness={0.7} />;
  const inner = "#ff9bb0";
  const dk = darkc(fur, 30);
  const Tail = ({ tip }: { tip?: string }) => (
    <group position={[0, 18, -13]} rotation={[-0.7, 0, 0]}>
      <mesh castShadow><capsuleGeometry args={[4, 12, 4, 10]} /><meshStandardMaterial color={fur} /></mesh>
      {tip && <mesh position={[0, 8, 0]}><sphereGeometry args={[4.4, 12, 12]} /><meshStandardMaterial color={tip} /></mesh>}
    </group>
  );
  switch (type) {
    case "cat":
      return (
        <group>
          {[-8, 8].map((x) => (
            <group key={x} position={[x, 60, -1]} rotation={[0, 0, x < 0 ? 0.25 : -0.25]}>
              <mesh castShadow><coneGeometry args={[5, 12, 4]} />{mat}</mesh>
              <mesh position={[0, -1, 1.5]} scale={0.55}><coneGeometry args={[5, 12, 4]} /><meshStandardMaterial color={inner} /></mesh>
            </group>
          ))}
          <Tail />
        </group>
      );
    case "fox":
      return (
        <group>
          {[-8, 8].map((x) => (
            <group key={x} position={[x, 60, -1]} rotation={[0, 0, x < 0 ? 0.2 : -0.2]}>
              <mesh castShadow><coneGeometry args={[5, 13, 4]} />{mat}</mesh>
              <mesh position={[0, 4, 1]} scale={0.5}><coneGeometry args={[5, 8, 4]} /><meshStandardMaterial color="#fff" /></mesh>
            </group>
          ))}
          <Tail tip="#ffffff" />
        </group>
      );
    case "rabbit":
      return (
        <group>
          {[-6, 6].map((x) => (
            <group key={x} position={[x, 70, -1]} rotation={[0, 0, x < 0 ? 0.12 : -0.12]}>
              <mesh castShadow><capsuleGeometry args={[3.4, 16, 4, 10]} />{mat}</mesh>
              <mesh position={[0, 0, 1.6]} scale={[0.5, 0.8, 0.5]}><capsuleGeometry args={[3.4, 16, 4, 10]} /><meshStandardMaterial color={inner} /></mesh>
            </group>
          ))}
        </group>
      );
    case "bear":
      return (
        <group>
          {[-11, 11].map((x) => (
            <mesh key={x} castShadow position={[x, 59, -1]}><sphereGeometry args={[6, 16, 16]} />{mat}</mesh>
          ))}
        </group>
      );
    case "hamster":
      return (
        <group>
          {[-10, 10].map((x) => (
            <mesh key={x} castShadow position={[x, 58, 0]}><sphereGeometry args={[5, 14, 14]} /><meshStandardMaterial color={dk} /></mesh>
          ))}
        </group>
      );
    case "dog":
      return (
        <group>
          {[-13, 13].map((x) => (
            <mesh key={x} castShadow position={[x, 50, 0]} rotation={[0, 0, x < 0 ? 0.5 : -0.5]}>
              <boxGeometry args={[6, 16, 8]} />
              <meshStandardMaterial color={dk} />
            </mesh>
          ))}
          <Tail />
        </group>
      );
    case "frog":
      return (
        <group>
          {[-7, 7].map((x) => (
            <group key={x} position={[x, 60, 4]}>
              <mesh castShadow><sphereGeometry args={[6, 16, 16]} />{mat}</mesh>
              <mesh position={[0, 1, 4.5]}><sphereGeometry args={[2.6, 12, 12]} /><meshStandardMaterial color="#2a251d" /></mesh>
            </group>
          ))}
        </group>
      );
    case "bird":
      return (
        <group>
          <mesh position={[0, 43, 15]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[4, 8, 8]} /><meshStandardMaterial color="#ffb13a" /></mesh>
          <mesh castShadow position={[0, 63, -2]} rotation={[0.3, 0, 0]}><coneGeometry args={[4, 12, 6]} />{mat}</mesh>
        </group>
      );
    default:
      return null;
  }
}

function darkc(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - a), g = Math.max(0, ((n >> 8) & 0xff) - a), b = Math.max(0, (n & 0xff) - a);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function Face({ a }: { a: Appearance }) {
  const closed = a.face === "cool";
  const Eye = ({ x, wink }: { x: number; wink?: boolean }) =>
    wink ? (
      <mesh position={[x, 46, 14.2]} rotation={[0, 0, x < 0 ? -0.3 : 0.3]}>
        <boxGeometry args={[5, 1.3, 1]} />
        <meshStandardMaterial color="#2a251d" />
      </mesh>
    ) : (
      <group position={[x, 46.5, 13]}>
        <mesh scale={[0.85, 1.1, 0.7]}>
          <sphereGeometry args={[3.7, 18, 18]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.2, -0.4, 2.4]}>
          <sphereGeometry args={[2.4, 16, 16]} />
          <meshStandardMaterial color="#2a251d" />
        </mesh>
        <mesh position={[-0.7, 0.9, 3.4]}>
          <sphereGeometry args={[0.8, 10, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    );

  return (
    <group>
      {closed ? (
        <>
          <mesh position={[-5.5, 46, 14.2]}><boxGeometry args={[5, 1.3, 1]} /><meshStandardMaterial color="#2a251d" /></mesh>
          <mesh position={[5.5, 46, 14.2]}><boxGeometry args={[5, 1.3, 1]} /><meshStandardMaterial color="#2a251d" /></mesh>
        </>
      ) : (
        <>
          <Eye x={-5.5} />
          <Eye x={5.5} wink={a.face === "wink"} />
        </>
      )}
      {/* 미소 */}
      <mesh position={[0, 40.5, 14.6]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[a.face === "happy" ? 3.2 : 2.4, 0.65, 8, 18, Math.PI]} />
        <meshStandardMaterial color="#2a251d" />
      </mesh>
    </group>
  );
}

function Glasses({ kind }: { kind: Appearance["glasses"] }) {
  if (kind === "none") return null;
  if (kind === "sun")
    return (
      <group position={[0, 46.5, 15]}>
        {[-5.5, 5.5].map((x) => (
          <RoundedBox key={x} args={[6.5, 4.5, 1.2]} radius={1} smoothness={2} position={[x, 0, 0]}>
            <meshStandardMaterial color="#16161e" metalness={0.3} roughness={0.4} />
          </RoundedBox>
        ))}
        <mesh position={[0, 0, 0]}><boxGeometry args={[5, 1, 1]} /><meshStandardMaterial color="#16161e" /></mesh>
      </group>
    );
  return (
    <group position={[0, 46.5, 15]}>
      {[-5.5, 5.5].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.4, 0.5, 8, 18]} />
          <meshStandardMaterial color="#3a2d20" />
        </mesh>
      ))}
    </group>
  );
}

function Hair({ style, color }: { style: Appearance["hair"]; color: string }) {
  if (style === "bald") return null;
  const mat = <meshStandardMaterial color={color} roughness={0.7} />;
  return (
    <group>
      {/* 머리 위·뒤를 덮는 캡 */}
      <mesh castShadow position={[0, 47.5, -2]} scale={[1.02, 0.96, 1.04]}>
        <sphereGeometry args={[16.6, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        {mat}
        <Outlines thickness={2.2} color={OUT} />
      </mesh>
      {/* 옆/뒤 볼륨 */}
      <mesh castShadow position={[0, 44, -8]} scale={[1, 0.8, 0.7]}>
        <sphereGeometry args={[16.6, 24, 24]} />
        {mat}
      </mesh>

      {style === "ponytail" && (
        <mesh castShadow position={[0, 50, -16]}><capsuleGeometry args={[4.5, 14, 5, 14]} />{mat}</mesh>
      )}
      {style === "long" && (
        <RoundedBox args={[26, 28, 8]} radius={6} smoothness={3} castShadow position={[0, 38, -13]}>
          {mat}
        </RoundedBox>
      )}
      {style === "bob" && (
        <mesh castShadow position={[0, 40, -4]} scale={[1.1, 0.7, 1]}><sphereGeometry args={[16, 22, 22]} />{mat}</mesh>
      )}
      {style === "bun" && (
        <mesh castShadow position={[0, 64, -3]}><sphereGeometry args={[7, 18, 18]} />{mat}</mesh>
      )}
      {style === "spiky" &&
        [-8, -2.5, 3, 8.5].map((x, i) => (
          <mesh key={i} castShadow position={[x, 60, 1]} rotation={[0, 0, (x / 30)]}>
            <coneGeometry args={[3.8, 11, 8]} />{mat}
          </mesh>
        ))}
      {style === "curly" &&
        [[-11, 56, 4], [11, 56, 4], [0, 62, 0], [-13, 47, -3], [13, 47, -3], [0, 50, -12]].map((p, i) => (
          <mesh key={i} castShadow position={p as [number, number, number]}><sphereGeometry args={[5.5, 14, 14]} />{mat}</mesh>
        ))}
    </group>
  );
}

function Hat({ kind }: { kind: Appearance["hat"] }) {
  switch (kind) {
    case "cap":
      return (
        <group position={[0, 57, 0]}>
          <mesh castShadow><sphereGeometry args={[14, 22, 22, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#ff5a5f" roughness={0.7} /><Outlines thickness={2} color={OUT} /></mesh>
          <mesh castShadow position={[0, 0, 13]} rotation={[-0.35, 0, 0]}><RoundedBox args={[17, 1.8, 11]} radius={0.8} smoothness={2}><meshStandardMaterial color="#e0494e" /></RoundedBox></mesh>
        </group>
      );
    case "beanie":
      return (
        <mesh castShadow position={[0, 57, 0]}><sphereGeometry args={[14.5, 22, 22, 0, Math.PI * 2, 0, Math.PI / 1.7]} /><meshStandardMaterial color="#46d8c5" roughness={0.8} /><Outlines thickness={2} color={OUT} /></mesh>
      );
    case "headphones":
      return (
        <group position={[0, 47, 0]}>
          <mesh position={[0, 10, 0]}><torusGeometry args={[16, 2, 12, 28, Math.PI]} /><meshStandardMaterial color="#34495e" /></mesh>
          {[-16, 16].map((x) => (
            <RoundedBox key={x} args={[5, 9, 9]} radius={2} smoothness={2} position={[x, 1, 0]}><meshStandardMaterial color="#6c8ae4" /></RoundedBox>
          ))}
        </group>
      );
    case "fedora":
      return (
        <group position={[0, 58, 0]}>
          <mesh castShadow><cylinderGeometry args={[10, 10, 10, 22]} /><meshStandardMaterial color="#5a4632" /><Outlines thickness={2} color={OUT} /></mesh>
          <mesh castShadow position={[0, -4.5, 0]}><cylinderGeometry args={[17, 17, 1.8, 26]} /><meshStandardMaterial color="#4a3a2a" /></mesh>
        </group>
      );
    case "flower":
      return (
        <group position={[11, 54, 7]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 3, Math.sin((i / 5) * Math.PI * 2) * 3, 0]}>
              <sphereGeometry args={[2.2, 10, 10]} /><meshStandardMaterial color="#ff6ec7" />
            </mesh>
          ))}
          <mesh><sphereGeometry args={[2, 10, 10]} /><meshStandardMaterial color="#ffd23a" /></mesh>
        </group>
      );
    default:
      return null;
  }
}
