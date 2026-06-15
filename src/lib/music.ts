import type { Track } from "./types";
import type { GenreId } from "./genres";
import { searchCatalog } from "./catalog";

// iTunes Search API — API 키 불필요, 브라우저 직접 호출(CORS 허용).
// 30초 미리듣기(previewUrl) + 앨범아트 + 아티스트 + 장르를 제공한다. (MVP 음원 소스)
const ENDPOINT = "https://itunes.apple.com/search";

// 룸/장르별로 곡을 가져올 때 쓰는 검색어
const GENRE_TERM: Record<GenreId, string> = {
  jazz: "jazz",
  citypop: "city pop",
  lofi: "lofi hip hop",
  metal: "heavy metal",
  kpop: "k-pop",
  rnb: "r&b soul",
  house: "house dance",
  classical: "classical piano",
};

// iTunes primaryGenreName + 텍스트로 우리 GenreId 추정
function guessGenre(text: string): GenreId {
  const s = text.toLowerCase();
  if (/(jazz|재즈)/.test(s)) return "jazz";
  if (/(k-?pop|케이팝)/.test(s)) return "kpop";
  if (/(metal|메탈|hard ?rock)/.test(s)) return "metal";
  if (/(classical|클래식|piano|orchestr)/.test(s)) return "classical";
  if (/(r&b|r ?and ?b|soul|소울)/.test(s)) return "rnb";
  if (/(house|dance|electronic|edm|techno|하우스)/.test(s)) return "house";
  if (/(city ?pop|시티팝|シティ)/.test(s)) return "citypop";
  if (/(lo-?fi|lofi|chill|로파이)/.test(s)) return "lofi";
  return "lofi";
}

function mapItem(it: any, genreHint?: GenreId): Track | null {
  if (!it.previewUrl || !it.trackId) return null;
  return {
    id: String(it.trackId),
    title: it.trackName ?? "Unknown",
    artist: it.artistName ?? "Unknown",
    genre: genreHint ?? guessGenre(`${it.primaryGenreName} ${it.trackName}`),
    durationSec: 30,
    previewUrl: it.previewUrl,
    // 100x100 → 300x300 로 업스케일
    artwork: (it.artworkUrl100 ?? "").replace("100x100", "300x300"),
  };
}

async function fetchITunes(term: string, limit: number): Promise<any[]> {
  const url = `${ENDPOINT}?term=${encodeURIComponent(
    term
  )}&media=music&entity=song&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

/** 곡 검색 (온보딩 취향 3곡 · 룸 곡 제안) */
export async function searchTracks(q: string): Promise<Track[]> {
  const term = q.trim() || "lofi";
  try {
    const items = await fetchITunes(term, 14);
    const tracks = items.map((it) => mapItem(it)).filter(Boolean) as Track[];
    return tracks.length ? tracks : searchCatalog(q);
  } catch {
    return searchCatalog(q); // 오프라인/에러 시 데모 카탈로그 폴백
  }
}

/** 장르별 재생 목록 (룸 입장 시 초기 곡 + 큐 시드) */
export async function tracksByGenre(
  genre: GenreId,
  limit = 6
): Promise<Track[]> {
  try {
    const items = await fetchITunes(GENRE_TERM[genre], limit + 4);
    const tracks = items
      .map((it) => mapItem(it, genre))
      .filter(Boolean) as Track[];
    return tracks.slice(0, limit);
  } catch {
    return searchCatalog(genre).slice(0, limit);
  }
}
