import type { Track } from "./types";

// 오프라인/에러 폴백용 정적 카탈로그.
// 실제 재생/검색은 iTunes Search API(lib/music.ts)가 담당한다.
// 여기 곡들은 홈 룸카드 라벨·취향 벡터 시드 표시에만 쓰이며 previewUrl이 없으면 재생되지 않는다.
const t = (
  id: string,
  title: string,
  artist: string,
  genre: Track["genre"]
): Track => ({ id, title, artist, genre, durationSec: 30, previewUrl: "", artwork: "" });

export const CATALOG: Track[] = [
  t("c_lofi_1", "Lofi Beats", "Lofi Girl", "lofi"),
  t("c_lofi_2", "Rainy Study", "Chillhop", "lofi"),
  t("c_citypop_1", "Plastic Love", "Mariya Takeuchi", "citypop"),
  t("c_citypop_2", "Stay With Me", "Miki Matsubara", "citypop"),
  t("c_jazz_1", "Take Five", "Dave Brubeck", "jazz"),
  t("c_jazz_2", "Smooth Night Jazz", "Jazz Cafe", "jazz"),
  t("c_metal_1", "Enter Sandman", "Metallica", "metal"),
  t("c_kpop_1", "Dynamite", "BTS", "kpop"),
  t("c_kpop_2", "Hype Boy", "NewJeans", "kpop"),
  t("c_rnb_1", "Happy", "Pharrell Williams", "rnb"),
  t("c_house_1", "One More Time", "Daft Punk", "house"),
  t("c_classical_1", "Clair de Lune", "Claude Debussy", "classical"),
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
