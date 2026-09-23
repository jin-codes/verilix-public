-- 임베딩(pgvector) 검색이 실패하거나 유사도 문턱을 넘는 결과가 하나도 없을 때를 대비한 폴백:
-- 문서 "안의 단어"로 찾는 전문 검색. tags(보조 키워드)뿐 아니라 title/summary/key_conclusion/
-- learnings/repeat_keywords/action_items/follow_up_questions와 원본 대화(raw_conversation)
-- 본문까지 전부 대상으로 한다.
--
-- 한/영 혼용이라 형태소 분석이 없는 'simple' config를 쓴다. 매칭을 두 갈래로 OR 결합:
--   1) websearch_to_tsquery('simple', ...) — 여러 단어를 넣으면 "모두 포함"(AND)으로 동작하며,
--      토큰(공백/구두점) 단위 whole-word 매칭. 영문에 특히 잘 맞는다.
--   2) strpos() 부분 문자열 매칭 — 'simple'은 한국어 조사를 떼지 않으므로("훅을"이 한 토큰)
--      "훅"으로는 tsquery가 안 걸린다. 이 부분 일치 갈래가 그걸 보완한다.
-- 정렬은 ts_rank 우선(전문 검색으로 걸린 문서), 부분 문자열로만 걸린 문서는 그 뒤로 최근 순.

-- raw_conversation jsonb에서 사람이 읽는 텍스트만 뽑는다. 웹 채팅 자동/수동 문서화는
-- { messages: [{ role, content }] } 형태, MCP save_document는 { text: string } 형태로 저장하므로
-- 둘 다 처리하고, 그 외 형태는 통째로 문자열화한다.
create or replace function public.document_raw_text(rc jsonb)
returns text
language sql
immutable
as $$
  select coalesce(
    case
      when rc is null then ''
      when jsonb_typeof(rc -> 'messages') = 'array' then (
        select string_agg(msg ->> 'content', ' ')
        from jsonb_array_elements(rc -> 'messages') as msg
      )
      when rc ? 'text' then rc ->> 'text'
      else rc::text
    end,
    ''
  );
$$;

create or replace function public.search_documents_text(
  search_query text,
  match_user_id uuid,
  match_count int default 20
)
returns table (
  id uuid,
  title text,
  updated_at timestamptz,
  doc_type text,
  tag_node_id uuid,
  rank float
)
language sql
stable
as $$
  with q as (
    select
      lower(btrim(search_query)) as needle,
      websearch_to_tsquery('simple', btrim(search_query)) as tsq
  ),
  raw as (
    select
      d.id,
      d.title,
      d.updated_at,
      d.doc_type,
      d.tag_node_id,
      -- tsvector는 총 lexeme 크기에 상한(~1MB)이 있어 아주 긴 대화가 들어와도 안전하도록 자른다.
      left(
        concat_ws(' ',
          d.title,
          d.summary,
          d.key_conclusion,
          d.learnings,
          array_to_string(d.tags, ' '),
          array_to_string(d.repeat_keywords, ' '),
          d.action_items::text,
          d.follow_up_questions::text,
          public.document_raw_text(d.raw_conversation)
        ),
        500000
      ) as body
    from public.documents d
    where d.user_id = match_user_id
      and d.is_archived = false
  ),
  docs as (
    select
      raw.id,
      raw.title,
      raw.updated_at,
      raw.doc_type,
      raw.tag_node_id,
      to_tsvector('simple', raw.body) as tsv,
      lower(raw.body) as body_lower
    from raw
  )
  select
    docs.id,
    docs.title,
    docs.updated_at,
    docs.doc_type,
    docs.tag_node_id,
    (
      ts_rank(docs.tsv, q.tsq)::float
      + case when strpos(docs.body_lower, q.needle) > 0 then 0.001 else 0 end
    )::float as rank
  from docs, q
  where q.needle <> ''
    and (
      docs.tsv @@ q.tsq
      or strpos(docs.body_lower, q.needle) > 0
    )
  order by rank desc, docs.updated_at desc
  limit least(greatest(match_count, 1), 50);
$$;
