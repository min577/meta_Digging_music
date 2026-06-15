-- 무드 공간(장소) 시드 — lib/mock.ts 의 LOCATIONS 와 동일하게 유지.
insert into public.locations (id, name, theme, emoji, primary_genre, mood_tags) values
  ('loc_jazz',      'Late Night Jazz', '자정의 재즈 바, 세피아빛 무드',      '🎷', 'jazz',      array['밤','집중','차분']),
  ('loc_citypop',   'City Pop Train',  '네온 도시를 달리는 야간 열차',       '🚆', 'citypop',   array['드라이브','설렘','레트로']),
  ('loc_lofi',      'Rainy Lo-fi Room','빗소리와 함께하는 공부방',           '🌧️', 'lofi',      array['공부','휴식','잔잔']),
  ('loc_house',     'Disco Rooftop',   '루프탑 하우스 파티',                 '🪩', 'house',     array['운동','에너지','댄스']),
  ('loc_kpop',      'K-Pop Stage',     '아이돌 무대 백스테이지',             '💖', 'kpop',      array['신남','팬','응원']),
  ('loc_classical', 'Antique Hall',    '금빛 클래식 연주회장',               '🎻', 'classical', array['자기 전','사색','우아'])
on conflict (id) do nothing;
