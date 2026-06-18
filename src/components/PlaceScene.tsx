import type { PlaceId } from "@/lib/places";

// 장소별 오리지널 플랫 일러스트 (썸네일/무드카드 배경).
// viewBox 160x100, 컨테이너를 꽉 채우도록 slice. 각 장소 고유 팔레트로 "그 공간"이 보이게.
export default function PlaceScene({
  place,
  className,
}: {
  place: PlaceId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`sky-${place}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY[place][0]} />
          <stop offset="100%" stopColor={SKY[place][1]} />
        </linearGradient>
      </defs>
      <rect width="160" height="100" fill={`url(#sky-${place})`} />
      {SCENE[place]}
    </svg>
  );
}

const SKY: Record<PlaceId, [string, string]> = {
  library: ["#caa86f", "#6e4f2f"],
  hanriver: ["#22335a", "#0d1420"],
  gym: ["#252a33", "#13161c"],
  airplane: ["#bfe6f7", "#7db4e6"],
  city: ["#2a1f54", "#120c24"],
  cafe: ["#d3b083", "#7a5734"],
};

// 책 스파인 한 줄
const books = (x: number, y: number, w = 4) => {
  const cols = ["#b5524b", "#c98a3f", "#4f7a6a", "#6c7fb0", "#9a6aa0", "#caa24b"];
  return Array.from({ length: 7 }, (_, i) => (
    <rect key={i} x={x + i * (w + 0.6)} y={y - (i % 3) * 1.2} width={w} height={9 + (i % 3) * 1.2} rx="1" fill={cols[(i + x) % cols.length]} />
  ));
};

const SCENE: Record<PlaceId, React.ReactNode> = {
  // 도서관 — 따뜻한 책장 + 아치창 + 뱅커램프 글로우
  library: (
    <g>
      {/* 아치창 (가운데 빛) */}
      <g transform="translate(64,14)">
        <rect x="0" y="6" width="32" height="40" rx="2" fill="#ffe6ad" opacity="0.92" />
        <path d="M0 8 A16 16 0 0 1 32 8 Z" fill="#ffe6ad" opacity="0.92" />
        <rect x="15" y="6" width="2" height="40" fill="#7a5733" />
        <rect x="0" y="24" width="32" height="2" fill="#7a5733" />
      </g>
      {/* 책장들 */}
      {[6, 30, 108, 132].map((x) => (
        <g key={x}>
          <rect x={x} y="20" width="22" height="64" rx="2" fill="#5a3f26" />
          {[24, 38, 52, 66].map((sy) => (
            <g key={sy}>
              {books(x + 2, sy)}
              <rect x={x} y={sy + 10} width="22" height="2" fill="#48311e" />
            </g>
          ))}
        </g>
      ))}
      {/* 바닥 + 책상 + 초록 뱅커램프 */}
      <rect x="0" y="84" width="160" height="16" fill="#7a5733" />
      <rect x="58" y="78" width="44" height="6" rx="1" fill="#4a3320" />
      <rect x="72" y="70" width="16" height="9" rx="2" fill="#2f7a52" />
      <ellipse cx="80" cy="80" rx="13" ry="3" fill="#ffe6ad" opacity="0.5" />
    </g>
  ),

  // 한강 밤 — 달 + 다리 + 물 반영
  hanriver: (
    <g>
      <circle cx="128" cy="24" r="11" fill="#f3efd6" />
      <circle cx="128" cy="24" r="17" fill="#f3efd6" opacity="0.12" />
      {[20, 45, 70, 100, 150].map((x, i) => (
        <circle key={x} cx={x} cy={12 + (i % 3) * 6} r="0.9" fill="#fff" opacity="0.8" />
      ))}
      {/* 다리 */}
      <rect x="0" y="52" width="160" height="7" fill="#2c333f" />
      {[10, 38, 66, 94, 122, 150].map((x) => (
        <rect key={x} x={x} y="40" width="4" height="13" fill="#262c36" />
      ))}
      {[10, 38, 66, 94, 122, 150].map((x) => (
        <circle key={"l" + x} cx={x + 2} cy="40" r="1.8" fill="#ffe6a0" />
      ))}
      {/* 물 */}
      <rect x="0" y="59" width="160" height="41" fill="#274a64" />
      <rect x="124" y="59" width="8" height="41" fill="#f3efd6" opacity="0.18" />
      {[64, 100, 30].map((x, i) => (
        <rect key={x} x={x} y={66 + i * 9} width="22" height="1.5" rx="1" fill="#3f6c8a" opacity="0.7" />
      ))}
    </g>
  ),

  // 헬스장 — 네온 + 러닝머신 + 덤벨
  gym: (
    <g>
      <rect x="0" y="20" width="160" height="3" fill="#46D8C5" opacity="0.85" />
      <rect x="0" y="20" width="160" height="9" fill="#46D8C5" opacity="0.12" />
      {/* 러닝머신 */}
      <g transform="translate(20,52)">
        <path d="M0 26 L40 26 L52 10 L46 8 L34 22 L0 22 Z" fill="#39414f" />
        <rect x="44" y="0" width="4" height="12" rx="1" fill="#4a5360" />
        <rect x="40" y="-3" width="14" height="5" rx="1.5" fill="#5a6470" />
        <rect x="42" y="-2" width="10" height="3" rx="1" fill="#46D8C5" opacity="0.8" />
      </g>
      {/* 덤벨 */}
      <g transform="translate(104,74)">
        <rect x="0" y="2" width="22" height="3" rx="1.5" fill="#6a7280" />
        <rect x="-3" y="-2" width="6" height="11" rx="2" fill="#4a5260" />
        <rect x="19" y="-2" width="6" height="11" rx="2" fill="#4a5260" />
      </g>
      <circle cx="132" cy="34" r="9" fill="#FF6EC7" opacity="0.18" />
      <rect x="0" y="84" width="160" height="16" fill="#1b1f26" />
    </g>
  ),

  // 비행기 — 하늘 + 구름 + 창문 포트홀
  airplane: (
    <g>
      <circle cx="24" cy="20" r="13" fill="#fff" opacity="0.6" />
      {[[40, 30], [96, 18], [130, 40], [70, 60]].map(([cx, cy], i) => (
        <g key={i} opacity="0.92">
          <circle cx={cx} cy={cy} r="9" fill="#fff" />
          <circle cx={cx - 9} cy={cy + 2} r="6" fill="#fff" />
          <circle cx={cx + 9} cy={cy + 2} r="7" fill="#eef4fa" />
        </g>
      ))}
      {/* 창문 포트홀 */}
      <g transform="translate(108,40)">
        <rect x="0" y="0" width="40" height="50" rx="20" fill="#cdd6e0" />
        <rect x="5" y="5" width="30" height="40" rx="15" fill="#9fcdec" />
        <rect x="5" y="5" width="30" height="40" rx="15" fill="url(#sky-airplane)" opacity="0.5" />
        <circle cx="16" cy="20" r="6" fill="#fff" opacity="0.85" />
        <circle cx="26" cy="26" r="4" fill="#fff" opacity="0.7" />
      </g>
    </g>
  ),

  // 도시 야경 — 네온 스카이라인
  city: (
    <g>
      <circle cx="134" cy="20" r="8" fill="#f3efd6" opacity="0.85" />
      {[12, 40, 70, 120].map((x, i) => (
        <circle key={x} cx={x} cy={10 + (i % 2) * 6} r="0.9" fill="#fff" opacity="0.7" />
      ))}
      {/* 빌딩들 */}
      {[
        [4, 40, "#3d2a63"], [26, 28, "#2a1f4d"], [48, 50, "#46306e"],
        [70, 34, "#321f54"], [92, 46, "#3d2a63"], [116, 26, "#2a1f4d"], [138, 44, "#46306e"],
      ].map(([x, top, c], i) => (
        <g key={i}>
          <rect x={x as number} y={top as number} width="18" height={100 - (top as number)} fill={c as string} />
          {[0, 1, 2].map((cx) =>
            [0, 1, 2, 3].map((cy) => (
              <rect key={`${cx}-${cy}`} x={(x as number) + 2 + cx * 5.5} y={(top as number) + 4 + cy * 7} width="3" height="3.5" fill={(cx + cy) % 3 ? "#ffe39a" : "#46D8C5"} opacity="0.75" />
            ))
          )}
        </g>
      ))}
      {/* 네온 사인 */}
      <rect x="30" y="22" width="14" height="4" rx="2" fill="#FF6EC7" />
      <rect x="98" y="38" width="12" height="3.5" rx="1.5" fill="#46D8C5" />
      {/* 도로 네온 */}
      <rect x="0" y="92" width="160" height="8" fill="#160f2c" />
      <rect x="0" y="94" width="160" height="1.4" fill="#FF6EC7" opacity="0.6" />
    </g>
  ),

  // 카페 — 따뜻한 카운터 + 펜던트 조명 + 컵
  cafe: (
    <g>
      {/* 창 채광 */}
      <rect x="104" y="14" width="44" height="40" rx="3" fill="#ffe9c4" opacity="0.6" />
      <rect x="124" y="14" width="2" height="40" fill="#7a5734" />
      {/* 펜던트 조명 */}
      {[36, 70].map((x) => (
        <g key={x}>
          <rect x={x} y="6" width="1.5" height="12" fill="#4a3320" />
          <path d={`M${x - 6} 18 L${x + 7} 18 L${x + 4} 25 L${x - 3} 25 Z`} fill="#3a2a1a" />
          <ellipse cx={x + 0.7} cy="26" rx="8" ry="4" fill="#ffe6ad" opacity="0.55" />
        </g>
      ))}
      {/* 카운터 */}
      <rect x="0" y="64" width="160" height="36" fill="#5a3f26" />
      <rect x="0" y="64" width="160" height="5" fill="#6e4f30" />
      {/* 에스프레소 머신 */}
      <rect x="14" y="50" width="22" height="16" rx="2" fill="#8a6a44" />
      <rect x="18" y="54" width="6" height="6" rx="1" fill="#caa24b" />
      {/* 컵 + 김 */}
      <g transform="translate(70,54)">
        <path d="M0 4 L12 4 L11 12 L1 12 Z" fill="#f2ead9" />
        <path d="M12 5 q4 1 0 5" stroke="#f2ead9" strokeWidth="1.5" fill="none" />
        <path d="M4 0 q2 -2 0 -4 M8 0 q2 -2 0 -4" stroke="#fff" strokeWidth="1" fill="none" opacity="0.6" />
      </g>
      {/* 화분 */}
      <g transform="translate(120,52)">
        <rect x="0" y="6" width="8" height="6" rx="1" fill="#b5704a" />
        <circle cx="4" cy="4" r="5" fill="#5b7d52" />
      </g>
    </g>
  ),
};
