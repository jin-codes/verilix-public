-- LINK 히든 태그(<!--VLX:LINK doc_id-->): 채팅 답변 AI가 이번 턴이 기존에 저장된 문서와
-- 실제로 연관 있다고 판단하면 그 문서 id를 남긴다. pgvector 유사도와는 다른 신호(대화 맥락상
-- 연결)라 상호보완적으로 쓴다. 메시지 단위로 우선 쌓아두고, 그 메시지들이 나중에 하나의 문서로
-- 묶일 때(자동/수동 모두) 문서 단위로 합쳐 related_document_ids에 저장한다.
alter table public.messages
  add column linked_doc_ids uuid[];

alter table public.documents
  add column related_document_ids uuid[];
