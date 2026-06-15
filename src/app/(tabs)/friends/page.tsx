"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import Character from "@/components/Character";
import { useAppStore } from "@/store/useAppStore";
import { GENRES } from "@/lib/genres";
import { matchPercent } from "@/lib/taste";
import { ROOMS } from "@/lib/mock";
import type { Friend } from "@/lib/types";

export default function FriendsPage() {
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);
  const taste = user?.tasteVector ?? {};
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  // 친구를 취향 일치도로 정렬 (1순위 = 취향, 친구는 2순위지만 목록 내부 정렬은 취향순)
  const ranked = useMemo(
    () =>
      friends
        .map((f) => ({
          ...f,
          matchPct: matchPercent(taste, { [f.topGenre]: 1 }),
        }))
        .sort((a, b) => b.matchPct - a.matchPct),
    [friends, taste]
  );

  // 추천: 룸에서 만난, 취향 비슷한 사람 (아직 친구 아님)
  const suggestions = useMemo(() => {
    const friendIds = new Set(friends.map((f) => f.userId));
    const seen = new Set<string>();
    const out: Friend[] = [];
    for (const r of ROOMS) {
      for (const m of r.members) {
        if (friendIds.has(m.userId) || seen.has(m.userId) || m.userId === "me")
          continue;
        seen.add(m.userId);
        out.push({
          userId: m.userId,
          handle: m.handle,
          topGenre: m.topGenre,
          status: "pending",
          matchPct: matchPercent(taste, { [m.topGenre]: 1 }),
        });
      }
    }
    return out.sort((a, b) => b.matchPct - a.matchPct).slice(0, 6);
  }, [friends, taste]);

  const inviteCode = (user?.handle ?? "DIGGER").toUpperCase().slice(0, 6) + "-7Z";
  const inviteLink = `https://digtown.vercel.app/invite/${inviteCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const filtered = ranked.filter((f) =>
    f.handle.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div>
      <TopBar title="친구" sub="취향이 통하는 사람을 발견해요" />

      {/* 검색 */}
      <div className="px-5">
        <div className="card px-4 py-3 flex items-center gap-2">
          <span className="text-ink-700/40">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="사용자 검색"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* 초대 */}
      <section className="px-5 mt-3">
        <div className="card p-4">
          <p className="text-sm font-bold text-ink-800">친구 초대</p>
          <p className="text-xs text-ink-700/50 mt-0.5">
            추천 코드 <span className="font-bold text-brand-dark">{inviteCode}</span>
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={copy} className="btn-primary flex-1 py-2.5 text-sm">
              {copied ? "복사됨 ✓" : "🔗 초대 링크 복사"}
            </button>
            <button className="btn-ghost py-2.5 text-sm">📇 연락처</button>
          </div>
        </div>
      </section>

      {/* 추천: 취향 매칭 */}
      {suggestions.length > 0 && (
        <section className="px-5 mt-4">
          <p className="font-bold text-ink-900 mb-2">🎯 취향이 비슷한 사람</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {suggestions.map((s) => (
              <div key={s.userId} className="card shrink-0 w-32 p-3 text-center">
                <Character genre={s.topGenre} size={56} animate={false} />
                <p className="font-bold text-sm mt-1 truncate">{s.handle}</p>
                <p className="text-[11px] text-ink-700/50">
                  {GENRES[s.topGenre].emoji} {s.matchPct}% 일치
                </p>
                <button
                  onClick={() => addFriend(s)}
                  className="mt-2 w-full rounded-xl bg-brand text-white text-xs font-bold py-1.5 active:scale-95 transition"
                >
                  + 친구
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 친구 목록 */}
      <section className="px-5 mt-4">
        <p className="font-bold text-ink-900 mb-2">내 친구 ({ranked.length})</p>
        <div className="space-y-2">
          {filtered.map((f) => (
            <div key={f.userId} className="card px-3 py-2.5 flex items-center gap-3">
              <Character genre={f.topGenre} size={44} animate={false} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{f.handle}</p>
                <p className="text-[11px] text-ink-700/50">
                  {GENRES[f.topGenre].emoji} {GENRES[f.topGenre].label} ·{" "}
                  {f.status === "pending" ? "요청 보냄" : "친구"}
                </p>
              </div>
              <span className="chip bg-brand/10 text-brand-dark font-bold">
                {f.matchPct}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
