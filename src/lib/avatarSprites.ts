// 아바타 스프라이트 프리셋 레지스트리.
// 실제 이미지는 /public/avatars/avNN.webp (gitignore — 배포 전 라이선스/오리지널 아트로 교체).

// 사용 가능한 스프라이트 id 목록 (public/avatars/av01.webp ... av44.webp)
export const AVATAR_SPRITES: string[] = Array.from({ length: 44 }, (_, i) =>
  `av${String(i + 1).padStart(2, "0")}`
);

export function spriteUrl(id: string): string {
  return `/avatars/${id}.webp`;
}

export function isSpriteId(id?: string | null): id is string {
  return !!id && AVATAR_SPRITES.includes(id);
}

// 핸들(닉네임) 기반 결정적 스프라이트 선택 — NPC/다른 유저용
export function spriteFromSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_SPRITES[h % AVATAR_SPRITES.length];
}
