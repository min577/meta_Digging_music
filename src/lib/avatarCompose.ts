// 캐릭터 조합 합성 — 베이스(group16) 후드를 몸색으로, 앞머리를 헤어색으로 리컬러하고
// 악세서리 투명 오버레이를 얹어 하나의 PNG dataURL로 굽는다(브라우저 캔버스 전용).
// 결과 dataURL을 appearance.preset 에 저장하면 2D 맵/3D 룸/아바타가 그대로 사용한다.

import { ACCESSORIES, type AvatarParts } from "./avatarParts";

const CW = 160;
const CH = 170;
const BASE_SRC = "/characters/group16.png";

const urlCache = new Map<string, string>();
const imgCache = new Map<string, HTMLImageElement>();

function loadImg(src: string): Promise<HTMLImageElement> {
  const hit = imgCache.get(src);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      imgCache.set(src, im);
      resolve(im);
    };
    im.onerror = reject;
    im.src = src;
  });
}

function hex(h: string): [number, number, number] {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// 베이스 픽셀 분류 후 리컬러 (PIL 프로토타입과 동일 규칙)
function recolor(d: Uint8ClampedArray, body: string, hair: string) {
  const [br, bg, bb] = hex(body);
  const [hr, hg, hb] = hex(hair);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
    if (a < 20) continue;
    const lum = r * 0.3 + g * 0.59 + b * 0.11;
    const neutral = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 24;
    const warm = r - b > 14;
    if (neutral && lum < 70) {
      // 외곽선/눈 — 보존
    } else if (neutral) {
      const f = Math.min(1.35, lum / 132); // 후드 = 몸색 (음영 유지)
      d[i] = Math.min(255, br * f);
      d[i + 1] = Math.min(255, bg * f);
      d[i + 2] = Math.min(255, bb * f);
    } else if (warm && lum < 172) {
      const f = Math.min(1.4, lum / 96); // 앞머리 = 헤어색
      d[i] = Math.min(255, hr * f);
      d[i + 1] = Math.min(255, hg * f);
      d[i + 2] = Math.min(255, hb * f);
    }
    // 그 외(피부 등) 보존
  }
}

// 투명 여백 트림 → 프리셋 PNG처럼 타이트한 프레이밍
function trim(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0, found = false;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] > 12) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return canvas;
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")!.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
  return out;
}

export function partsKey(p: AvatarParts): string {
  return `${p.body}|${p.hair}|${p.acc}`;
}

/** 이미 합성된 dataURL이 있으면 동기 반환 (없으면 undefined) */
export function composedFromCache(p: AvatarParts): string | undefined {
  return urlCache.get(partsKey(p));
}

/** 파츠 → 합성 PNG dataURL (캐시) */
export async function composeAvatar(p: AvatarParts): Promise<string> {
  const key = partsKey(p);
  const hit = urlCache.get(key);
  if (hit) return hit;

  const base = await loadImg(BASE_SRC);
  const canvas = document.createElement("canvas");
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d")!;

  const bx = Math.round((CW - base.width) / 2);
  const by = CH - base.height; // 바닥 고정
  ctx.drawImage(base, bx, by);

  const img = ctx.getImageData(0, 0, CW, CH);
  recolor(img.data, p.body, p.hair);
  ctx.putImageData(img, 0, 0);

  const acc = ACCESSORIES.find((a) => a.id === p.acc);
  if (acc?.src) {
    const ov = await loadImg(acc.src);
    ctx.drawImage(ov, 0, 0); // 오버레이는 동일 160x170 정합
  }

  const url = trim(canvas).toDataURL("image/png");
  urlCache.set(key, url);
  return url;
}
