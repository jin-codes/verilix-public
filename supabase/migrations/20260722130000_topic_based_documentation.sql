-- 대화 이탈/타이머 기반 전체 대화 문서화를, 턴마다 남기는 주제 태그(TOPIC) 누적 기반으로 대체한다.
-- 채팅 답변 AI가 매 턴 <!--VLX:TOPIC 태그--> 를 남기고, 같은 대화방 안에서 같은 태그를 가진
-- (아직 문서화 안 된) 어시스턴트 메시지가 임계치만큼 쌓이면 그 턴들만 재료로 문서를 생성한다.
alter table public.messages
  add column topic_tag text,
  add column doc_id uuid references public.documents(id) on delete set null;

create index messages_topic_tag_idx on public.messages(conversation_id, topic_tag) where topic_tag is not null;

-- 이제 문서 하나가 대화 전체가 아니라 대화 안의 한 주제 세그먼트일 수 있다.
do $$
declare
  existing_conname text;
begin
  select con.conname into existing_conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'documents' and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%doc_trigger%';
  if existing_conname is not null then
    execute format('alter table public.documents drop constraint %I', existing_conname);
  end if;
end $$;

alter table public.documents
  add constraint documents_doc_trigger_check check (doc_trigger in ('manual', 'auto_exit', 'auto_timer', 'auto_topic'));

-- 대화 이탈 시 전체 문서화 트리거가 없어져 더 이상 쓰이지 않는다.
alter table public.conversations drop column skip_auto_document;
