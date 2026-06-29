"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAppStore } from "@/store/useAppStore";

// 튜토리얼에서 어떤 에러가 나도 페이지 전체를 죽이지 않도록 격리.
class TourBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[CoachTour] 비활성화됨:", err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function CoachTour(props: { tourKey: string; steps: TourStep[] }) {
  return (
    <TourBoundary>
      <CoachTourInner {...props} />
    </TourBoundary>
  );
}

export interface TourStep {
  /** 강조할 요소의 data-tour 값. 없으면 화면 중앙 카드 */
  target?: string;
  title: string;
  desc: string;
  /** 진행 방식: next=버튼만 · tap=강조요소 클릭 시 진행 · move=이동 입력 시 진행 */
  advance?: "next" | "tap" | "move";
}

interface Rect { top: number; left: number; width: number; height: number; }

// 탭별 코치마크 튜토리얼 — 실제 요소를 스포트라이트로 짚고, 직접 조작하며 단계 진행.
function CoachTourInner({ tourKey, steps }: { tourKey: string; steps: TourStep[] }) {
  const seen = useAppStore((s) => s.tours?.[tourKey]);
  const markTour = useAppStore((s) => s.markTour);
  const rectRef = useRef<Rect | null>(null);

  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => setMounted(true), []);

  // 마운트 후 약간 지연시켜 시작 (레이아웃 안정화). 이미 본 투어는 스킵.
  useEffect(() => {
    if (seen || steps.length === 0) return;
    const t = setTimeout(() => setActive(true), 600);
    return () => clearTimeout(t);
  }, [seen, steps.length]);

  const step = steps[i];

  const finish = () => {
    setActive(false);
    markTour(tourKey);
  };
  const next = () => {
    if (i >= steps.length - 1) finish();
    else setI((v) => v + 1);
  };

  // 대상 요소 위치 추적 (등장 지연·리사이즈·스크롤 대응)
  useEffect(() => {
    if (!active || !step) return;
    rectRef.current = null;
    let raf = 0;
    let tries = 0;
    let gaveUp = false;
    const measure = () => {
      if (!step.target) { if (rectRef.current) { rectRef.current = null; setRect(null); } return; }
      const el = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        const nr = { top: r.top, left: r.left, width: r.width, height: r.height };
        const p = rectRef.current;
        // 값이 실제로 바뀐 경우에만 setState (매 프레임 리렌더 방지)
        if (!p || Math.abs(p.top - nr.top) > 0.5 || Math.abs(p.left - nr.left) > 0.5 || Math.abs(p.width - nr.width) > 0.5 || Math.abs(p.height - nr.height) > 0.5) {
          rectRef.current = nr;
          setRect(nr);
        }
        tries = 0;
      } else {
        // 요소가 아직 없으면 잠시 재시도, 그래도 없으면 이 단계 건너뜀
        tries += 1;
        setRect(null);
        if (tries > 24 && !gaveUp) { gaveUp = true; cancelAnimationFrame(raf); next(); }
      }
    };
    const loop = () => { measure(); if (!gaveUp) raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, i]);

  // tap 진행: 강조 요소를 누르면 다음 단계
  useEffect(() => {
    if (!active || !step || step.advance !== "tap" || !step.target) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;
    const onTap = () => setTimeout(next, 120);
    el.addEventListener("click", onTap, { once: true });
    return () => el.removeEventListener("click", onTap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, i]);

  // move 진행: WASD/방향키 또는 화면 드래그
  useEffect(() => {
    if (!active || !step || step.advance !== "move") return;
    const keys = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
    const onKey = (e: KeyboardEvent) => { if (keys.includes(e.key.toLowerCase())) { window.removeEventListener("keydown", onKey); setTimeout(next, 400); } };
    const onTouch = () => { window.removeEventListener("touchstart", onTouch); setTimeout(next, 400); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouch);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("touchstart", onTouch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, i]);

  if (!mounted || !active || !step) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 390;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const pad = 8;

  // 스포트라이트 박스 (대상 + 여백)
  const spot = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  // 툴팁 위치 — 대상 아래(공간 없으면 위), 없으면 화면 중앙 하단
  const tipW = Math.min(320, vw - 32);
  let tipTop = vh - 220;
  let tipLeft = (vw - tipW) / 2;
  if (spot) {
    const below = spot.top + spot.height + 12;
    const aboveSpace = spot.top;
    if (vh - below > 150 || aboveSpace < 170) tipTop = below;
    else tipTop = Math.max(12, spot.top - 156);
    tipLeft = Math.min(Math.max(12, spot.left + spot.width / 2 - tipW / 2), vw - tipW - 12);
  }

  const isLast = i === steps.length - 1;
  const advanceHint =
    step.advance === "tap" ? "위 항목을 눌러 진행" : step.advance === "move" ? "움직여서 진행" : null;

  return createPortal(
    <div className="fixed inset-0 z-[3000]" style={{ pointerEvents: "none" }}>
      {/* 딤 + 스포트라이트 (box-shadow로 구멍 뚫기) — pointer-events none이라 실제 UI 클릭 가능 */}
      {spot ? (
        <div
          className="absolute rounded-2xl transition-all duration-300"
          style={{
            top: spot.top, left: spot.left, width: spot.width, height: spot.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
            outline: "3px solid #7B5EE6", outlineOffset: "1px",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", pointerEvents: "none" }} />
      )}

      {/* 툴팁 카드 */}
      <div
        className="absolute card p-4 shadow-soft"
        style={{ top: tipTop, left: tipLeft, width: tipW, pointerEvents: "auto" }}
      >
        <div className="flex items-center justify-between">
          <span className="chip bg-brand/10 text-brand-dark text-[11px] font-bold py-0.5 px-2">
            튜토리얼 {i + 1}/{steps.length}
          </span>
          <button onClick={finish} className="text-[11px] font-bold text-ink-700/45">건너뛰기</button>
        </div>
        <p className="mt-2 font-extrabold text-ink-900">{step.title}</p>
        <p className="mt-1 text-[13px] text-ink-700/65 leading-relaxed">{step.desc}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, k) => (
              <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-brand" : "w-1.5 bg-cream-300"}`} />
            ))}
          </div>
          {advanceHint ? (
            <span className="text-[11px] font-bold text-brand">{advanceHint}</span>
          ) : (
            <button onClick={next} className="btn-primary btn-sm">
              {isLast ? "완료" : "다음"}
            </button>
          )}
        </div>
        {advanceHint && (
          <button onClick={next} className="mt-2 w-full text-[11px] font-bold text-ink-700/40">
            건너뛰고 다음 →
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
