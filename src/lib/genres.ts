// 장르 정의 — 캐릭터 외형, 무드 색, 취향 벡터의 차원이 모두 여기서 파생된다.
// 기획서 4.3: Jazz→중절모/세피아, City Pop→네온/선글라스, Lo-fi→후드/빗방울, Metal→가죽자켓/번개

// MZ(20대) 실청취 기준 8장르
export type GenreId =
  | "kpop"
  | "hiphop"
  | "rnb"
  | "ballad"
  | "indie"
  | "pop"
  | "edm"
  | "citypop";

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
  kpop: {
    id: "kpop",
    label: "K-팝",
    emoji: "💖",
    color: "#FF5FA2",
    bg: ["#3d1f3a", "#e0568f"],
    look: "글리터 · 응원봉",
    bpm: 124,
  },
  hiphop: {
    id: "hiphop",
    label: "힙합",
    emoji: "🎤",
    color: "#F0A93A",
    bg: ["#241c12", "#8a5a1e"],
    look: "스냅백 · 골드체인",
    bpm: 90,
  },
  rnb: {
    id: "rnb",
    label: "R&B",
    emoji: "🍸",
    color: "#B07CC6",
    bg: ["#2d1b3d", "#6b4a82"],
    look: "실키 · 무드등",
    bpm: 92,
  },
  ballad: {
    id: "ballad",
    label: "발라드",
    emoji: "🎙️",
    color: "#6C8AE4",
    bg: ["#22304d", "#4a5a86"],
    look: "스탠드 마이크 · 스포트라이트",
    bpm: 70,
  },
  indie: {
    id: "indie",
    label: "인디",
    emoji: "🎸",
    color: "#5BB073",
    bg: ["#1f3a2a", "#3f7a52"],
    look: "어쿠스틱 · 카디건",
    bpm: 104,
  },
  pop: {
    id: "pop",
    label: "팝",
    emoji: "✨",
    color: "#FF8A5B",
    bg: ["#3a2030", "#d65a6e"],
    look: "팝 컬러 · 헤드폰",
    bpm: 118,
  },
  edm: {
    id: "edm",
    label: "EDM",
    emoji: "🔊",
    color: "#46D8C5",
    bg: ["#10303a", "#1f7a72"],
    look: "디스코볼 · 형광",
    bpm: 128,
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
};

export const GENRE_LIST: Genre[] = Object.values(GENRES);

// 안전 접근자 — 구버전/알 수 없는 id면 pop으로 폴백 (런타임 크래시 방지)
export function genre(id: string): Genre {
  return GENRES[id as GenreId] ?? GENRES.pop;
}

// 구버전 장르 id → 신 장르 id 매핑 (localStorage 마이그레이션)
export const LEGACY_GENRE: Record<string, GenreId> = {
  jazz: "rnb",
  lofi: "indie",
  classical: "ballad",
  metal: "hiphop",
  house: "edm",
};

/** 임의 문자열을 유효 GenreId로 정규화 (구버전 데이터 방어) */
export function normalizeGenre(g: string): GenreId {
  if (GENRES[g as GenreId]) return g as GenreId;
  return LEGACY_GENRE[g] ?? "pop";
}
