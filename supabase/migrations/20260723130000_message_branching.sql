-- 메시지 버전 히스토리(branching): 질문 수정/답변 재생성 시 이전 버전을 삭제하지 않고
-- 형제 메시지로 보존한다. parent_id(불변, 생성 시 확정)로 "이 지점까지의 맥락"을,
-- active_child_id(가변, 유저 네비게이션에 따라 갱신)로 "지금 화면에 보이는 한 줄"을 표현한다.

alter table public.messages
  add column parent_id uuid references public.messages(id) on delete cascade,
  add column active_child_id uuid references public.messages(id) on delete set null;

alter table public.conversations
  add column root_message_id uuid references public.messages(id) on delete set null;

-- 기존에 쌓여있던 선형 대화를 시간순 체인으로 백필한다.
with ordered as (
  select
    id,
    conversation_id,
    lag(id) over (partition by conversation_id order by created_at, id) as prev_id,
    lead(id) over (partition by conversation_id order by created_at, id) as next_id
  from public.messages
)
update public.messages m
set parent_id = o.prev_id,
    active_child_id = o.next_id
from ordered o
where m.id = o.id;

update public.conversations c
set root_message_id = first_msg.id
from (
  select distinct on (conversation_id) conversation_id, id
  from public.messages
  order by conversation_id, created_at, id
) first_msg
where c.id = first_msg.conversation_id;
