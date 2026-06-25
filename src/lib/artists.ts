import type { GenreId } from "./genres";
import type { Track } from "./types";

// 온보딩 취향 입력 — '곡' 대신 '아티스트'를 고른다.
// 큐레이션 아티스트(장르 태그). 선택한 아티스트들의 장르로 취향 벡터를 만든다.
export interface SeedArtist {
  name: string;
  genre: GenreId;
}

export const ARTISTS: SeedArtist[] = [
  // K-팝
  { name: "NewJeans", genre: "kpop" },
  { name: "IVE", genre: "kpop" },
  { name: "aespa", genre: "kpop" },
  { name: "SEVENTEEN", genre: "kpop" },
  { name: "LE SSERAFIM", genre: "kpop" },
  { name: "BTS", genre: "kpop" },
  // 힙합
  { name: "BIG Naughty", genre: "hiphop" },
  { name: "MIRANI", genre: "hiphop" },
  { name: "ZICO", genre: "hiphop" },
  { name: "박재범", genre: "hiphop" },
  { name: "pH-1", genre: "hiphop" },
  // R&B
  { name: "DEAN", genre: "rnb" },
  { name: "Crush", genre: "rnb" },
  { name: "WOODZ", genre: "rnb" },
  { name: "Heize", genre: "rnb" },
  { name: "죠지", genre: "rnb" },
  // 발라드
  { name: "임영웅", genre: "ballad" },
  { name: "폴킴", genre: "ballad" },
  { name: "성시경", genre: "ballad" },
  { name: "이무진", genre: "ballad" },
  { name: "임한별", genre: "ballad" },
  // 인디
  { name: "잔나비", genre: "indie" },
  { name: "멜로망스", genre: "indie" },
  { name: "AKMU", genre: "indie" },
  { name: "검정치마", genre: "indie" },
  { name: "새소년", genre: "indie" },
  // 팝
  { name: "Harry Styles", genre: "pop" },
  { name: "Sabrina Carpenter", genre: "pop" },
  { name: "Olivia Rodrigo", genre: "pop" },
  { name: "Bruno Mars", genre: "pop" },
  { name: "Dua Lipa", genre: "pop" },
  // EDM
  { name: "Daft Punk", genre: "edm" },
  { name: "Calvin Harris", genre: "edm" },
  { name: "Marshmello", genre: "edm" },
  { name: "Zedd", genre: "edm" },
  // 시티팝
  { name: "Mariya Takeuchi", genre: "citypop" },
  { name: "Tatsuro Yamashita", genre: "citypop" },
  { name: "Anri", genre: "citypop" },
];

/** 아티스트 검색(이름/장르) */
export function searchArtists(q: string): SeedArtist[] {
  const s = q.trim().toLowerCase();
  if (!s) return ARTISTS;
  return ARTISTS.filter((a) => a.name.toLowerCase().includes(s) || a.genre.includes(s));
}

/** 선택 아티스트 → 취향 벡터 시드용 의사 트랙 (장르만 사용) */
export function artistToSeed(a: SeedArtist): Track {
  return {
    id: `artist_${a.name}`,
    title: a.name,
    artist: a.name,
    genre: a.genre,
    durationSec: 0,
    previewUrl: "",
    artwork: "",
  };
}
