// 캐릭터 조합 파츠 — 컬러(몸/후드색) · 헤어(머리색) · 악세서리를 독립적으로 선택해
// 런타임 캔버스에서 합성한다(lib/avatarCompose). 기존 풀-PNG 프리셋(NPC/코스튬)과 공존.

export interface AvatarParts {
  body: string; // 후드/몸 색 (hex)
  hair: string; // 머리 색 (hex)
  acc: string; // 악세서리 id ("none" | "headphones" | ...)
}

export interface ColorOpt {
  id: string;
  hex: string;
  label: string;
}

// 컬러 = 후드/몸 색 (디자인 시안 8색)
export const BODY_COLORS: ColorOpt[] = [
  { id: "gray", hex: "#8C8F96", label: "그레이" },
  { id: "red", hex: "#E84B3C", label: "레드" },
  { id: "orange", hex: "#F4781F", label: "오렌지" },
  { id: "yellow", hex: "#F5B731", label: "옐로우" },
  { id: "green", hex: "#3FB45A", label: "그린" },
  { id: "blue", hex: "#5FB0E8", label: "블루" },
  { id: "purple", hex: "#7B5EE6", label: "퍼플" },
  { id: "pink", hex: "#F58BB6", label: "핑크" },
];

// 헤어 = 후드 밖으로 나온 앞머리 색
export const HAIR_COLORS: ColorOpt[] = [
  { id: "brown", hex: "#4A372B", label: "브라운" },
  { id: "black", hex: "#2A251D", label: "블랙" },
  { id: "blonde", hex: "#E6C36B", label: "블론드" },
  { id: "orange", hex: "#E07B3A", label: "오렌지" },
  { id: "pink", hex: "#FF6EC7", label: "핑크" },
  { id: "blue", hex: "#6C8AE4", label: "블루" },
  { id: "mint", hex: "#46D8C5", label: "민트" },
  { id: "white", hex: "#E8E8E8", label: "화이트" },
];

export interface AccessoryOpt {
  id: string;
  label: string;
  src: string | null; // 투명 오버레이 PNG (null=없음)
}

// 악세서리 = 머리 위/얼굴 오버레이 (베이스 대비 추출한 투명 레이어)
export const ACCESSORIES: AccessoryOpt[] = [
  { id: "none", label: "없음", src: null },
  { id: "headphones", label: "헤드셋", src: "/characters/layers/acc_headphones.png" },
  { id: "frog", label: "개구리", src: "/characters/layers/acc_frog.png" },
  { id: "ribbon", label: "리본", src: "/characters/layers/acc_ribbon.png" },
  { id: "antenna", label: "더듬이", src: "/characters/layers/acc_antenna.png" },
];

export function defaultParts(): AvatarParts {
  return { body: BODY_COLORS[0].hex, hair: HAIR_COLORS[0].hex, acc: "none" };
}
