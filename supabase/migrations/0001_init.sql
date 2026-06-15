-- ============================================================
-- DigTown 초기 스키마 (기획서 6장 기반)
-- Supabase SQL Editor에 붙여넣어 실행하거나, supabase db push 로 적용.
-- ============================================================

-- ---------- 사용자 ----------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  country text default 'KR',
  taste_vector jsonb default '{}'::jsonb,  -- 장르 비율 {jazz:0.4,...}
  situations text[] default '{}',
  coins int default 500,
  digg_points int default 0,
  level int default 1,
  created_at timestamptz default now()
);

-- ---------- 캐릭터/아바타 ----------
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  base_type text default 'hood',
  equipped jsonb default '{}'::jsonb,
  evolution_stage int default 0,
  unique(user_id)
);

-- ---------- 무드 공간(장소) ----------
create table if not exists public.locations (
  id text primary key,
  name text not null,
  theme text,
  emoji text,
  primary_genre text,
  mood_tags text[] default '{}'
);

-- ---------- 룸 (리스닝 파티) ----------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  location_id text references public.locations(id),
  host_id uuid references public.users(id) on delete set null,
  title text not null,
  visibility text default 'public' check (visibility in ('public','unlisted','friends')),
  queue_mode text default 'collab' check (queue_mode in ('dj','collab','radio')),
  taste_vector jsonb default '{}'::jsonb,
  current_track jsonb,            -- {videoId, title, artist, genre, startedAt}
  capacity int default 12,
  is_live boolean default true,
  scheduled_at timestamptz,       -- 예약형(Phase 2/7)
  created_at timestamptz default now()
);

-- ---------- 룸 참가/프레즌스 ----------
create table if not exists public.room_members (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  seat_index int,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

-- ---------- 큐 ----------
create table if not exists public.room_queue (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  video_id text not null,
  title text,
  artist text,
  genre text,
  suggested_by uuid references public.users(id) on delete set null,
  likes int default 0,
  position int default 0,
  created_at timestamptz default now()
);

-- 좋아요 (중복 방지)
create table if not exists public.queue_likes (
  queue_id uuid references public.room_queue(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  primary key (queue_id, user_id)
);

-- ---------- 디깅함 (저장곡) ----------
create table if not exists public.diggs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  video_id text not null,
  title text, artist text, genre text,
  discovered_in_room uuid,
  created_at timestamptz default now(),
  unique(user_id, video_id)
);

-- ---------- 청취 이력 (랭킹/취향 벡터 업데이트) ----------
create table if not exists public.listen_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  video_id text, artist text, genre text,
  listened_seconds int default 0,
  created_at timestamptz default now()
);

-- ---------- 배지/퀘스트 ----------
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  badge_type text,
  label text, detail text,
  earned_at timestamptz default now()
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  quest_type text,
  title text, detail text,
  progress int default 0, goal int default 1,
  reward_coins int default 0, reward_points int default 0,
  completed_at timestamptz
);

-- ---------- 친구/초대 ----------
create table if not exists public.friendships (
  user_id uuid references public.users(id) on delete cascade,
  friend_id uuid references public.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);

create index if not exists idx_rooms_live on public.rooms(is_live);
create index if not exists idx_room_queue_room on public.room_queue(room_id);
create index if not exists idx_diggs_user on public.diggs(user_id);
create index if not exists idx_listen_user on public.listen_events(user_id);

-- ============================================================
-- RLS (Row Level Security)  — 기획서 8장 체크리스트
-- 본인 데이터만 쓰기, 룸/장소는 공개 읽기.
-- ============================================================
alter table public.users        enable row level security;
alter table public.characters   enable row level security;
alter table public.locations    enable row level security;
alter table public.rooms        enable row level security;
alter table public.room_members enable row level security;
alter table public.room_queue   enable row level security;
alter table public.queue_likes  enable row level security;
alter table public.diggs        enable row level security;
alter table public.listen_events enable row level security;
alter table public.badges       enable row level security;
alter table public.quests       enable row level security;
alter table public.friendships  enable row level security;

-- users: 누구나 읽기(프로필 공개), 본인만 수정
drop policy if exists users_read on public.users;
create policy users_read on public.users for select using (true);
drop policy if exists users_write on public.users;
create policy users_write on public.users for insert with check (auth.uid() = id);
drop policy if exists users_update on public.users;
create policy users_update on public.users for update using (auth.uid() = id);

-- characters: 공개 읽기(룸에서 보임), 본인만 쓰기
drop policy if exists char_read on public.characters;
create policy char_read on public.characters for select using (true);
drop policy if exists char_write on public.characters;
create policy char_write on public.characters for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- locations: 공개 읽기
drop policy if exists loc_read on public.locations;
create policy loc_read on public.locations for select using (true);

-- rooms: 공개(또는 unlisted) 읽기, 호스트만 수정, 로그인 사용자 생성
drop policy if exists rooms_read on public.rooms;
create policy rooms_read on public.rooms for select using (visibility <> 'friends' or host_id = auth.uid());
drop policy if exists rooms_insert on public.rooms;
create policy rooms_insert on public.rooms for insert with check (auth.uid() = host_id);
drop policy if exists rooms_update on public.rooms;
create policy rooms_update on public.rooms for update using (auth.uid() = host_id);

-- room_members: 공개 읽기, 본인 행만 추가/삭제
drop policy if exists rm_read on public.room_members;
create policy rm_read on public.room_members for select using (true);
drop policy if exists rm_write on public.room_members;
create policy rm_write on public.room_members for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- room_queue: 공개 읽기, 로그인 사용자 제안, 제안자만 삭제
drop policy if exists rq_read on public.room_queue;
create policy rq_read on public.room_queue for select using (true);
drop policy if exists rq_insert on public.room_queue;
create policy rq_insert on public.room_queue for insert with check (auth.uid() = suggested_by);
drop policy if exists rq_update on public.room_queue;
create policy rq_update on public.room_queue for update using (true);  -- 좋아요 카운트 갱신 허용(데모). 운영시 RPC로 제한 권장.

-- queue_likes: 본인 좋아요만
drop policy if exists ql_all on public.queue_likes;
create policy ql_all on public.queue_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists ql_read on public.queue_likes;
create policy ql_read on public.queue_likes for select using (true);

-- diggs / listen_events / badges / quests: 본인 데이터만
drop policy if exists diggs_all on public.diggs;
create policy diggs_all on public.diggs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists listen_all on public.listen_events;
create policy listen_all on public.listen_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists badges_all on public.badges;
create policy badges_all on public.badges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists quests_all on public.quests;
create policy quests_all on public.quests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- friendships: 당사자만
drop policy if exists fr_read on public.friendships;
create policy fr_read on public.friendships for select using (auth.uid() = user_id or auth.uid() = friend_id);
drop policy if exists fr_write on public.friendships;
create policy fr_write on public.friendships for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 신규 가입 시 users/characters 자동 생성 트리거
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, handle)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'digger_' || substr(new.id::text,1,6)))
  on conflict (id) do nothing;
  insert into public.characters (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Realtime: 룸 동기화 대상 테이블 publication 등록
-- ============================================================
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_queue;
alter publication supabase_realtime add table public.room_members;
