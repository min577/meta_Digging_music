import type { Track } from "./types";
import type { GenreId } from "./genres";
import { searchCatalog } from "./catalog";

// iTunes Search API — API 키 불필요, 브라우저 직접 호출(CORS 허용).
// 30초 미리듣기(previewUrl) + 앨범아트 + 아티스트 + 장르를 제공한다. (MVP 음원 소스)
const ENDPOINT = "https://itunes.apple.com/search";

// 룸/장르별로 곡을 가져올 때 쓰는 검색어
const GENRE_TERM: Record<GenreId, string> = {
  kpop: "k-pop",
  hiphop: "korean hip hop",
  rnb: "korean r&b",
  ballad: "korean ballad",
  indie: "korean indie",
  pop: "pop hits",
  edm: "edm dance",
  citypop: "city pop",
};

// iTunes primaryGenreName + 텍스트로 우리 GenreId 추정 (구체 장르 → 일반 장르 순)
function guessGenre(text: string): GenreId {
  const s = text.toLowerCase();
  if (/(city ?pop|시티팝|シティ)/.test(s)) return "citypop";
  if (/(k-?pop|케이팝|아이돌)/.test(s)) return "kpop";
  if (/(hip ?hop|hip-hop|\brap\b|랩|힙합)/.test(s)) return "hiphop";
  if (/(ballad|발라드)/.test(s)) return "ballad";
  if (/(r&b|r ?and ?b|soul|소울|알앤비)/.test(s)) return "rnb";
  if (/(indie|인디|acoustic|어쿠스틱|밴드|\bband\b|folk)/.test(s)) return "indie";
  if (/(edm|house|electronic|electro|techno|dance|하우스|일렉)/.test(s)) return "edm";
  if (/(pop|팝)/.test(s)) return "pop";
  return "pop";
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
  // 한국 스토어(K-pop/힙합/가요 + 미리듣기). lang=ko_kr 로 한글 메타.
  const url = `${ENDPOINT}?term=${encodeURIComponent(
    term
  )}&media=music&entity=song&limit=${limit}&country=KR&lang=ko_kr`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

/** 곡 검색 (온보딩 취향 3곡 · 룸 곡 제안) */
export async function searchTracks(q: string): Promise<Track[]> {
  const term = q.trim() || "pop hits";
  try {
    const items = await fetchITunes(term, 14);
    const tracks = items.map((it) => mapItem(it)).filter(Boolean) as Track[];
    return tracks.length ? tracks : searchCatalog(q);
  } catch {
    return searchCatalog(q); // 오프라인/에러 시 데모 카탈로그 폴백
  }
}

/** 검색어 기반 실제 곡 목록 (장소 음악 존 · 상황별 플레이리스트) */
export async function tracksByTerm(term: string, limit = 4): Promise<Track[]> {
  try {
    const items = await fetchITunes(term, limit + 4);
    const tracks = items.map((it) => mapItem(it)).filter(Boolean) as Track[];
    return tracks.slice(0, limit);
  } catch {
    return searchCatalog(term).slice(0, limit);
  }
}

export type ChartCountry = "kr" | "us";

// trackId 다건을 lookup으로 조회 → previewUrl/artwork 매핑
async function lookupPreviews(
  ids: (string | number)[],
  country: ChartCountry
): Promise<Record<string, { previewUrl: string; artwork: string }>> {
  const out: Record<string, { previewUrl: string; artwork: string }> = {};
  const CH = 100; // lookup은 콤마구분 다건 지원
  for (let i = 0; i < ids.length; i += CH) {
    const slice = ids.slice(i, i + CH).join(",");
    try {
      const res = await fetch(
        `${"https://itunes.apple.com/lookup"}?id=${slice}&country=${country.toUpperCase()}&entity=song`
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const it of data.results ?? []) {
        if (it.previewUrl)
          out[String(it.trackId)] = {
            previewUrl: it.previewUrl,
            artwork: it.artworkUrl100 ?? "",
          };
      }
    } catch {
      /* 무시하고 다음 청크 */
    }
  }
  return out;
}

/**
 * 인기차트 (most-played) — 현재 차트 순서.
 * 1) Apple Marketing Tools 피드로 최신 차트 순서+메타 → 2) lookup으로 30초 미리듣기 결합.
 * 실패 시 Search API 폴백(재생은 되나 진짜 차트 순서는 아님).
 */
export async function topChart(
  limit = 30,
  country: ChartCountry = "kr"
): Promise<Track[]> {
  try {
    const feed = `https://rss.applemarketingtools.com/api/v2/${country}/music/most-played/${limit}/songs.json`;
    const res = await fetch(feed);
    if (res.ok) {
      const data = await res.json();
      const results: any[] = data?.feed?.results ?? [];
      if (results.length) {
        const ids = results.map((r) => r.id).filter(Boolean);
        const previews = await lookupPreviews(ids, country);
        const tracks = results
          .map((r) => {
            const pv = previews[String(r.id)];
            const art = (r.artworkUrl100 ?? pv?.artwork ?? "").replace("100x100", "300x300");
            return {
              id: String(r.id),
              title: r.name ?? "Unknown",
              artist: r.artistName ?? "Unknown",
              genre: guessGenre(`${r.genres?.[0]?.name ?? ""} ${r.name ?? ""}`),
              durationSec: 30,
              previewUrl: pv?.previewUrl ?? "",
              artwork: art,
            } as Track;
          })
          .filter((t) => t.previewUrl); // 재생 가능한 곡만(순위 유지)
        if (tracks.length) return tracks;
      }
    }
  } catch {
    /* 폴백으로 */
  }
  // 폴백: 인기 검색어 기반(차트 피드 차단/오프라인 시)
  return tracksByTerm(country === "kr" ? "korea top hits" : "top hits", limit);
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
