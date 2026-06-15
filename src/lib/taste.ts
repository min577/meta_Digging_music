import type { GenreId } from "./genres";
import { GENRE_LIST } from "./genres";
import type { TasteVector, Track } from "./types";

/** 두 취향 벡터의 코사인 유사도 (0~1). 기획서 5장·6장 핵심 정렬 기준. */
export function cosineSimilarity(a: TasteVector, b: TasteVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const g of GENRE_LIST) {
    const x = a[g.id] ?? 0;
    const y = b[g.id] ?? 0;
    dot += x * y;
    magA += x * x;
    magB += y * y;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** 취향 일치도 퍼센트 (UI 표시용) */
export function matchPercent(a: TasteVector, b: TasteVector): number {
  return Math.round(cosineSimilarity(a, b) * 100);
}

/** 곡 목록 -> 장르 비율 벡터 (합=1). 온보딩 3곡 / 룸 큐 분포에 사용. */
export function vectorFromTracks(tracks: Pick<Track, "genre">[]): TasteVector {
  if (tracks.length === 0) return {};
  const counts: Partial<Record<GenreId, number>> = {};
  for (const t of tracks) {
    counts[t.genre] = (counts[t.genre] ?? 0) + 1;
  }
  const total = tracks.length;
  const vec: TasteVector = {};
  for (const [g, c] of Object.entries(counts)) {
    vec[g as GenreId] = +(c! / total).toFixed(3);
  }
  return vec;
}

/** 기존 벡터에 새 청취 1건을 EMA로 반영 (취향 벡터 업데이트) */
export function updateVector(
  prev: TasteVector,
  genre: GenreId,
  alpha = 0.08
): TasteVector {
  const next: TasteVector = {};
  let sum = 0;
  for (const g of GENRE_LIST) {
    const base = (prev[g.id] ?? 0) * (1 - alpha) + (g.id === genre ? alpha : 0);
    if (base > 0) {
      next[g.id] = base;
      sum += base;
    }
  }
  // 정규화
  if (sum > 0) {
    for (const k of Object.keys(next) as GenreId[]) {
      next[k] = +(next[k]! / sum).toFixed(3);
    }
  }
  return next;
}

/** 벡터의 대표(최상위) 장르 */
export function topGenre(vec: TasteVector): GenreId {
  let best: GenreId = "lofi";
  let max = -1;
  for (const [g, v] of Object.entries(vec)) {
    if ((v ?? 0) > max) {
      max = v!;
      best = g as GenreId;
    }
  }
  return best;
}

/** 정렬용: 내림차순 [장르, 비율] 배열 */
export function sortedGenres(vec: TasteVector): [GenreId, number][] {
  return (Object.entries(vec) as [GenreId, number][]).sort(
    (a, b) => b[1] - a[1]
  );
}
