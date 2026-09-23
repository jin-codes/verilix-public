-- 주간 다이제스트에 "관심사 변화 트랙션"(태그별 활동 추세)을 넣기 위한 스냅샷 테이블.
-- LLM에게 매번 "지난주와 비교해서 말해줘"를 텍스트로 추론시키지 않고, 발송마다 태그별
-- 집계치를 저장해뒀다가 다음 발송 때 그 값과 단순 diff해서 trend를 결정론적으로 계산한다.
create table public.digest_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag_node_id uuid not null references public.tag_nodes(id) on delete cascade,
  doc_count integer not null,
  note_count integer not null,
  estimated_level text,
  sent_at timestamptz not null default now(),
  unique (user_id, tag_node_id, sent_at)
);

create index digest_snapshots_user_tag_idx on public.digest_snapshots(user_id, tag_node_id, sent_at desc);

alter table public.digest_snapshots enable row level security;
create policy "본인만" on public.digest_snapshots for all using (auth.uid() = user_id);
