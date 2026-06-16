import type { GenreId } from "./genres";
import type { Digg } from "./types";
import type { HatStyle, GlassesStyle } from "./appearance";

// 디깅 업적: 장르 청취/디깅 누적 → 달성 시 보상 아이템(모자/안경) 착용 가능

export interface AchvStats {
  genre: Record<string, number>; // 장르별 (청취+디깅) 횟수
  diggs: number;
  distinct: number; // 디깅한 장르 수
  level: number;
}

export interface Reward {
  slot: "hat" | "glasses";
  value: HatStyle | GlassesStyle;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  goal: number;
  reward?: Reward;
  measure: (s: AchvStats) => number;
}

// 장르 마스터 (장르별 청취/디깅 누적 → 관련 아이템 해금)
const GENRE_ACHV: { g: GenreId; title: string; icon: string; reward: Reward }[] = [
  { g: "jazz", title: "재즈 디깅러", icon: "🎷", reward: { slot: "hat", value: "fedora" } },
  { g: "citypop", title: "네온 시티", icon: "🌃", reward: { slot: "glasses", value: "sun" } },
  { g: "lofi", title: "로파이 마스터", icon: "🌧️", reward: { slot: "hat", value: "beanie" } },
  { g: "house", title: "댄스 플로어", icon: "🪩", reward: { slot: "glasses", value: "star" } },
  { g: "kpop", title: "최애 덕질", icon: "💖", reward: { slot: "hat", value: "flower" } },
  { g: "classical", title: "클래식 애호가", icon: "🎻", reward: { slot: "glasses", value: "round" } },
  { g: "metal", title: "헤드뱅어", icon: "🤘", reward: { slot: "hat", value: "headphones" } },
  { g: "rnb", title: "소울풀", icon: "🍷", reward: { slot: "hat", value: "cap" } },
];

export const ACHIEVEMENTS: Achievement[] = [
  ...GENRE_ACHV.map((a) => ({
    id: `genre_${a.g}`,
    title: a.title,
    desc: `${a.title} 곡 3회 청취·디깅`,
    icon: a.icon,
    goal: 3,
    reward: a.reward,
    measure: (s: AchvStats) => s.genre[a.g] ?? 0,
  })),
  { id: "first_digg", title: "첫 디깅", desc: "첫 곡을 디깅함에 저장", icon: "💾", goal: 1, measure: (s) => s.diggs },
  { id: "digg_10", title: "디깅 수집가", desc: "곡 10개 디깅", icon: "📀", goal: 10, measure: (s) => s.diggs },
  { id: "digg_30", title: "디깅 헤드", desc: "곡 30개 디깅", icon: "🏆", goal: 30, measure: (s) => s.diggs },
  { id: "explorer", title: "장르 탐험가", desc: "5개 장르 디깅", icon: "🧭", goal: 5, measure: (s) => s.distinct },
  { id: "level_5", title: "디깅 레벨 5", desc: "레벨 5 달성", icon: "⭐", goal: 5, measure: (s) => s.level },
];

export function buildStats(
  listenEvents: { genre: string }[],
  diggs: Digg[],
  level: number
): AchvStats {
  const genre: Record<string, number> = {};
  for (const e of listenEvents) genre[e.genre] = (genre[e.genre] ?? 0) + 1;
  const diggedGenres = new Set<string>();
  for (const d of diggs) {
    genre[d.track.genre] = (genre[d.track.genre] ?? 0) + 1;
    diggedGenres.add(d.track.genre);
  }
  return { genre, diggs: diggs.length, distinct: diggedGenres.size, level };
}

export function isDone(a: Achievement, s: AchvStats) {
  return a.measure(s) >= a.goal;
}
