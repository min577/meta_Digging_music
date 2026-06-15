"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function RootPage() {
  const router = useRouter();
  const onboarded = useAppStore((s) => s.onboarded);

  useEffect(() => {
    const id = setTimeout(() => {
      router.replace(onboarded ? "/home" : "/onboarding");
    }, 0);
    return () => clearTimeout(id);
  }, [onboarded, router]);

  return (
    <div className="phone-shell flex flex-col items-center justify-center min-h-[100dvh] gap-4">
      <div className="animate-float-slow text-6xl">🎧</div>
      <p className="text-ink-700 font-bold text-lg">디깅타운</p>
      <p className="text-ink-700/60 text-sm">혼자 듣지 마세요</p>
    </div>
  );
}
