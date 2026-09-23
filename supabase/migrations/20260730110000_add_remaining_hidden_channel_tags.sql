-- LINK에 이어 나머지 히든 채널 태그(CONTRADICTION/STALE/LEVEL/GOAL/LOW_CONFIDENCE/FEEDBACK_SIGNAL)를
-- 위한 스키마. 가능한 한 기존 데이터 모델(tag_nodes, topic_insights, document_versions)에 얹는다.

-- CONTRADICTION: 유저 발언이 기존 저장 문서와 모순될 때 남기는 플래그. 문서 뷰에서 배지로 노출하고
-- 유저가 직접 "확인함"으로 해소한다 — security_alerts(증거 보존용, 유저 비공개)와 달리 유저 본인을 위한
-- 신호라 일반 "본인만" RLS를 쓴다. 문서가 지워지면 그 문서에 대한 플래그도 의미가 없으니 cascade.
create table public.document_contradictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  content text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index document_contradictions_document_id_idx on public.document_contradictions(document_id);

alter table public.document_contradictions enable row level security;
create policy "본인만" on public.document_contradictions for all using (auth.uid() = user_id);

-- STALE: "새 문서를 만들지 말고 이 문서에 이어붙여라"는 신호. messages 단위로 우선 기록해두고,
-- 자동 문서화 임계치에 도달한 세그먼트 안에서 가장 많이 지목된 doc_id로 병합한다(route.ts).
alter table public.messages
  add column stale_target_doc_id uuid references public.documents(id) on delete set null;

-- LEVEL: topic_insights에 태그(broad tag_node)별 숙련도 추정치를 얹는다. 지금까지 topic_insights는
-- NOTE가 TOPIC_INSIGHT_THRESHOLD(10)개 쌓여야만 summary와 함께 생성됐는데, LEVEL은 그보다 먼저,
-- 훨씬 적은 신호로도 갱신될 수 있어야 하므로 summary보다 먼저 행이 생길 수 있게 summary를 nullable로 완화한다.
alter table public.topic_insights
  alter column summary drop not null,
  add column estimated_level text check (estimated_level in ('beginner', 'intermediate', 'advanced'));

-- GOAL: Type A(고정 배경지식, profiles.type_a_context)와 달리 시간에 따라 바뀌는 "지금 진행 중인
-- 목적"을 나타내는 단일 필드. 태그가 다시 감지될 때마다 최신 값으로 덮어쓴다.
alter table public.profiles
  add column current_goal text,
  add column current_goal_updated_at timestamptz;

-- LOW_CONFIDENCE / FEEDBACK_SIGNAL: 둘 다 "유저에게는 안 보이고, 나중에 개발자가 품질 검토용으로
-- 훑어보는 내부 로그"라는 동일한 구조라 테이블 하나에 signal_type으로 구분해 담는다.
-- security_alerts와 같은 패턴(등록은 본인 명의로만, 조회는 유저 본인에게도 열지 않음 — 어차피
-- 지금은 admin UI가 없어 service_role로만 조회 가능).
create table public.quality_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  signal_type text not null check (signal_type in ('low_confidence', 'feedback_signal')),
  content text not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.quality_signals enable row level security;
create policy "본인 등록만" on public.quality_signals for insert with check (auth.uid() = user_id);
