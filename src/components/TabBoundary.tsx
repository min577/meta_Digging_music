"use client";

import { usePathname } from "next/navigation";
import ErrorBoundary from "./ErrorBoundary";

// 라우트가 바뀌면 바운더리를 리셋(key=pathname)해서 다른 탭은 정상 표시되게.
export default function TabBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}
