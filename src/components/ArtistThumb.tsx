"use client";

import { useEffect, useState } from "react";
import { searchTracks } from "@/lib/music";
import { genre as genreOf } from "@/lib/genres";

// 아티스트 썸네일 — iTunes 아트워크(캐시), 없으면 장르 이모지 폴백.
const thumbCache = new Map<string, string>();

export default function ArtistThumb({
  name,
  genre,
  size = 56,
}: {
  name: string;
  genre: string;
  size?: number;
}) {
  const [art, setArt] = useState<string | null>(thumbCache.get(name) ?? null);

  useEffect(() => {
    if (thumbCache.has(name)) {
      setArt(thumbCache.get(name) || null);
      return;
    }
    let active = true;
    searchTracks(name)
      .then((tracks) => {
        const url = tracks.find((t) => t.artwork)?.artwork ?? "";
        thumbCache.set(name, url);
        if (active) setArt(url || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [name]);

  const g = genreOf(genre);
  return (
    <div
      className="rounded-full overflow-hidden grid place-items-center shrink-0"
      style={{ width: size, height: size, background: g.color + "22" }}
    >
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <span style={{ fontSize: size * 0.42 }}>{g.emoji}</span>
      )}
    </div>
  );
}
