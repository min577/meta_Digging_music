"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import { searchTracks } from "@/lib/music";
import { GENRES } from "@/lib/genres";
import type { Track } from "@/lib/types";

export default function TrackSearch({
  onPick,
  placeholder = "곡 · 아티스트 검색",
  pickedIds = [],
}: {
  onPick: (t: Track) => void;
  placeholder?: string;
  pickedIds?: string[];
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const id = setTimeout(async () => {
      const r = await searchTracks(q);
      if (active) {
        setResults(r);
        setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [q]);

  return (
    <div>
      <div className="flex items-center gap-2 card px-4 py-3">
        <Icon name="search" size={16} className="text-ink-700/50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-700/40"
        />
      </div>

      <div className="mt-3 space-y-2 max-h-[44vh] overflow-y-auto no-scrollbar">
        {loading && results.length === 0 && (
          <p className="text-center text-ink-700/40 text-sm py-4">검색 중…</p>
        )}
        {results.map((t) => {
          const g = GENRES[t.genre];
          const picked = pickedIds.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onPick(t)}
              disabled={picked}
              className={`w-full flex items-center gap-3 card px-3 py-2.5 text-left active:scale-[0.99] transition ${
                picked ? "opacity-40" : ""
              }`}
            >
              <span
                className="w-9 h-9 rounded-xl grid place-items-center text-lg shrink-0"
                style={{ background: g.color + "22" }}
              >
                {g.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold truncate">
                  {t.title}
                </span>
                <span className="block text-xs text-ink-700/50 truncate">
                  {t.artist} · {g.label}
                </span>
              </span>
              <span className="text-brand font-bold text-lg">
                {picked ? "✓" : "+"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
