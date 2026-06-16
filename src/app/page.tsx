"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import Logo from "@/components/Logo";

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
    <div className="phone-shell flex flex-col items-center justify-center min-h-[100dvh] gap-3">
      <div className="animate-float-slow">
        <Logo size={56} wordmark={false} />
      </div>
      <p className="text-ink-900 font-extrabold text-2xl tracking-tight">
        Dig<span className="text-brand">Town</span>
      </p>
      <p className="text-ink-700/55 text-sm">혼자 듣지 마세요</p>
    </div>
  );
}
