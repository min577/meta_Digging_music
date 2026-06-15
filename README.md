# 🎧 DigTown · 디깅타운

> **"혼자 듣지 마세요."** 전 세계 사람들과 같은 곡을 동시에 들으며, 내 캐릭터로 취향을 표현하고, 취향이 비슷한 사람을 발견하는 **음악 디깅 메타버스.**
>
> Focustown이 "함께 공부"라면, DigTown은 **"함께 디깅"**. (KHUX Team C IA 기반)

`디깅타운_기획서.md` 의 Phase 0~7 을 모두 구현한 MVP입니다.

---

## ✨ 구현된 기능 (기획서 매핑)

| Phase | 내용 | 위치 |
|---|---|---|
| **0** | Next.js 14(App Router)+TS+Tailwind+Framer Motion+Zustand, 하단탭(홈/상점/친구/프로필), Supabase 클라이언트 | `src/lib/supabase/*`, `src/components/BottomNav.tsx` |
| **1** | 온보딩 3스텝(캐릭터·자주 듣는 상황·취향 3곡) → `taste_vector` 생성 | `src/app/onboarding/page.tsx` |
| **2** | 홈 탐색 — 무드 공간 캐러셀 + 인기 라이브 룸, **취향 일치순(코사인) 정렬**, 테마 필터 | `src/app/(tabs)/home/page.tsx`, `src/lib/taste.ts` |
| **3** | 리스닝 파티 룸 — **YouTube IFrame 동기화 재생** + Supabase Realtime broadcast/presence, **협업 큐(좋아요순)**, 채팅, 하트/이모지 반응, 디깅함 저장 | `src/app/room/[id]/page.tsx`, `src/components/YouTubePlayer.tsx`, `src/hooks/useRoomSession.ts` |
| **4** | 캐릭터 시스템 — 장르별 외형/이펙트, BPM idle 애니메이션, 진화 단계 | `src/components/Character.tsx` |
| **5** | 디깅함 컬렉션 · 취향 리포트(장르 분포·시간대 패턴) · 아티스트별 청취 랭킹 | `src/app/(tabs)/profile/page.tsx` |
| **6** | 디깅 퀘스트 — 무드 선택(후궁선택 분기) · 협동 미션(방탈출) · 데일리 | `src/app/(tabs)/quests/page.tsx` |
| **7** | 상점(구매 확인 모달) · 친구(검색·초대·취향 매칭) · 예약형 파티 · 룸 만들기 | `src/app/(tabs)/shop`, `friends`, `src/app/room/create` |

**설계 북극성:** 룸/사람/매칭의 1순위 정렬 기준은 항상 **취향 일치도**(`cosineSimilarity`). 친구는 2순위.

---

## 🚀 빠른 시작

```bash
npm install
cp .env.local.example .env.local   # (선택) Supabase 키 입력
npm run dev                        # http://localhost:3000
```

> **키 없이도 즉시 실행됩니다.** `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` 가 비어 있으면
> 자동으로 **데모 모드**(로컬 상태 + 룸 동기화 시뮬레이션)로 동작합니다.
> 키를 넣으면 동일 코드가 **실연동 모드**(Auth·DB·Realtime)로 전환됩니다.

---

## 🔌 Supabase 실연동

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. **SQL Editor** 에 아래 두 파일을 순서대로 실행
   - `supabase/migrations/0001_init.sql` (스키마 + RLS + 트리거 + Realtime publication)
   - `supabase/seed.sql` (무드 공간 시드)
3. **Settings → API** 에서 URL / anon key 복사 → `.env.local`
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. **Authentication → Providers → Google** 활성화 (소셜 로그인)
   - Redirect URL: `https://<your-domain>/auth/callback`

스키마는 기획서 6장(users / characters / locations / rooms / room_members / room_queue /
diggs / listen_events / badges / quests / friendships)을 그대로 따릅니다.
RLS는 "본인 데이터만 쓰기, 룸·프로필은 공개 읽기" 원칙.

---

## ▲ Vercel 배포 체크리스트 (기획서 8장)

- [ ] GitHub 레포 연결 → Vercel 자동 배포
- [ ] 환경변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase RLS 정책 적용 (마이그레이션에 포함)
- [ ] YouTube IFrame API: 런타임에 `https://www.youtube.com/iframe_api` 자동 로드
- [ ] Realtime 채널: 룸별 `room:{id}` broadcast/presence (코드 내장)
- [ ] (선택) 도메인 `digtown.vercel.app`

---

## 🎵 음악 소스

기획서대로 **YouTube IFrame Player**를 사용합니다. 서버는 음원을 저장하지 않고
`{ videoId, startedAt }` 만 broadcast → 각 클라이언트가 `(now - startedAt)` 만큼 seek 하여
**같은 곡·같은 위치**를 함께 듣습니다(워치파티 방식, drift 자동 보정).

곡 검색은 기본적으로 내장 데모 카탈로그(`src/lib/catalog.ts`)를 사용하며,
`NEXT_PUBLIC_YOUTUBE_API_KEY` 를 넣으면 실제 YouTube Data API 검색으로 전환됩니다.

---

## 🧱 기술 스택

Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Zustand · Supabase(Postgres/Auth/Realtime) · YouTube IFrame API

## 📁 구조

```
src/
  app/
    onboarding/            # Phase 1
    (tabs)/                # 홈/상점/친구/프로필/퀘스트 (하단탭 + 온보딩 가드)
    room/[id]/             # Phase 3 리스닝 파티 룸
    room/create/           # 룸 만들기
    auth/callback/         # Google OAuth 콜백
  components/              # Character, MoodBuilding, RoomCard, YouTubePlayer, TrackSearch ...
  hooks/useRoomSession.ts  # 룸 상태 + Realtime 동기화
  lib/                     # genres, taste(코사인), catalog, mock, supabase/*
  store/useAppStore.ts     # Zustand (localStorage persist)
supabase/                  # migrations + seed
```
