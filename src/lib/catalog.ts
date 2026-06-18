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
  t("c_kpop_1", "Hype Boy", "NewJeans", "kpop"),
  t("c_kpop_2", "Magnetic", "ILLIT", "kpop"),
  t("c_hiphop_1", "VVS", "MIRANI", "hiphop"),
  t("c_hiphop_2", "Sino", "BIG Naughty", "hiphop"),
  t("c_rnb_1", "Drowning", "WOODZ", "rnb"),
  t("c_rnb_2", "Eung Eung", "DEAN", "rnb"),
  t("c_ballad_1", "사랑은 늘 도망가", "임영웅", "ballad"),
  t("c_ballad_2", "이별 후회", "임한별", "ballad"),
  t("c_indie_1", "주저하는 연인들을 위해", "잔나비", "indie"),
  t("c_indie_2", "사랑인가 봐", "멜로망스", "indie"),
  t("c_pop_1", "As It Was", "Harry Styles", "pop"),
  t("c_pop_2", "Espresso", "Sabrina Carpenter", "pop"),
  t("c_edm_1", "One More Time", "Daft Punk", "edm"),
  t("c_citypop_1", "Plastic Love", "Mariya Takeuchi", "citypop"),
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
