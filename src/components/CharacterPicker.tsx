"use client";

import Avatar from "./Avatar";
import Icon from "./Icon";
import { useAppStore } from "@/store/useAppStore";
import {
  PRESET_COLORS,
  PRESET_HAIRS,
  PRESET_ACCESSORIES,
  COSTUME_PRESETS,
  DEFAULT_PRESET,
} from "@/lib/characters";
import type { Appearance } from "@/lib/appearance";

function Tile({ preset, selected, onClick }: { preset: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-0.5 grid place-items-center transition active:scale-95 ${
        selected ? "ring-2 ring-brand bg-brand/5" : "bg-cream-50"
      }`}
    >
      <Avatar appearance={{ preset } as Appearance} size={56} bob={false} />
    </button>
  );
}

function NoneTile({ selected, onClick }: { selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl grid place-items-center aspect-square w-full transition active:scale-95 ${
        selected ? "ring-2 ring-brand bg-brand/5" : "border-2 border-dashed border-cream-300"
      }`}
    >
      <Icon name="x" size={22} className="text-ink-700/35" />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-ink-700/60 mb-1.5 px-0.5">{title}</p>
      <div className="card p-3">
        <div className="grid grid-cols-4 gap-2.5">{children}</div>
      </div>
    </div>
  );
}

// 디자인 시안의 캐릭터 꾸미기 — 컬러/헤어/악세서리/코스튬 섹션 + 미리보기.
export default function CharacterPicker({
  value,
  onChange,
  preview = true,
}: {
  value: string;
  onChange: (preset: string) => void;
  preview?: boolean;
}) {
  const ownedItems = useAppStore((s) => s.ownedItems);
  const ownedCostumes = COSTUME_PRESETS.filter(
    (c) => ownedItems.includes(`costume_${c.id}`) || value === c.src
  );

  return (
    <div className="space-y-5">
      {preview && (
        <div className="flex justify-center">
          <div className="rounded-3xl bg-cream-50 border border-cream-200 px-8 py-3 shadow-card">
            <Avatar appearance={{ preset: value } as Appearance} size={120} />
          </div>
        </div>
      )}

      <Section title="컬러">
        {PRESET_COLORS.map((p) => (
          <Tile key={p} preset={p} selected={value === p} onClick={() => onChange(p)} />
        ))}
      </Section>

      <Section title="헤어">
        {PRESET_HAIRS.map((p) => (
          <Tile key={p} preset={p} selected={value === p} onClick={() => onChange(p)} />
        ))}
      </Section>

      <Section title="악세서리">
        <NoneTile selected={value === DEFAULT_PRESET} onClick={() => onChange(DEFAULT_PRESET)} />
        {PRESET_ACCESSORIES.map((p) => (
          <Tile key={p} preset={p} selected={value === p} onClick={() => onChange(p)} />
        ))}
      </Section>

      <Section title="코스튬">
        <NoneTile selected={!ownedCostumes.some((c) => c.src === value)} onClick={() => onChange(DEFAULT_PRESET)} />
        {ownedCostumes.map((c) => (
          <Tile key={c.id} preset={c.src} selected={value === c.src} onClick={() => onChange(c.src)} />
        ))}
      </Section>
    </div>
  );
}
