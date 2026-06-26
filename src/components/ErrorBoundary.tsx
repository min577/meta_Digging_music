"use client";

import { Component, type ReactNode } from "react";

// 탭 화면에서 에러가 나도 앱 전체가 흰 화면으로 죽지 않게 격리 + 원인 표시.
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { err: Error | null }
> {
  state = { err: null as Error | null };

  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", err);
  }

  render() {
    const err = this.state.err;
    if (err) {
      return (
        <div className="px-6 py-10">
          <p className="text-2xl">🛠️</p>
          <p className="font-extrabold text-ink-900 mt-2">이 화면에서 문제가 발생했어요</p>
          <p className="text-xs text-ink-700/55 mt-1">아래 내용을 알려주시면 바로 고칠게요.</p>
          <pre className="mt-3 text-[11px] text-live whitespace-pre-wrap break-words bg-cream-100 border border-cream-200 rounded-xl p-3 max-h-[40vh] overflow-auto">
            {String(err?.message || err)}
            {err?.stack ? "\n\n" + err.stack.split("\n").slice(0, 6).join("\n") : ""}
          </pre>
          <button
            onClick={() => this.setState({ err: null })}
            className="btn-ghost mt-3 text-sm"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
