"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import ProfileSheet from "@/components/ProfileSheet";
import CoachTour, { type TourStep } from "@/components/CoachTour";
import { appearanceFromSeed } from "@/lib/appearance";
import { useAppStore } from "@/store/useAppStore";
import { genre as genreOf, type GenreId } from "@/lib/genres";
import { matchPercent } from "@/lib/taste";
import { ROOMS } from "@/lib/mock";
import type { Friend } from "@/lib/types";

const FRIENDS_TOUR: TourStep[] = [
  { target: "friends-suggest", title: "취향이 비슷한 사람", desc: "취향 일치도 순으로 추천돼요. 카드를 누르면 상대의 좋아하는 장르·프로필 뮤직·플레이리스트를 볼 수 있어요." },
  { target: "friends-invite", title: "친구 초대", desc: "초대 링크를 공유해 친구를 데려오고, 같이 들으러 가요." },
];

export default function FriendsPage() {
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);
  const taste = user?.tasteVector ?? {};
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const [suggestOffset, setSuggestOffset] = useState(0);
  const [selected, setSelected] = useState<{ handle: string; topGenre: GenreId; isFriend: boolean; addable?: Friend } | null>(null);

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

  // 추천 후보: 룸에서 만난, 취향 비슷한 사람 (아직 친구 아님) — 취향 일치순 전체 풀
  const candidates = useMemo(() => {
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
    return out.sort((a, b) => b.matchPct - a.matchPct);
  }, [friends, taste]);

  // 새로고침으로 6명씩 다른 사람 노출 (풀을 순환)
  const suggestions = useMemo(() => {
    const n = candidates.length;
    if (n === 0) return [];
    const take = Math.min(6, n);
    return Array.from({ length: take }, (_, i) => candidates[(suggestOffset + i) % n]);
  }, [candidates, suggestOffset]);
  const refreshSuggest = () => setSuggestOffset((o) => o + 6);

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
      <CoachTour tourKey="friends" steps={FRIENDS_TOUR} />
      <TopBar title="친구" sub="취향이 통하는 사람을 발견해요" />

      {/* 검색 */}
      <div className="px-5">
        <div className="card px-4 py-3 flex items-center gap-2">
          <Icon name="search" size={16} className="text-ink-700/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="사용자 검색"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* 초대 */}
      <section data-tour="friends-invite" className="px-5 mt-3">
        <div className="card p-4">
          <p className="text-sm font-bold text-ink-800">친구 초대</p>
          <p className="text-xs text-ink-700/50 mt-0.5">
            추천 코드 <span className="font-bold text-brand-dark">{inviteCode}</span>
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={copy} className="btn-primary btn-sm flex-1">
              {copied ? "복사됨 ✓" : "초대 링크 복사"}
            </button>
            <button className="btn-ghost btn-sm">연락처</button>
          </div>
        </div>
      </section>

      {/* 추천: 취향 매칭 */}
      {suggestions.length > 0 && (
        <section data-tour="friends-suggest" className="px-5 mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-ink-900 flex items-center gap-1.5">
              <Icon name="target" size={16} strokeWidth={2.1} className="text-brand-dark" /> 취향이 비슷한 사람
            </p>
            {candidates.length > 6 && (
              <button
                onClick={refreshSuggest}
                className="chip bg-cream-100 text-ink-700 font-bold py-1 px-2.5 inline-flex items-center gap-1 active:scale-95 transition"
              >
                <Icon name="refresh" size={13} /> 새로고침
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {suggestions.map((s) => (
              <div key={s.userId} className="card shrink-0 w-32 p-3 text-center">
                <button
                  onClick={() => setSelected({ handle: s.handle, topGenre: s.topGenre, isFriend: false, addable: s })}
                  className="w-full flex flex-col items-center active:scale-95 transition"
                >
                  <Avatar appearance={appearanceFromSeed(s.handle)} size={56} bob={false} />
                  <p className="font-bold text-sm mt-1 truncate w-full">{s.handle}</p>
                  <p className="text-[11px] text-ink-700/50">
                    {genreOf(s.topGenre).emoji} {s.matchPct}% 일치
                  </p>
                </button>
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
            <button
              key={f.userId}
              onClick={() =>
                setSelected({
                  handle: f.handle,
                  topGenre: f.topGenre,
                  isFriend: f.status === "accepted",
                  addable: f.status === "pending" ? f : undefined,
                })
              }
              className="w-full card px-3 py-2.5 flex items-center gap-3 text-left active:scale-[0.99] transition"
            >
              <Avatar appearance={appearanceFromSeed(f.handle)} size={44} bob={false} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{f.handle}</p>
                <p className="text-[11px] text-ink-700/50">
                  {genreOf(f.topGenre).emoji} {genreOf(f.topGenre).label} ·{" "}
                  {f.status === "pending" ? "요청 보냄" : "친구"}
                </p>
              </div>
              <span className="chip bg-brand/10 text-brand-dark font-bold">
                {f.matchPct}%
              </span>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <ProfileSheet
          handle={selected.handle}
          topGenre={selected.topGenre}
          myTaste={taste}
          isFriend={selected.isFriend}
          onAddFriend={selected.addable ? () => addFriend(selected.addable!) : undefined}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
