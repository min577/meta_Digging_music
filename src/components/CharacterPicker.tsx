"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { useAppStore } from "@/store/useAppStore";
import { COSTUME_PRESETS } from "@/lib/characters";
import {
  BODY_COLORS,
  HAIR_COLORS,
  ACCESSORIES,
  defaultParts,
  type AvatarParts,
} from "@/lib/avatarParts";
import { composeAvatar, composedFromCache } from "@/lib/avatarCompose";
import type { Appearance } from "@/lib/appearance";

const COSTUME_SRCS = new Set(COSTUME_PRESETS.map((c) => c.src));

// 파츠 조합을 합성한 PNG를 보여주는 이미지 (캐시 사용)
function ComposedImg({ parts, size }: { parts: AvatarParts; size: number }) {
  const [url, setUrl] = useState<string>(() => composedFromCache(parts) ?? "");
  useEffect(() => {
    let on = true;
    composeAvatar(parts).then((u) => on && setUrl(u));
    return () => {
      on = false;
    };
  }, [parts.body, parts.hair, parts.acc]);
  return (
    <div className="grid place-items-center" style={{ width: size, height: size * 1.18 }}>
      {url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt=""
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={{ filter: "drop-shadow(0 4px 5px rgba(62,55,44,0.18))" }}
        />
      ) : (
        <div className="w-2/3 h-2/3 rounded-full bg-cream-200 animate-pulse" />
      )}
    </div>
  );
}

function Swatch({ hex, selected, onClick }: { hex: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`aspect-square w-full rounded-2xl grid place-items-center transition active:scale-95 ${
        selected ? "ring-2 ring-brand bg-brand/5" : "bg-cream-50"
      }`}
    >
      <span
        className="w-8 h-8 rounded-full shadow-inner"
        style={{ background: hex, boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.18)" }}
      />
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

// 캐릭터 꾸미기 — 컬러(몸)·헤어(머리)·악세서리를 독립 선택해 실시간 합성.
export default function CharacterPicker({
  value,
  onChange,
  preview = true,
}: {
  value: Appearance;
  onChange: (a: Appearance) => void;
  preview?: boolean;
}) {
  const ownedItems = useAppStore((s) => s.ownedItems);
  const parts = value.parts ?? defaultParts();
  const isCostume = !!value.preset && !value.preset.startsWith("data:") && COSTUME_SRCS.has(value.preset);

  const ownedCostumes = COSTUME_PRESETS.filter(
    (c) => ownedItems.includes(`costume_${c.id}`) || value.preset === c.src
  );

  // 파츠 변경 → 합성 후 onChange (코스튬 해제)
  const apply = async (patch: Partial<AvatarParts>) => {
    const np = { ...parts, ...patch };
    const url = await composeAvatar(np);
    onChange({ ...value, parts: np, preset: url, costume: "none" });
  };

  // 마운트 시 preset이 합성본이 아니고 코스튬도 아니면 현재 파츠로 한 번 구워둔다(미리보기/맵 동기화)
  useEffect(() => {
    if (!isCostume && !value.preset?.startsWith("data:")) {
      composeAvatar(parts).then((url) => onChange({ ...value, parts, preset: url }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      {preview && (
        <div className="flex justify-center">
          <div className="rounded-3xl bg-cream-50 border border-cream-200 px-8 py-3 shadow-card">
            {isCostume ? (
              <Avatar appearance={value} size={120} />
            ) : (
              <ComposedImg parts={parts} size={120} />
            )}
          </div>
        </div>
      )}

      <Section title="컬러">
        {BODY_COLORS.map((c) => (
          <Swatch
            key={c.id}
            hex={c.hex}
            selected={!isCostume && parts.body === c.hex}
            onClick={() => apply({ body: c.hex })}
          />
        ))}
      </Section>

      <Section title="헤어">
        {HAIR_COLORS.map((c) => (
          <Swatch
            key={c.id}
            hex={c.hex}
            selected={!isCostume && parts.hair === c.hex}
            onClick={() => apply({ hair: c.hex })}
          />
        ))}
      </Section>

      <Section title="악세서리">
        {ACCESSORIES.map((a) => {
          const on = !isCostume && parts.acc === a.id;
          return (
            <button
              key={a.id}
              onClick={() => apply({ acc: a.id })}
              className={`rounded-2xl p-0.5 grid place-items-center transition active:scale-95 ${
                on ? "ring-2 ring-brand bg-brand/5" : "bg-cream-50"
              }`}
              title={a.label}
            >
              {a.id === "none" ? (
                <div className="aspect-square w-full grid place-items-center">
                  <Icon name="x" size={20} className="text-ink-700/35" />
                </div>
              ) : (
                <ComposedImg parts={{ ...parts, acc: a.id }} size={52} />
              )}
            </button>
          );
        })}
      </Section>

      {ownedCostumes.length > 0 && (
        <Section title="코스튬">
          {ownedCostumes.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ ...value, preset: c.src })}
              className={`rounded-2xl p-0.5 grid place-items-center transition active:scale-95 ${
                value.preset === c.src ? "ring-2 ring-brand bg-brand/5" : "bg-cream-50"
              }`}
              title={c.name}
            >
              <Avatar appearance={{ preset: c.src } as Appearance} size={52} bob={false} />
            </button>
          ))}
        </Section>
      )}
    </div>
  );
}
