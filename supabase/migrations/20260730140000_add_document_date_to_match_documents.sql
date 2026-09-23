-- match_documents가 반환하는 문서에 updated_at을 추가한다. 채팅 시스템 프롬프트의
-- "[참고할 수 있는 과거 문서]" 목록(surfacing.ts)에 날짜가 없어서 AI가 이 문서가
-- 언제 적힌 내용인지 알 수 없었다 — 날짜를 함께 주입해 최신성 판단에 쓸 수 있게 한다.
drop function if exists public.match_documents(vector(768), uuid, uuid, int);

create or replace function public.match_documents(
  query_embedding vector(768),
  match_user_id uuid,
  boost_tag_node_id uuid default null,
  match_count int default 3
)
returns table (
  id uuid,
  title text,
  summary text,
  key_conclusion text,
  learnings text,
  updated_at timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    d.id,
    d.title,
    d.summary,
    d.key_conclusion,
    d.learnings,
    d.updated_at,
    (1 - (d.embedding <=> query_embedding))
      + case when boost_tag_node_id is not null and d.tag_node_id = boost_tag_node_id then 0.1 else 0 end
      as similarity
  from public.documents d
  where d.user_id = match_user_id
    and d.embedding is not null
    and d.is_archived = false
  order by similarity desc
  limit match_count;
$$;
