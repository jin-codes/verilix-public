-- search_documents_text를 "여러 단어 = 모두 포함(AND)"에서 "여러 단어 = 각 단어를 독립적으로,
-- 그 단어가 들어간 문서를 모두(OR)"로 바꾼다. 띄어쓰기로 여러 단어를 넣으면 각 단어별로
-- 그 단어가 본문에 등장하는 문서를 전부 불러오고, 더 많은 단어가 걸린 문서일수록 위로 정렬한다.
--
-- 매칭은 기존과 동일하게 두 갈래를 OR로 결합하되, 이번엔 쿼리 전체가 아니라 단어 하나하나에 대해:
--   1) plainto_tsquery('simple', 단어) — 토큰 단위 whole-word 매칭 (영문에 강함)
--   2) strpos() 부분 문자열 — 'simple'이 한국어 조사를 안 떼는 걸 보완 ("훅" → "훅을" 매칭)
-- 문서 하나라도 단어 중 아무거나 걸리면 결과에 포함된다.
-- rank는 걸린 단어들의 ts_rank 합 + 부분 문자열 매칭 보너스 합이라, 걸린 단어 수가 많을수록 커진다.
--
-- document_raw_text()는 20260829100000에서 정의한 그대로 재사용한다(변경 없음).

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
    select array(
      select lower(w)
      from regexp_split_to_table(btrim(coalesce(search_query, '')), '\s+') as w
      where w <> ''
    ) as words
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
  ),
  scored as (
    select
      docs.id,
      docs.title,
      docs.updated_at,
      docs.doc_type,
      docs.tag_node_id,
      (
        select coalesce(sum(
          ts_rank(docs.tsv, plainto_tsquery('simple', w))
          + case when strpos(docs.body_lower, w) > 0 then 0.001 else 0 end
        ), 0)
        from unnest(q.words) as w
      )::float as rank
    from docs, q
    where array_length(q.words, 1) >= 1
      and exists (
        select 1
        from unnest(q.words) as w
        where docs.tsv @@ plainto_tsquery('simple', w)
           or strpos(docs.body_lower, w) > 0
      )
  )
  select id, title, updated_at, doc_type, tag_node_id, rank
  from scored
  order by rank desc, updated_at desc
  limit least(greatest(match_count, 1), 50);
$$;
