-- NOTE 히든 태그에 주제 라벨(tag)을 함께 받아, 같은 tag로 미소비 노트가 임계치만큼 쌓이면
-- 그 노트들을 재료로 Sonnet이 합성한 심층 분석을 topic_insights에 저장한다.
-- self_model(유저당 1행, "끝판왕" 프로필)과는 별개로 태그별 여러 행을 허용한다.
alter table public.assistant_notes
  add column tag text not null default 'general',
  add column consumed boolean not null default false;

create table public.topic_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag text not null,
  summary text not null,
  source_note_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tag)
);

alter table public.topic_insights enable row level security;
create policy "본인만" on public.topic_insights for all using (auth.uid() = user_id);
