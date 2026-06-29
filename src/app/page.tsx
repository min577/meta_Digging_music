"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { useAppStore } from "@/store/useAppStore";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signInWithGoogle } from "@/lib/profile";

export default function RootPage() {
  const router = useRouter();
  const onboarded = useAppStore((s) => s.onboarded);
  const [ready, setReady] = useState(false);

  // 이미 온보딩한 사용자는 바로 홈으로
  useEffect(() => {
    const id = setTimeout(() => {
      if (onboarded) router.replace("/home");
      else setReady(true);
    }, 0);
    return () => clearTimeout(id);
  }, [onboarded, router]);

  const login = async () => {
    if (isSupabaseConfigured) {
      const ok = await signInWithGoogle();
      if (ok) return;
    }
    router.push(onboarded ? "/home" : "/onboarding");
  };

  if (!ready) {
    return (
      <div className="phone-shell grid place-items-center" style={{ background: "linear-gradient(180deg,#8C7BE6,#B9ABEF)" }}>
        <div className="animate-bob text-white"><Icon name="headphones" size={44} /></div>
      </div>
    );
  }

  return (
    <div
      className="phone-shell flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#8C7BE6 0%,#A797EC 55%,#C3B7F2 100%)" }}
    >
      {/* 상단: 태그라인 + 워드마크 */}
      <div className="pt-16 text-center px-6">
        <p className="text-white/85 text-sm font-bold tracking-wide">음악으로 하나되는 이곳</p>
        <h1 className="mt-2 text-white text-[52px] leading-none font-extrabold tracking-tight drop-shadow-[0_3px_8px_rgba(80,60,160,0.35)]">
          DigTown
        </h1>
      </div>

      {/* 중앙: 이퀄라이저 + 마스코트 */}
      <div className="flex-1 relative flex items-end justify-center">
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 px-10 opacity-70">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <span
              key={i}
              className="flex-1 rounded-t-xl"
              style={{
                background: "rgba(255,255,255,0.28)",
                height: `${30 + ((i * 37) % 60)}%`,
                transformOrigin: "bottom",
                animation: `eqBar ${1.1 + (i % 4) * 0.25}s ease-in-out ${i * 0.08}s infinite`,
              }}
            />
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/characters/group.png" alt="" className="relative w-44 mb-2 drop-shadow-[0_10px_18px_rgba(70,50,140,0.35)]" draggable={false} />
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-10 pt-4 space-y-3">
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full rounded-full bg-white text-brand-dark font-extrabold py-3.5 shadow-soft active:scale-[0.98] transition"
        >
          시작하기
        </button>
        <button
          onClick={login}
          className="w-full rounded-full border-2 border-white/70 text-white font-bold py-3.5 active:scale-[0.98] transition"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
