import type { Track } from "./types";

// 데모 곡 카탈로그.
// - 온보딩 "취향 3곡" 검색, 룸 협업 큐 곡 제안의 후보로 사용.
// - videoId는 YouTube IFrame Player에 그대로 전달된다. (일부는 지역/삭제로 재생 불가할 수 있음 — 데모 한정)
// - YOUTUBE_API_KEY가 있으면 실제 검색으로 대체된다(lib/youtube.ts).
export const CATALOG: Track[] = [
  // lofi
  { videoId: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to relax/study to", artist: "Lofi Girl", genre: "lofi", durationSec: 240 },
  { videoId: "4xDzrJKXOOY", title: "synthwave radio - beats to chill/game to", artist: "Lofi Girl", genre: "lofi", durationSec: 240 },
  { videoId: "rUxyKA_-grg", title: "lofi hip hop radio - beats to sleep/chill to", artist: "Lofi Girl", genre: "lofi", durationSec: 240 },
  // citypop
  { videoId: "3iXKZsDdYrU", title: "Plastic Love", artist: "Mariya Takeuchi", genre: "citypop", durationSec: 287 },
  { videoId: "9Gj47G2e1Jc", title: "Stay With Me", artist: "Miki Matsubara", genre: "citypop", durationSec: 295 },
  { videoId: "1nCqRmx3Dnw", title: "真夜中のドア / Stay With Me", artist: "Miki Matsubara", genre: "citypop", durationSec: 280 },
  // jazz
  { videoId: "Dx5qFachd3A", title: "Relaxing Jazz Piano", artist: "Cafe Music BGM", genre: "jazz", durationSec: 300 },
  { videoId: "neV3EPgvZ3g", title: "Smooth Jazz - Night Lounge", artist: "Jazz Cafe", genre: "jazz", durationSec: 300 },
  { videoId: "fEvM-OUbaKs", title: "Take Five", artist: "Dave Brubeck", genre: "jazz", durationSec: 324 },
  // metal
  { videoId: "CD-E-LDc384", title: "Enter Sandman", artist: "Metallica", genre: "metal", durationSec: 332 },
  { videoId: "WM8bTdBs-cw", title: "Chop Suey!", artist: "System Of A Down", genre: "metal", durationSec: 210 },
  // kpop
  { videoId: "gdZLi9oWNZg", title: "Dynamite", artist: "BTS", genre: "kpop", durationSec: 199 },
  { videoId: "POe9SOEKotk", title: "Hype Boy", artist: "NewJeans", genre: "kpop", durationSec: 178 },
  { videoId: "Amq-qlqbjYA", title: "How You Like That", artist: "BLACKPINK", genre: "kpop", durationSec: 182 },
  // rnb
  { videoId: "QcIy9NiNbmo", title: "Bad Guy", artist: "Billie Eilish", genre: "rnb", durationSec: 194 },
  { videoId: "ZbZSe6N_BXs", title: "Happy", artist: "Pharrell Williams", genre: "rnb", durationSec: 233 },
  // house
  { videoId: "wAPCSnAhhC8", title: "One More Time", artist: "Daft Punk", genre: "house", durationSec: 320 },
  { videoId: "K0HSDIfd4lc", title: "Around the World", artist: "Daft Punk", genre: "house", durationSec: 250 },
  // classical
  { videoId: "9E6b3swbnWg", title: "Clair de Lune", artist: "Claude Debussy", genre: "classical", durationSec: 300 },
  { videoId: "rOjHhS5MtvA", title: "Nocturne Op.9 No.2", artist: "Frédéric Chopin", genre: "classical", durationSec: 270 },
];

export function searchCatalog(q: string): Track[] {
  const s = q.trim().toLowerCase();
  if (!s) return CATALOG.slice(0, 10);
  return CATALOG.filter(
    (t) =>
      t.title.toLowerCase().includes(s) ||
      t.artist.toLowerCase().includes(s) ||
      t.genre.includes(s)
  );
}

export function trackByVideoId(id: string): Track | undefined {
  return CATALOG.find((t) => t.videoId === id);
}

export function randomTrack(): Track {
  // 결정적 의사난수 대신 시간 기반(클라이언트에서만 호출)
  const i = Math.floor((Date.now() / 1000) % CATALOG.length);
  return CATALOG[i];
}
