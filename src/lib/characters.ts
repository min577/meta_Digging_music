// 디자인 가이드의 실제 캐릭터 PNG를 프리셋으로 사용 (public/characters/*).
// SVG 근사 대신 업로드된 원본 이미지를 그대로 렌더 → 디자인과 100% 동일.

export const CHARACTER_BASE = "/characters/";

// 기본/컬러/악세서리 캐릭터 (무료 — 캐릭터 선택)
export const FREE_PRESETS: string[] = [
  "group16.png", "2222.png", "56.png", "group17.png", "group18.png", "group24.png", "group27.png",
  "23.png", "23234.png", "33.png", // 레드/오렌지/옐로우
  "2.png", "34.png", "55.png", "66.png", "group.png", "group23.png", // 헤어/헤드폰 등
  "group19.png", "group20.png", "group21.png", "group22.png", "group26.png", "group28.png", // 악세서리
  // 디자인수정 추가 베리에이션 (컬러+헤어+악세서리 조합)
  "c131.png", "c132.png", "c133.png", "c134.png", "c135.png", "c136.png", "c137.png",
  "c141.png", "c142.png", "c143.png", "c144.png", "c145.png", "c146.png", "c147.png",
];

// 상점 코스튬 (유료)
export interface CostumePreset {
  id: string;
  src: string;
  name: string;
  price: number;
}
export const COSTUME_PRESETS: CostumePreset[] = [
  { id: "witch", src: "45.png", name: "마녀", price: 420 },
  { id: "fries", src: "59.png", name: "감자튀김", price: 380 },
  { id: "star", src: "57.png", name: "별 잠옷", price: 320 },
  { id: "plaid", src: "58.png", name: "체크 잠옷", price: 300 },
];

export const DEFAULT_PRESET = "group16.png";

// 캐릭터 꾸미기 섹션 (컬러/헤어/악세서리) — 디자인 구조용 분류
export const PRESET_COLORS: string[] = [
  "group16.png", "23.png", "23234.png", "33.png", "c145.png", "c146.png", "c141.png", "c147.png",
];
export const PRESET_HAIRS: string[] = [
  "group16.png", "2.png", "group17.png", "group24.png", "group27.png", "c136.png",
];
export const PRESET_ACCESSORIES: string[] = [
  "group23.png", "34.png", "group20.png", "group21.png", "group22.png", "c143.png", "group26.png", "group19.png",
];

/** 핸들(닉네임) 기반 결정적 프리셋 — NPC/다른 유저용 */
export function presetFromSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FREE_PRESETS[h % FREE_PRESETS.length];
}
