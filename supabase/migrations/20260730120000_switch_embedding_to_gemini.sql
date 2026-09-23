-- 로컬 오픈소스 임베딩(Xenova/multilingual-e5-small, 384차원)을 Gemini API
-- (gemini-embedding-001, outputDimensionality=768로 절단)로 교체한다. 기존 384차원 벡터는
-- 새 임베딩 공간과 호환되지 않으므로 안전하게 null로 리셋한다(문서는 다음 생성/재임베딩 때
-- 새로 채워짐 — 과거 20260722170000 전환 때와 동일한 패턴).
drop index if exists public.documents_embedding_idx;

alter table public.documents
  alter column embedding type vector(768) using null;

create index documents_embedding_idx on public.documents using ivfflat (embedding vector_cosine_ops);

drop function if exists public.match_documents(vector(384), uuid, uuid, int);

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
