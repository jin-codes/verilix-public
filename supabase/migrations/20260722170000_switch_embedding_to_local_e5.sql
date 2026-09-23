-- OpenAI text-embedding-3-small(1536차원)은 프로젝트 API 키가 쿼터 초과(429)라 당장 결제 없이는
-- 쓸 수 없다. 결제 재개 전까지 임시로 로컬 오픈소스 모델(Xenova/multilingual-e5-small, 384차원,
-- transformers.js로 Vercel 함수 안에서 직접 추론 — API 키/과금 불필요)로 교체한다.
-- documents.embedding은 현재 전부 null이라(OpenAI 429로 실제 데이터가 쓰인 적 없음) 안전하게
-- 차원을 바꿀 수 있다. using null로 혹시 모를 기존 값도 명시적으로 비운다.
drop index if exists public.documents_embedding_idx;

alter table public.documents
  alter column embedding type vector(384) using null;

create index documents_embedding_idx on public.documents using ivfflat (embedding vector_cosine_ops);

drop function if exists public.match_documents(vector(1536), uuid, uuid, int);

create or replace function public.match_documents(
  query_embedding vector(384),
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
