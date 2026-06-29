"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { useAppStore } from "@/store/useAppStore";

// 온보딩 가드: 온보딩 안 한 사용자는 /onboarding 으로 보낸다.
// zustand persist는 클라이언트에서 hydration 되므로 마운트 후 판단한다.
export default function AppGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const onboarded = useAppStore((s) => s.onboarded);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // persist hydration 완료를 한 tick 기다린다
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (ready && !onboarded) router.replace("/onboarding");
  }, [ready, onboarded, router]);

  if (!ready) {
    return (
      <div className="phone-shell flex items-center justify-center min-h-[100dvh]">
        <div className="animate-bob text-brand"><Icon name="headphones" size={40} /></div>
      </div>
    );
  }
  if (!onboarded) return null;
  return <>{children}</>;
}
