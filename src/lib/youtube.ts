import type { Track } from "./types";
import { searchCatalog } from "./catalog";
import type { GenreId } from "./genres";

// 곡 검색: YOUTUBE_API_KEY가 있으면 실제 YouTube Data API, 없으면 내장 데모 카탈로그.
const KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

function guessGenre(text: string): GenreId {
  const s = text.toLowerCase();
  if (/(jazz|재즈)/.test(s)) return "jazz";
  if (/(city ?pop|시티팝|シティ)/.test(s)) return "citypop";
  if (/(lo-?fi|로파이|chill)/.test(s)) return "lofi";
  if (/(metal|메탈|rock)/.test(s)) return "metal";
  if (/(k-?pop|케이팝|bts|blackpink|newjeans)/.test(s)) return "kpop";
  if (/(r&b|rnb|소울|soul)/.test(s)) return "rnb";
  if (/(house|하우스|edm|techno)/.test(s)) return "house";
  if (/(classic|클래식|piano|chopin)/.test(s)) return "classical";
  return "lofi";
}

export async function searchTracks(q: string): Promise<Track[]> {
  if (!KEY) return searchCatalog(q);
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=12&q=${encodeURIComponent(
      q
    )}&key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) return searchCatalog(q);
    const data = await res.json();
    return (data.items ?? []).map((it: any): Track => ({
      videoId: it.id.videoId,
      title: it.snippet.title,
      artist: it.snippet.channelTitle,
      genre: guessGenre(`${it.snippet.title} ${it.snippet.channelTitle}`),
      durationSec: 240,
    }));
  } catch {
    return searchCatalog(q);
  }
}
