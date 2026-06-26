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
        <Logo size={150} />
      </div>
      <p className="text-ink-700/55 text-sm">음악으로 하나되는 이곳</p>
    </div>
  );
}
