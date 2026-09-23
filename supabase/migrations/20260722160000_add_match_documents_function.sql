-- pgvector 기반 문서 검색 RPC. 코사인 유사도 순으로 정렬하되, boost_tag_node_id가 주어지고
-- 문서의 tag_node_id가 같으면(같은 broad 주제) 약간의 가산점을 줘 벡터 유사도와 태그 계층을
-- 하이브리드로 결합한다. pgvector 자체는 태그 문자열을 대조하지 않으므로 이 결합은 SQL에서 처리한다.
create or replace function public.match_documents(
  query_embedding vector(1536),
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
