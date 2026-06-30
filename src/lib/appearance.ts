import { DEFAULT_PRESET, COSTUME_PRESETS, presetFromSeed } from "./characters";

// 아바타 페이퍼돌 외형 모델 + 선택 옵션 (동물의 숲 느낌 커스터마이징)

export type HairStyle =
  | "short"
  | "bob"
  | "long"
  | "ponytail"
  | "spiky"
  | "bun"
  | "curly"
  | "bald";

export type HatStyle = "none" | "cap" | "beanie" | "headphones" | "fedora" | "flower" | "crown" | "party";
export type FaceStyle = "smile" | "happy" | "wink" | "cool" | "cat";
export type GlassesStyle = "none" | "round" | "sun" | "star" | "heart";
export type CostumeStyle = "none" | "witch" | "plaid" | "star" | "fries";
export type AnimalType = "cat" | "rabbit" | "bear" | "dog" | "fox" | "frog" | "bird" | "hamster";

export interface Appearance {
  animal: AnimalType; // 동물 종류 (동물의 숲풍)
  skin: string; // 털색
  hair: HairStyle;
  hairColor: string;
  outfit: string; // 상의 색
  pants: string; // 하의 색
  hat: HatStyle;
  face: FaceStyle;
  glasses: GlassesStyle;
  costume?: CostumeStyle; // (구) SVG 코스튬
  /** 디자인 PNG 프리셋 파일명 (예: "group16.png") — 있으면 이 이미지를 그대로 렌더 */
  preset?: string;
}

export const COSTUMES: CostumeStyle[] = ["none", "witch", "plaid", "star", "fries"];
export const COSTUME_LABEL: Record<CostumeStyle, string> = {
  none: "없음",
  witch: "🧙 마녀",
  plaid: "🧣 체크 잠옷",
  star: "⭐ 별 잠옷",
  fries: "🍟 감자튀김",
};

export const ANIMALS: AnimalType[] = ["cat", "rabbit", "bear", "dog", "fox", "frog", "bird", "hamster"];
export const ANIMAL_LABEL: Record<AnimalType, string> = {
  cat: "🐱 고양이", rabbit: "🐰 토끼", bear: "🐻 곰", dog: "🐶 강아지",
  fox: "🦊 여우", frog: "🐸 개구리", bird: "🐤 새", hamster: "🐹 햄스터",
};

// 털색 (동물 캐릭터)
export const SKIN_TONES = [
  "#FBE2C8", "#F2C9A0", "#E0A878", "#C68642", "#8D5524",
  "#FAF4EA", "#D9D2C7", "#9aa0a6", "#E8965A", "#5a4634", "#3a332c", "#F4C6D2",
];

export const HAIR_COLORS = [
  "#2A251D", // 검정
  "#5A3A22", // 갈색
  "#B5894B", // 다크블론드
  "#E6C36B", // 금발
  "#C0392B", // 빨강
  "#6C8AE4", // 파랑
  "#FF6EC7", // 핑크
  "#9B59B6", // 보라
  "#46D8C5", // 민트
  "#E8E8E8", // 백발
];

export const HAIR_STYLES: HairStyle[] = [
  "short",
  "bob",
  "long",
  "ponytail",
  "spiky",
  "bun",
  "curly",
  "bald",
];

// 디자인 가이드 후드 컬러 (브랜드 보라 우선 = 기본값)
export const OUTFIT_COLORS = [
  "#7B5EE6", // 브랜드 보라 (기본)
  "#9A9AA0", // 그레이 (레퍼런스 베이스)
  "#E84B3C", // 레드
  "#F4571A", // 오렌지
  "#F5B731", // 옐로우
  "#2BA84A", // 그린
  "#5FB0E8", // 블루
  "#F6A6BE", // 핑크
];

export const PANTS_COLORS = ["#3E4A5E", "#6B4A2B", "#2A2A35", "#5A6B8C", "#7A7A7A"];

export const HATS: HatStyle[] = [
  "none",
  "cap",
  "beanie",
  "headphones",
  "fedora",
  "flower",
  "crown",
  "party",
];

export const HAT_LABEL: Record<HatStyle, string> = {
  none: "없음",
  cap: "🧢 캡",
  beanie: "🧶 비니",
  headphones: "🎧 헤드폰",
  fedora: "🎩 페도라",
  flower: "🌸 꽃",
  crown: "👑 왕관",
  party: "🥳 파티햇",
};

export const FACES: FaceStyle[] = ["smile", "happy", "wink", "cool", "cat"];
export const GLASSES: GlassesStyle[] = ["none", "round", "sun", "star", "heart"];

export const FACE_LABEL: Record<FaceStyle, string> = {
  smile: "😊 미소",
  happy: "😄 활짝",
  wink: "😉 윙크",
  cool: "😎 시크",
  cat: "😺 냥",
};
export const GLASSES_LABEL: Record<GlassesStyle, string> = {
  none: "없음",
  round: "🤓 동글",
  sun: "🕶️ 선글",
  star: "⭐ 별",
  heart: "💗 하트",
};

export const HAIR_LABEL: Record<HairStyle, string> = {
  short: "숏",
  bob: "단발",
  long: "롱",
  ponytail: "포니테일",
  spiky: "스파이크",
  bun: "번",
  curly: "곱슬",
  bald: "민머리",
};

export function defaultAppearance(): Appearance {
  return {
    animal: "cat",
    skin: SKIN_TONES[1],
    hair: "short",
    hairColor: HAIR_COLORS[0],
    outfit: OUTFIT_COLORS[0],
    pants: "none", // 목도리 기본 = 없음 (레퍼런스)
    hat: "none",
    face: "smile",
    glasses: "none",
    costume: "none",
    preset: DEFAULT_PRESET,
  };
}

const COSTUME_SRC: Record<string, string> = Object.fromEntries(
  COSTUME_PRESETS.map((c) => [c.id, c.src])
);

/** 아바타 이미지 소스 — 프리셋 파일명을 /characters/ 로 해석.
 *  (구 버전에서 구워진 합성 dataURL은 기본 캐릭터로 폴백) */
export function avatarSrc(a?: Appearance): string {
  if (a?.preset && !a.preset.startsWith("data:")) {
    return `/characters/${a.preset}`;
  }
  if (a?.costume && a.costume !== "none" && COSTUME_SRC[a.costume]) {
    return `/characters/${COSTUME_SRC[a.costume]}`;
  }
  return `/characters/${DEFAULT_PRESET}`;
}

// 핸들(닉네임) 기반 결정적 외형 — NPC/다른 유저용.
// 스프라이트 프리셋을 기본 배정해 마을 전체가 동일한 룩을 갖도록 한다.
export function appearanceFromSeed(seed: string): Appearance {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pick = <T,>(arr: T[], salt: number) => arr[(h + salt) % arr.length];
  return {
    animal: pick(ANIMALS, 0),
    skin: pick(SKIN_TONES, 1),
    hair: pick(HAIR_STYLES.filter((s) => s !== "bald"), 2),
    hairColor: pick(HAIR_COLORS, 3),
    outfit: pick(OUTFIT_COLORS, 5),
    pants: "none", // 깔끔한 기본 룩

    hat: pick(HATS, 11),
    face: pick(FACES, 13),
    glasses: pick([...GLASSES, "none", "none"], 17) as GlassesStyle,
    preset: presetFromSeed(seed),
  };
}
