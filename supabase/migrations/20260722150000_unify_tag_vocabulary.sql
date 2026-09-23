-- 태그 어휘 일관화. 지금까지 세 군데가 각자 다른 어휘로 태그를 만들고 있었다:
--   1) tag_nodes (messages.topic_path에서 생성되는 계층 트리)
--   2) assistant_notes.tag / topic_insights.tag (NOTE 히든 태그가 그때그때 자유생성하는 flat 문자열)
--   3) documents.tags (문서 생성 시 Haiku가 또 별도로 자유생성하는 flat 배열)
-- 이번 마이그레이션은 tag_nodes를 유일한 태그 어휘로 삼고 1)과 2)를 연결한다.
-- documents.tags(Haiku 자유생성)는 보조 키워드로 남기되, documents도 tag_nodes에 연결한다.
--
-- assistant_notes/topic_insights에 이미 쌓인 flat 문자열 태그 데이터는 tag_nodes와 매핑할 근거가
-- 없어(실사용 데이터가 적어) 폐기하고 새 스키마로 다시 쌓기 시작한다.
truncate table public.assistant_notes;
truncate table public.topic_insights;

-- NOTE는 더 이상 자체 태그를 짓지 않는다. 같은 턴에 이미 나온 topic_path의 leaf 노드를 그대로 참조한다.
alter table public.assistant_notes
  drop column tag,
  add column tag_node_id uuid references public.tag_nodes(id) on delete set null;

-- topic_insights 집계 키를 flat 문자열에서 broad tag_node(=topic_path[1])로 바꾼다.
-- 자동 문서화 임계치 집계(messages.topic_path[1] 기준)와 같은 단위로 통일하기 위함.
alter table public.topic_insights
  drop constraint topic_insights_user_id_tag_key,
  drop column tag,
  add column tag_node_id uuid not null references public.tag_nodes(id) on delete cascade,
  add constraint topic_insights_user_id_tag_node_id_key unique (user_id, tag_node_id);

-- documents도 그 문서를 만든 세그먼트의 broad tag_node에 연결해 같은 트리에 걸리게 한다.
alter table public.documents
  add column tag_node_id uuid references public.tag_nodes(id) on delete set null;
