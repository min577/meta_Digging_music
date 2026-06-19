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
const SPEED = 190;
const T = 40; // 타일

// 2D 탑다운 디깅 맵 (스타듀밸리풍). 캔버스 + 키보드 이동 + 스팟 근접 디깅.
export default function MapScene2D({
  bodyColor,
  accentColor,
  spots,
  onNear,
  onDig,
}: {
  bodyColor: string;
  accentColor: string;
  spots: Spot[];
  onNear: (s: Spot | null) => void;
  onDig: (s: Spot) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const me = useRef({ x: WORLD.w / 2, y: WORLD.h * 0.62, dir: 1, t: 0, walking: false });
  const keys = useRef<Set<string>>(new Set());
  const nearRef = useRef<Spot | null>(null);
  const cb = useRef({ onNear, onDig, spots, bodyColor, accentColor });
  cb.current = { onNear, onDig, spots, bodyColor, accentColor };

  // 키 입력 (방향 + Space 디깅)
  useEffect(() => {
    const move = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (move.includes(k)) {
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

  // 렌더 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = me.current;
      const k = keys.current;
      let dx = 0,
        dy = 0;
      if (k.has("w") || k.has("arrowup")) dy -= 1;
      if (k.has("s") || k.has("arrowdown")) dy += 1;
      if (k.has("a") || k.has("arrowleft")) dx -= 1;
      if (k.has("d") || k.has("arrowright")) dx += 1;
      st.walking = !!(dx || dy);
      if (st.walking) {
        const l = Math.hypot(dx, dy) || 1;
        st.x = clamp(st.x + (dx / l) * SPEED * dt, 24, WORLD.w - 24);
        st.y = clamp(st.y + (dy / l) * SPEED * dt, 24, WORLD.h - 24);
        if (dx) st.dir = dx < 0 ? -1 : 1;
        st.t += dt * 9;
      }
      // 근접 스팟
      let near: Spot | null = null;
      let bd = 72;
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
      draw(ctx, canvas, dpr, st, cb.current.spots, cb.current.bodyColor, cb.current.accentColor, near);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none" style={{ imageRendering: "pixelated" }} />;
}

// ---- 렌더 ----
function draw(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dpr: number,
  st: { x: number; y: number; dir: number; t: number; walking: boolean },
  spots: Spot[],
  body: string,
  accent: string,
  near: Spot | null
) {
  const vw = canvas.width / dpr;
  const vh = canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = clamp(st.x - vw / 2, 0, Math.max(0, WORLD.w - vw));
  const cy = clamp(st.y - vh / 2, 0, Math.max(0, WORLD.h - vh));
  ctx.clearRect(0, 0, vw, vh);
  ctx.save();
  ctx.translate(-Math.round(cx), -Math.round(cy));

  // 잔디 (체커)
  const x0 = Math.floor(cx / T) * T,
    y0 = Math.floor(cy / T) * T;
  for (let gx = x0; gx < cx + vw + T; gx += T)
    for (let gy = y0; gy < cy + vh + T; gy += T) {
      ctx.fillStyle = ((gx / T + gy / T) % 2 === 0) ? "#7cc96b" : "#72bd60";
      ctx.fillRect(gx, gy, T, T);
    }

  // 가운데 광장 + 길 (스팟 연결)
  ctx.fillStyle = "#d8c08a";
  spots.forEach((s) => pathRect(ctx, WORLD.w / 2, WORLD.h * 0.62, s.x, s.y));
  ctx.beginPath();
  ctx.arc(WORLD.w / 2, WORLD.h * 0.62, 70, 0, Math.PI * 2);
  ctx.fill();

  // 연못
  ctx.fillStyle = "#7cc3e6";
  ctx.beginPath();
  ctx.ellipse(WORLD.w * 0.30, WORLD.h * 0.82, 120, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9bd4ef";
  ctx.beginPath();
  ctx.ellipse(WORLD.w * 0.30 - 24, WORLD.h * 0.82 - 14, 40, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // 나무 (장식, 고정)
  TREES.forEach(([tx, ty]) => tree(ctx, tx, ty));

  // 음악 스팟
  spots.forEach((s) => spot(ctx, s, s === near));

  // 플레이어
  player(ctx, st, body, accent);

  ctx.restore();
}

const TREES: [number, number][] = [
  [140, 200], [240, 160], [1380, 240], [1480, 380], [120, 560], [1500, 760],
  [200, 980], [1380, 1040], [820, 140], [700, 1080], [980, 1040],
];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function pathRect(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number) {
  // 두 점 사이 굵은 길(축 정렬 L자)
  const w = 34;
  ctx.fillRect(Math.min(ax, bx) - w / 2, ay - w / 2, Math.abs(bx - ax) + w, w);
  ctx.fillRect(bx - w / 2, Math.min(ay, by) - w / 2, w, Math.abs(by - ay) + w);
}

function tree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(x, y + 30, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a5230";
  ctx.fillRect(x - 5, y + 6, 10, 26);
  const blob = (dx: number, dy: number, r: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(0, -8, 26, "#3f8f54");
  blob(-16, 2, 18, "#4f9d62");
  blob(16, 2, 18, "#358a4c");
  blob(0, -2, 18, "#58ad6e");
}

function spot(ctx: CanvasRenderingContext2D, s: Spot, active: boolean) {
  const g = GENRES[s.genre];
  // 무대 단상
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 24, 44, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g.bg[1];
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 20, 42, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g.color;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + 16, 42, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // LP판
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(s.x, s.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g.color;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // 스피커 양옆
  ctx.fillStyle = "#2a2a34";
  ctx.fillRect(s.x - 40, s.y - 6, 12, 22);
  ctx.fillRect(s.x + 28, s.y - 6, 12, 22);

  // 이모지 + 라벨
  ctx.textAlign = "center";
  ctx.font = "20px sans-serif";
  ctx.fillText(g.emoji, s.x, s.y - 26);
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = "#2b2620";
  // 라벨 배경
  const w = ctx.measureText(s.label).width + 14;
  ctx.fillStyle = active ? "#ffd23a" : "rgba(255,255,255,0.88)";
  roundRect(ctx, s.x - w / 2, s.y - 56, w, 18, 9);
  ctx.fill();
  ctx.fillStyle = "#2b2620";
  ctx.fillText(s.label, s.x, s.y - 43);

  if (active) {
    ctx.strokeStyle = "#ffd23a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + 16, 46, 19, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function player(
  ctx: CanvasRenderingContext2D,
  st: { x: number; y: number; dir: number; t: number; walking: boolean },
  body: string,
  accent: string
) {
  const x = st.x;
  const bob = st.walking ? Math.abs(Math.sin(st.t)) * 3 : 0;
  const y = st.y - bob;
  // 그림자
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, st.y + 18, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 안테나
  ctx.strokeStyle = shade(body, -30);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 18);
  ctx.lineTo(x + 7, y - 30);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + 7, y - 32, 3.4, 0, Math.PI * 2);
  ctx.fill();
  // 몸통
  ctx.fillStyle = body;
  roundRect(ctx, x - 12, y - 8, 24, 26, 10);
  ctx.fill();
  // 배 패치
  ctx.fillStyle = lighten(body, 28);
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // 눈
  ctx.fillStyle = "#241d1a";
  ctx.beginPath();
  ctx.arc(x - 4 + st.dir * 0.5, y - 4, 2.4, 0, Math.PI * 2);
  ctx.arc(x + 5 + st.dir * 0.5, y - 4, 2.4, 0, Math.PI * 2);
  ctx.fill();
  // 미소
  ctx.strokeStyle = "#3a2d27";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x + st.dir * 0.5, y - 1, 3, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
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
