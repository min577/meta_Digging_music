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
          background: "linear-gradient(140deg,#6C8AE4,#9B6CE4)",
        }}
      >
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
          {/* 디깅 = 음표 + 핀 */}
          <circle cx="8" cy="17" r="2.4" fill="#fff" />
          <path d="M10.4 17V6.5l8-1.6V14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="14.2" r="2.4" fill="#fff" />
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
