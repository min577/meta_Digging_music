import { GENRE_LIST, normalizeGenre, type GenreId } from "./genres";
import { CATALOG } from "./catalog";
import { appearanceFromSeed, type Appearance } from "./appearance";
import type { Track, TasteVector } from "./types";

// 다른 사람(친구/추천) 프로필을 핸들+대표장르로 결정적으로 합성한다.
// (데모: 좋아하는 장르 분포 · 프로필 뮤직 · 플레이리스트)

function seedNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface PersonProfile {
  handle: string;
  topGenre: GenreId;
  appearance: Appearance;
  taste: TasteVector;
  profileTrack: Track | null; // 프로필 뮤직
  playlist: Track[];
}

export function personProfile(handle: string, rawTopGenre: GenreId): PersonProfile {
  const topGenre = normalizeGenre(rawTopGenre);
  const h = seedNum(handle);
  const others = GENRE_LIST.map((g) => g.id).filter((g) => g !== topGenre);
  const s1 = others[h % others.length];
  const s2 = others[(h >> 3) % others.length];

  const taste: TasteVector = {};
  taste[topGenre] = 0.55;
  taste[s1] = (taste[s1] ?? 0) + 0.28;
  taste[s2] = (taste[s2] ?? 0) + 0.17;
  const sum = Object.values(taste).reduce((a, b) => a + (b ?? 0), 0);
  for (const k of Object.keys(taste) as GenreId[]) taste[k] = +((taste[k] ?? 0) / sum).toFixed(3);

  const genreTracks = CATALOG.filter((t) => t.genre === topGenre);
  const profileTrack = genreTracks.length
    ? genreTracks[h % genreTracks.length]
    : CATALOG[0] ?? null;

  const playlist = [
    ...genreTracks,
    ...CATALOG.filter((t) => t.genre === s1),
    ...CATALOG.filter((t) => t.genre === s2),
  ]
    .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
    .slice(0, 5);

  return {
    handle,
    topGenre,
    appearance: appearanceFromSeed(handle),
    taste,
    profileTrack,
    playlist,
  };
}
