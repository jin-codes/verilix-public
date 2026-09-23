-- 문서화 TOPIC 태그를 단일 문자열에서 가변 깊이(최대 3단계, 대>중>소) 계층으로 바꾼다.
-- messages.topic_tag(단일) → messages.topic_path(text[], 넓은 범위부터 순서대로).
-- 자동 문서화 임계치 카운트는 topic_path[1](가장 넓은 범위)로 그룹핑한다 — 좁은 범위는
-- 대화마다 계속 바뀔 수 있어 그 기준으로는 10개가 쌓이기 어렵기 때문.
alter table public.messages rename column topic_tag to topic_path_legacy;
alter table public.messages add column topic_path text[];
update public.messages set topic_path = array[topic_path_legacy] where topic_path_legacy is not null;
alter table public.messages drop column topic_path_legacy;

drop index if exists messages_topic_tag_idx;
create index messages_topic_path_broad_idx on public.messages(conversation_id, (topic_path[1])) where topic_path is not null;

-- 태그 계층 자체를 누적 저장하는 테이블. 마인드맵 렌더링(향후 UI)의 데이터 소스가 된다.
-- 같은 부모 아래 같은 이름은 재사용하고(unique), 매 턴 경로를 따라가며 없는 노드만 새로 생성한다.
create table public.tag_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.tag_nodes(id) on delete cascade,
  name text not null,
  depth smallint not null check (depth between 1 and 3),
  created_at timestamptz not null default now()
);

-- parent_id가 null인 최상위 노드끼리는 (user_id, name)로, 그 외에는 (user_id, parent_id, name)로 유일해야 한다.
-- NULL은 unique 제약에서 서로 다른 값으로 취급되므로 두 개의 부분 유니크 인덱스로 나눈다.
create unique index tag_nodes_root_unique_idx on public.tag_nodes(user_id, name) where parent_id is null;
create unique index tag_nodes_child_unique_idx on public.tag_nodes(user_id, parent_id, name) where parent_id is not null;

alter table public.tag_nodes enable row level security;
create policy "본인만" on public.tag_nodes for all using (auth.uid() = user_id);
