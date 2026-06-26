// DigTown 앱 로고 (디자인 원본 이미지)
export default function Logo({
  size = 120,
  // 호환용(이미지에 워드마크 포함이라 사용 안 함)
  wordmark = true,
}: {
  size?: number;
  wordmark?: boolean;
}) {
  void wordmark;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/digtown-logo.png"
      alt="DigTown"
      width={size}
      height={size}
      draggable={false}
      className="select-none object-contain"
      style={{ width: size, height: size }}
    />
  );
}
