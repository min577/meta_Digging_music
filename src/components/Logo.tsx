// DigTown 브랜드 마크 + 워드마크
export default function Logo({
  size = 28,
  wordmark = true,
}: {
  size?: number;
  wordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span
        className="grid place-items-center rounded-[30%] shadow-soft"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(140deg,#8E7BE8,#6E54D8)",
        }}
      >
        {/* DigTown 마스코트 — 보라 후드 + 골드 헤드폰 */}
        <svg width={size * 0.78} height={size * 0.78} viewBox="0 0 24 24" fill="none">
          {/* 후드(보라) */}
          <path d="M5 13a7 7 0 0 1 14 0v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="#7B5EE6" />
          {/* 얼굴(크림) */}
          <ellipse cx="12" cy="12.4" rx="4.1" ry="4.3" fill="#F6EBD8" />
          {/* 앞머리(다크) */}
          <path d="M8 11.4a4 4 0 0 1 8 0c-1.3-1-2.5-1.4-4-1.4s-2.7.4-4 1.4z" fill="#2A251D" />
          {/* 헤드폰(골드) */}
          <path d="M6 12a6 6 0 0 1 12 0" stroke="#F2C14E" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="4.6" y="11.4" width="2.6" height="3.8" rx="1.3" fill="#F2C14E" />
          <rect x="16.8" y="11.4" width="2.6" height="3.8" rx="1.3" fill="#F2C14E" />
        </svg>
      </span>
      {wordmark && (
        <span
          className="font-extrabold tracking-tight text-ink-900"
          style={{ fontSize: size * 0.62 }}
        >
          Dig<span className="text-brand">Town</span>
        </span>
      )}
    </span>
  );
}
