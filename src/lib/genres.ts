// 장르 정의 — 캐릭터 외형, 무드 색, 취향 벡터의 차원이 모두 여기서 파생된다.
// 기획서 4.3: Jazz→중절모/세피아, City Pop→네온/선글라스, Lo-fi→후드/빗방울, Metal→가죽자켓/번개

export type GenreId =
  | "jazz"
  | "citypop"
  | "lofi"
  | "metal"
  | "kpop"
  | "rnb"
  | "house"
  | "classical";

export interface Genre {
  id: GenreId;
  label: string; // 한국어 라벨
  emoji: string;
  /** 캐릭터 액센트 색 (tailwind 아님, 직접 hex) */
  color: string;
  /** 룸/무드 배경 그라데이션 */
  bg: [string, string];
  /** 캐릭터 외형 키워드 (UI 표시 + 이펙트 분기) */
  look: string;
  /** 대표 BPM (캐릭터 idle 애니메이션 속도) */
  bpm: number;
}

export const GENRES: Record<GenreId, Genre> = {
  jazz: {
    id: "jazz",
    label: "재즈",
    emoji: "🎷",
    color: "#8A6D3B",
    bg: ["#3a2f23", "#6b5333"],
    look: "중절모 · 세피아 톤",
    bpm: 92,
  },
  citypop: {
    id: "citypop",
    label: "시티팝",
    emoji: "🌃",
    color: "#FF6EC7",
    bg: ["#2a1f4d", "#c2479b"],
    look: "네온 · 선글라스",
    bpm: 116,
  },
  lofi: {
    id: "lofi",
    label: "로파이",
    emoji: "🌧️",
    color: "#7C83FD",
    bg: ["#23304d", "#4a5a86"],
    look: "후드 · 빗방울",
    bpm: 78,
  },
  metal: {
    id: "metal",
    label: "메탈",
    emoji: "🤘",
    color: "#9aa0b5",
    bg: ["#161620", "#3a3a4d"],
    look: "가죽자켓 · 번개",
    bpm: 150,
  },
  kpop: {
    id: "kpop",
    label: "K-팝",
    emoji: "💖",
    color: "#FF8FB1",
    bg: ["#3d1f3a", "#d65a8e"],
    look: "글리터 · 하트 이펙트",
    bpm: 124,
  },
  rnb: {
    id: "rnb",
    label: "R&B",
    emoji: "🍷",
    color: "#B07CC6",
    bg: ["#2d1b3d", "#6b4a82"],
    look: "실키 · 보랏빛 무드",
    bpm: 88,
  },
  house: {
    id: "house",
    label: "하우스",
    emoji: "🪩",
    color: "#46D8C5",
    bg: ["#10303a", "#1f7a72"],
    look: "디스코볼 · 형광",
    bpm: 126,
  },
  classical: {
    id: "classical",
    label: "클래식",
    emoji: "🎻",
    color: "#C9A24B",
    bg: ["#2b2620", "#5e503a"],
    look: "앤틱 · 금테",
    bpm: 72,
  },
};

export const GENRE_LIST: Genre[] = Object.values(GENRES);

export function genre(id: GenreId): Genre {
  return GENRES[id];
}
