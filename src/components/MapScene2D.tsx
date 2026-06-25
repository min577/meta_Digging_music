"use client";

import { useEffect, useRef } from "react";
import { GENRES, type GenreId } from "@/lib/genres";

export interface Spot {
  id: string;
  x: number;
  y: number;
  genre: GenreId;
  label: string;
  term: string;
}

export const WORLD = { w: 1600, h: 1200 };
const SPEED = 195;
const T = 40; // 타일
const PLAZA = { x: WORLD.w / 2, y: WORLD.h * 0.62 };

// 2D 탑다운 디깅 맵 (코지 픽셀풍). 캔버스 + 키보드 이동 + 스팟 근접 디깅.
export default function MapScene2D({
  bodyColor,
  accentColor,
  tasteColor,
  spots,
  onNear,
  onDig,
  onReady,
  targetRef,
}: {
  bodyColor: string;
  accentColor: string;
  /** 발밑 취향 오라 색 (대표 장르) */
  tasteColor?: string;
  spots: Spot[];
  onNear: (s: Spot | null) => void;
  onDig: (s: Spot) => void;
  onReady?: (canvas: HTMLCanvasElement) => void;
  targetRef?: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const me = useRef({ x: PLAZA.x, y: PLAZA.y + 60, dir: 1, t: 0, walking: false, bounce: 0, vx: 0, vy: 0 });
  const keys = useRef<Set<string>>(new Set());
  const joy = useRef({ active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 });
  const nearRef = useRef<Spot | null>(null);
  const cb = useRef({ onNear, onDig, spots, bodyColor, accentColor, tasteColor, targetRef });
  cb.current = { onNear, onDig, spots, bodyColor, accentColor, tasteColor, targetRef };

  useEffect(() => {
    const moveKeys = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (moveKeys.includes(k)) {
        keys.current.add(k);
        e.preventDefault();
      }
      if (k === " " || k === "spacebar") {
        e.preventDefault();
        if (nearRef.current) cb.current.onDig(nearRef.current);
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // 터치 가상 조이스틱
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const R = 52;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return; // 터치/펜만
      const r = canvas.getBoundingClientRect();
      joy.current = { active: true, id: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top, dx: 0, dy: 0 };
    };
    const onMove = (e: PointerEvent) => {
      const j = joy.current;
      if (!j.active || e.pointerId !== j.id) return;
      const r = canvas.getBoundingClientRect();
      const ddx = e.clientX - r.left - j.ox;
      const ddy = e.clientY - r.top - j.oy;
      const len = Math.hypot(ddx, ddy) || 1;
      const m = Math.min(R, len) / R;
      j.dx = (ddx / len) * m;
      j.dy = (ddy / len) * m;
    };
    const onUp = (e: PointerEvent) => {
      if (joy.current.id === e.pointerId) joy.current = { active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 };
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    fit();
    onReady?.(canvas);
    window.addEventListener("resize", fit);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fit();
      const st = me.current;
      const k = keys.current;
      let dx = 0,
        dy = 0;
      if (k.has("w") || k.has("arrowup")) dy -= 1;
      if (k.has("s") || k.has("arrowdown")) dy += 1;
      if (k.has("a") || k.has("arrowleft")) dx -= 1;
      if (k.has("d") || k.has("arrowright")) dx += 1;
      if (joy.current.active) {
        dx = joy.current.dx;
        dy = joy.current.dy;
      }
      const mag = Math.min(1, Math.hypot(dx, dy));
      // 가속/감속 스무딩 (부드러운 이동)
      const l = Math.hypot(dx, dy) || 1;
      const tvx = mag > 0.08 ? (dx / l) * SPEED * mag : 0;
      const tvy = mag > 0.08 ? (dy / l) * SPEED * mag : 0;
      const kk = Math.min(1, dt * 10);
      st.vx += (tvx - st.vx) * kk;
      st.vy += (tvy - st.vy) * kk;
      st.x = clamp(st.x + st.vx * dt, 28, WORLD.w - 28);
      st.y = clamp(st.y + st.vy * dt, 28, WORLD.h - 28);
      const sp = Math.hypot(st.vx, st.vy);
      st.walking = sp > 10;
      if (Math.abs(st.vx) > 5) st.dir = st.vx < 0 ? -1 : 1;
      st.t += dt * 9 * (sp / SPEED);
      // 트램폴린(방방이) 위에 있으면 바운스
      let onTramp = false;
      for (const [tx, ty] of TRAMPS) {
        if (Math.hypot(tx - st.x, ty - st.y) < 32) {
          onTramp = true;
          break;
        }
      }
      st.bounce = onTramp ? Math.min(1, st.bounce + dt * 4) : Math.max(0, st.bounce - dt * 3);

      let near: Spot | null = null;
      let bd = 74;
      for (const s of cb.current.spots) {
        const d = Math.hypot(s.x - st.x, s.y - st.y);
        if (d < bd) {
          bd = d;
          near = s;
        }
      }
      if (near !== nearRef.current) {
        nearRef.current = near;
        cb.current.onNear(near);
      }
      // 플레이어의 화면(px) 위치를 버튼 요소에 반영 → 아바타 머리 위에 정확히
      const tEl = cb.current.targetRef?.current;
      if (tEl) {
        const vw = canvas.width / dpr, vh = canvas.height / dpr;
        const camx = clamp(st.x - vw / 2, 0, Math.max(0, WORLD.w - vw));
        const camy = clamp(st.y - vh / 2, 0, Math.max(0, WORLD.h - vh));
        tEl.style.left = `${Math.round(st.x - camx)}px`;
        tEl.style.top = `${Math.round(st.y - camy)}px`;
      }
      draw(ctx, canvas, dpr, now, st, cb.current.spots, cb.current.bodyColor, cb.current.accentColor, cb.current.tasteColor, near, joy.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none" />;
}

// ---- 정적 장식 (시드 기반, 프레임 간 고정) ----
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const DECO = (() => {
  const r = makeRng(20260619);
  const flowers: [number, number, number][] = [];
  const tufts: [number, number][] = [];
  const rocks: [number, number, number][] = [];
  for (let i = 0; i < 130; i++) flowers.push([60 + r() * (WORLD.w - 120), 60 + r() * (WORLD.h - 120), Math.floor(r() * 4)]);
  for (let i = 0; i < 240; i++) tufts.push([r() * WORLD.w, r() * WORLD.h]);
  for (let i = 0; i < 34; i++) rocks.push([60 + r() * (WORLD.w - 120), 60 + r() * (WORLD.h - 120), 0.7 + r() * 0.7]);
  return { flowers, tufts, rocks };
})();
const TREES: [number, number, number][] = [
  [140, 200, 1.1], [250, 150, 0.9], [1380, 230, 1.15], [1490, 400, 0.95],
  [110, 540, 1.0], [1510, 780, 1.1], [200, 1000, 1.05], [1390, 1050, 1.0],
  [820, 120, 0.9], [690, 1090, 1.0], [990, 1070, 0.95], [60, 320, 0.85], [1540, 1080, 0.9],
];
const LAMPS: [number, number][] = [
  [PLAZA.x - 130, PLAZA.y - 70], [PLAZA.x + 130, PLAZA.y - 70],
  [PLAZA.x - 130, PLAZA.y + 90], [PLAZA.x + 130, PLAZA.y + 90],
];
// 상호작용 요소
const TRAMPS: [number, number][] = [
  [PLAZA.x + 280, PLAZA.y - 30],
  [PLAZA.x - 320, PLAZA.y + 150],
];
const BENCHES: [number, number][] = [
  [PLAZA.x - 96, PLAZA.y + 150],
  [PLAZA.x + 96, PLAZA.y + 150],
];
const FOUNTAIN: [number, number] = [PLAZA.x, PLAZA.y - 200];
const FLOWER_COLORS = ["#ff6ea0", "#ffd23a", "#ff8a5b", "#b07cc6"];

// ---- 렌더 ----
function draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dpr: number,
  now: number,
  st: { x: number; y: number; dir: number; t: number; walking: boolean; bounce: number },
  spots: Spot[],
  body: string,
  accent: string,
  tasteColor: string | undefined,
  near: Spot | null,
  joy: { active: boolean; ox: number; oy: number; dx: number; dy: number }
) {
  const vw = canvas.width / dpr;
  const vh = canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = clamp(st.x - vw / 2, 0, Math.max(0, WORLD.w - vw));
  const cy = clamp(st.y - vh / 2, 0, Math.max(0, WORLD.h - vh));
  ctx.clearRect(0, 0, vw, vh);
  ctx.save();
  ctx.translate(-Math.round(cx), -Math.round(cy));
  const inView = (x: number, y: number, pad = 80) =>
    x > cx - pad && x < cx + vw + pad && y > cy - pad && y < cy + vh + pad;

  // 잔디 (타일별 미세 변주)
  const gx0 = Math.floor(cx / T) * T,
    gy0 = Math.floor(cy / T) * T;
  for (let gx = gx0; gx < cx + vw + T; gx += T)
    for (let gy = gy0; gy < cy + vh + T; gy += T) {
      const hsh = (((gx * 73856093) ^ (gy * 19349663)) >>> 0) % 100;
      ctx.fillStyle = hsh < 55 ? "#7cc96b" : hsh < 85 ? "#74c163" : "#83d073";
      ctx.fillRect(gx, gy, T, T);
      if (hsh > 92) {
        ctx.fillStyle = "#6bb558";
        ctx.fillRect(gx + 8, gy + 12, 6, 6);
        ctx.fillRect(gx + 22, gy + 24, 5, 5);
      }
    }

  // 풀 포기
  ctx.strokeStyle = "#5fae50";
  ctx.lineWidth = 2;
  for (const [x, y] of DECO.tufts) {
    if (!inView(x, y, 20)) continue;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 6);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y - 6);
    ctx.stroke();
  }

  // 길 + 광장 (테두리 있는 흙길)
  drawPaths(ctx, spots);

  // 연못 (애니메이션)
  pond(ctx, now);

  // 꽃 / 바위
  for (const [x, y, ci] of DECO.flowers) {
    if (!inView(x, y, 16)) continue;
    flower(ctx, x, y, FLOWER_COLORS[ci]);
  }
  for (const [x, y, sc] of DECO.rocks) {
    if (!inView(x, y, 20)) continue;
    rock(ctx, x, y, sc);
  }

  // 울타리 (광장 둘레 일부)
  fenceRing(ctx);

  // 가로등 (따뜻한 빛)
  for (const [x, y] of LAMPS) {
    if (inView(x, y, 60)) lamp(ctx, x, y, now);
  }

  // 분수 (상호작용/장식)
  if (inView(FOUNTAIN[0], FOUNTAIN[1], 80)) fountain(ctx, FOUNTAIN[0], FOUNTAIN[1], now);
  // 벤치
  for (const [x, y] of BENCHES) if (inView(x, y, 40)) bench(ctx, x, y);
  // 방방이(트램폴린)
  for (const [x, y] of TRAMPS) if (inView(x, y, 60)) trampoline(ctx, x, y, now);

  // 나무
  for (const [x, y, sc] of TREES) {
    if (inView(x, y, 60)) tree(ctx, x, y, sc);
  }

  // 음악 스팟
  for (const s of spots) {
    if (inView(s.x, s.y, 120)) spot(ctx, s, s === near, now);
  }

  // 플레이어
  player(ctx, st, body, accent, tasteColor, now);

  ctx.restore();

  // 가장자리 비네트
  const vg = ctx.createRadialGradient(vw / 2, vh / 2, vh * 0.5, vw / 2, vh / 2, vh * 0.92);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(20,40,20,0.22)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, vw, vh);

  // 터치 조이스틱 (화면 좌표)
  if (joy.active) {
    const R = 52;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.arc(joy.ox, joy.oy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(joy.ox + joy.dx * R, joy.oy + joy.dy * R, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function drawPaths(ctx: CanvasRenderingContext2D, spots: Spot[]) {
  const seg = (ax: number, ay: number, bx: number, by: number, w: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.min(ax, bx) - w / 2, ay - w / 2, Math.abs(bx - ax) + w, w);
    ctx.fillRect(bx - w / 2, Math.min(ay, by) - w / 2, w, Math.abs(by - ay) + w);
  };
  // 테두리(짙은 흙) 먼저, 그 위에 밝은 흙
  spots.forEach((s) => seg(PLAZA.x, PLAZA.y, s.x, s.y, 40, "#b89968"));
  spots.forEach((s) => seg(PLAZA.x, PLAZA.y, s.x, s.y, 32, "#d8c08a"));
  // 광장
  ctx.fillStyle = "#b89968";
  circle(ctx, PLAZA.x, PLAZA.y, 78);
  ctx.fillStyle = "#d8c08a";
  circle(ctx, PLAZA.x, PLAZA.y, 70);
  // 광장 중앙 음표 타일
  ctx.fillStyle = "#c2a673";
  circle(ctx, PLAZA.x, PLAZA.y, 30);
  ctx.fillStyle = "#7a5230";
  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("♬", PLAZA.x, PLAZA.y + 11);
}

function pond(ctx: CanvasRenderingContext2D, now: number) {
  const px = WORLD.w * 0.30,
    py = WORLD.h * 0.83;
  ctx.fillStyle = "#cdb98a"; // 모래 둑
  ctx.beginPath();
  ctx.ellipse(px, py, 132, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5fb6df";
  ctx.beginPath();
  ctx.ellipse(px, py, 120, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7cc3e6";
  ctx.beginPath();
  ctx.ellipse(px, py, 110, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  // 물결
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ph = ((now / 1000) * 0.4 + i / 3) % 1;
    ctx.globalAlpha = 1 - ph;
    ctx.beginPath();
    ctx.ellipse(px - 24, py - 12, 12 + ph * 40, 7 + ph * 22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function flower(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.fillStyle = "#4f9d62";
  ctx.fillRect(x - 0.8, y, 1.6, 5);
  ctx.fillStyle = c;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffe27a";
  ctx.beginPath();
  ctx.arc(x, y, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function rock(ctx: CanvasRenderingContext2D, x: number, y: number, sc: number) {
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6 * sc, 13 * sc, 5 * sc, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9aa0a6";
  ctx.beginPath();
  ctx.ellipse(x, y, 12 * sc, 9 * sc, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b3b8bd";
  ctx.beginPath();
  ctx.ellipse(x - 3 * sc, y - 2 * sc, 5 * sc, 3.4 * sc, 0, 0, Math.PI * 2);
  ctx.fill();
}

function fenceRing(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#9a6b3c";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#a9744a";
  const posts = [
    [PLAZA.x - 150, PLAZA.y - 100], [PLAZA.x - 70, PLAZA.y - 110], [PLAZA.x + 70, PLAZA.y - 110], [PLAZA.x + 150, PLAZA.y - 100],
  ];
  posts.forEach(([x, y], i) => {
    ctx.fillRect(x - 3, y - 14, 6, 18);
    if (i < posts.length - 1) {
      const [nx, ny] = posts[i + 1];
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(nx, ny - 10);
      ctx.moveTo(x, y - 3);
      ctx.lineTo(nx, ny - 3);
      ctx.stroke();
    }
  });
}

function lamp(ctx: CanvasRenderingContext2D, x: number, y: number, now: number) {
  const pulse = 0.6 + 0.4 * Math.sin(now / 600);
  // 빛무리
  const gl = ctx.createRadialGradient(x, y - 34, 2, x, y - 34, 44);
  gl.addColorStop(0, `rgba(255,224,150,${0.5 * pulse})`);
  gl.addColorStop(1, "rgba(255,224,150,0)");
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(x, y - 34, 44, 0, Math.PI * 2);
  ctx.fill();
  // 기둥
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3f48";
  ctx.fillRect(x - 2.5, y - 34, 5, 38);
  // 등
  ctx.fillStyle = "#ffe6a0";
  roundRect(ctx, x - 6, y - 44, 12, 13, 4);
  ctx.fill();
  ctx.strokeStyle = "#3a3f48";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function tree(ctx: CanvasRenderingContext2D, x: number, y: number, sc: number) {
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(x, y + 34 * sc, 26 * sc, 9 * sc, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a5230";
  ctx.fillRect(x - 5 * sc, y + 6 * sc, 10 * sc, 30 * sc);
  ctx.fillStyle = "#5a3c22";
  ctx.fillRect(x - 5 * sc, y + 6 * sc, 4 * sc, 30 * sc);
  const blob = (dx: number, dy: number, r: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + dx * sc, y + dy * sc, r * sc, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(0, -6, 30, "#357c45");
  blob(-18, 4, 20, "#3f8f54");
  blob(18, 4, 20, "#2f7245");
  blob(0, 0, 22, "#4f9d62");
  blob(-8, -12, 14, "#5cb070"); // 하이라이트
}

function spot(ctx: CanvasRenderingContext2D, s: Spot, active: boolean, now: number) {
  const g = GENRES[s.genre];
  // 근접 글로우
  if (active) {
    const pulse = 0.5 + 0.5 * Math.sin(now / 300);
    const gl = ctx.createRadialGradient(s.x, s.y, 6, s.x, s.y, 70);
    gl.addColorStop(0, `${g.color}${Math.round(60 + pulse * 50).toString(16).padStart(2, "0")}`);
    gl.addColorStop(1, `${g.color}00`);
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 70, 0, Math.PI * 2);
    ctx.fill();
  }
  // 무대 단상 (3톤)
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 26, 46, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(g.bg[1], -10);
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 22, 44, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g.bg[1];
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 18, 44, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g.color;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 15, 44, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // 스피커 + 사운드콘
  [-42, 42].forEach((ox) => {
    ctx.fillStyle = "#2a2a34";
    roundRect(ctx, s.x + ox - 7, s.y - 10, 14, 26, 3);
    ctx.fill();
    ctx.fillStyle = "#43434f";
    ctx.beginPath();
    ctx.arc(s.x + ox, s.y + 1, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // 콘
    const beat = 0.4 + 0.6 * Math.abs(Math.sin(now / 220 + ox));
    ctx.strokeStyle = `rgba(255,255,255,${0.25 * beat})`;
    ctx.lineWidth = 2;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + 1, 6 + i * 5, ox < 0 ? Math.PI * 0.6 : Math.PI * -0.4, ox < 0 ? Math.PI * 1.4 : Math.PI * 0.4);
      ctx.stroke();
    }
  });

  // LP판 (회전)
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate((now / 1000) % (Math.PI * 2));
  ctx.fillStyle = "#1a1a1a";
  circle(ctx, 0, 0, 17);
  ctx.fillStyle = g.color;
  circle(ctx, 0, 0, 6);
  ctx.fillStyle = "#fff";
  circle(ctx, 0, 0, 1.6);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(-17, -1, 34, 1); // 홈 하이라이트
  ctx.restore();

  // 떠오르는 음표
  for (let i = 0; i < 3; i++) {
    const ph = ((now / 1000) * 0.5 + i * 0.34) % 1;
    ctx.globalAlpha = (1 - ph) * 0.95;
    ctx.fillStyle = g.color;
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(i % 2 ? "♪" : "♫", s.x + Math.sin((ph + i) * 6) * 16, s.y - 24 - ph * 48);
  }
  ctx.globalAlpha = 1;

  // 간판
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(g.emoji, s.x, s.y - 30);
  ctx.font = "bold 13px sans-serif";
  const w = ctx.measureText(s.label).width + 16;
  ctx.fillStyle = active ? "#ffd23a" : "#fff8ec";
  roundRect(ctx, s.x - w / 2, s.y - 62, w, 19, 9);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#2b2620";
  ctx.fillText(s.label, s.x, s.y - 48);
}

function player(
  ctx: CanvasRenderingContext2D,
  st: { x: number; y: number; dir: number; t: number; walking: boolean; bounce: number },
  body: string,
  accent: string,
  tasteColor: string | undefined,
  now: number
) {
  const x = st.x;
  const bob = st.walking ? Math.abs(Math.sin(st.t)) * 3 : Math.sin(now / 600) * 1;
  const tramp = st.bounce > 0 ? Math.abs(Math.sin(now / 140)) * 32 * st.bounce : 0;
  const y = st.y - bob - tramp;
  // 발밑 취향 오라 (대표 장르 색, 은은한 펄스)
  if (tasteColor) {
    const pulse = 0.7 + 0.3 * Math.sin(now / 700);
    ctx.fillStyle = hexA(tasteColor, 0.16);
    ctx.beginPath();
    ctx.ellipse(x, st.y + 19, 22 * pulse, 8 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexA(tasteColor, 0.5 * pulse);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, st.y + 19, 18, 6.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 그림자
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, st.y + 19, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 발
  ctx.fillStyle = shade(body, -34);
  const step = st.walking ? Math.sin(st.t) * 3 : 0;
  ctx.beginPath();
  ctx.ellipse(x - 6, y + 17 + step, 4, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 6, y + 17 - step, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // 안테나 (글로우)
  const pulse = 0.6 + 0.4 * Math.sin(now / 400);
  const gl = ctx.createRadialGradient(x + 7, y - 32, 1, x + 7, y - 32, 12);
  gl.addColorStop(0, hexA(accent, 0.6 * pulse));
  gl.addColorStop(1, hexA(accent, 0));
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(x + 7, y - 32, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = shade(body, -30);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 18);
  ctx.lineTo(x + 7, y - 30);
  ctx.stroke();
  ctx.fillStyle = accent;
  circle(ctx, x + 7, y - 32, 3.4);
  // 몸통 + 외곽선
  ctx.fillStyle = body;
  roundRect(ctx, x - 13, y - 9, 26, 28, 11);
  ctx.fill();
  ctx.strokeStyle = "rgba(43,38,32,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // 배 패치
  ctx.fillStyle = lighten(body, 30);
  ctx.beginPath();
  ctx.ellipse(x, y + 7, 8.5, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // 눈
  ctx.fillStyle = "#241d1a";
  const ex = st.dir * 0.6;
  circle(ctx, x - 4.5 + ex, y - 4, 2.6);
  circle(ctx, x + 4.5 + ex, y - 4, 2.6);
  ctx.fillStyle = "#fff";
  circle(ctx, x - 5.3 + ex, y - 5, 0.9);
  circle(ctx, x + 3.7 + ex, y - 5, 0.9);
  // 볼터치
  ctx.fillStyle = "rgba(255,140,170,0.5)";
  circle(ctx, x - 8 + ex, y - 1, 2);
  circle(ctx, x + 8 + ex, y - 1, 2);
  // 미소
  ctx.strokeStyle = "#3a2d27";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x + ex, y, 3, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function trampoline(ctx: CanvasRenderingContext2D, x: number, y: number, now: number) {
  // 그림자
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // 다리
  ctx.strokeStyle = "#2a8f86";
  ctx.lineWidth = 4;
  [-26, 26].forEach((ox) => {
    ctx.beginPath();
    ctx.moveTo(x + ox, y + 4);
    ctx.lineTo(x + ox * 0.7, y + 18);
    ctx.stroke();
  });
  // 프레임
  ctx.fillStyle = "#46d8c5";
  ctx.beginPath();
  ctx.ellipse(x, y, 38, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // 매트
  const squash = 1 + 0.12 * Math.sin(now / 140);
  ctx.fillStyle = "#1f2933";
  ctx.beginPath();
  ctx.ellipse(x, y, 30, 11 * squash, 0, 0, Math.PI * 2);
  ctx.fill();
  // 격자
  ctx.strokeStyle = "rgba(120,200,210,0.35)";
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 10, y - 9);
    ctx.lineTo(x + i * 10, y + 9);
    ctx.stroke();
  }
  // 라벨
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🦘", x, y - 22);
}

function fountain(ctx: CanvasRenderingContext2D, x: number, y: number, now: number) {
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 40, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#bfc6cc";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 40, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7cc3e6";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 33, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cfd6da";
  ctx.fillRect(x - 4, y - 18, 8, 22);
  // 물줄기
  ctx.strokeStyle = "rgba(160,220,245,0.8)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const ph = (now / 500 + i / 6) % 1;
    const r = 4 + ph * 16;
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x + Math.cos(a) * r, y - 18 + Math.sin(a) * 4 + ph * 16);
    ctx.stroke();
  }
  ctx.fillStyle = "#9fd9ef";
  circle(ctx, x, y - 20, 3);
}

function bench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9a6b3c";
  roundRect(ctx, x - 20, y - 2, 40, 7, 2);
  ctx.fill();
  ctx.fillStyle = "#8a5e34";
  roundRect(ctx, x - 20, y - 14, 40, 6, 2);
  ctx.fill();
  ctx.fillStyle = "#6a4628";
  ctx.fillRect(x - 17, y + 4, 4, 8);
  ctx.fillRect(x + 13, y + 4, 4, 8);
}

// ---- 헬퍼 ----
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function adjust(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
const lighten = (h: string, a: number) => adjust(h, a);
const shade = (h: string, a: number) => adjust(h, a);
function hexA(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${n >> 16},${(n >> 8) & 0xff},${n & 0xff},${a})`;
}
