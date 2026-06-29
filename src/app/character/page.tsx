"use client";

import { useRouter } from "next/navigation";
import CharacterPicker from "@/components/CharacterPicker";
import Icon from "@/components/Icon";
import { useAppStore } from "@/store/useAppStore";
import { defaultAppearance, type Appearance } from "@/lib/appearance";
import { DEFAULT_PRESET } from "@/lib/characters";

export default function CharacterPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const setAppearance = useAppStore((s) => s.setAppearance);
  const ap = user?.character.appearance ?? defaultAppearance();
  const value = ap.preset ?? DEFAULT_PRESET;

  return (
    <div className="phone-shell min-h-[100dvh] bg-cream-100 flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-6 pb-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-cream-50 border border-cream-200 grid place-items-center"
        >
          <Icon name="back" size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">캐릭터 꾸미기</h1>
          <p className="text-xs text-ink-700/55">코스튬은 상점에서 구매할 수 있어요</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6">
        <CharacterPicker
          value={value}
          onChange={(p) => setAppearance({ ...ap, preset: p } as Appearance)}
        />
      </div>

      <div className="px-5 pb-8 pt-2">
        <button onClick={() => router.back()} className="btn-primary w-full">
          완료
        </button>
      </div>
    </div>
  );
}
