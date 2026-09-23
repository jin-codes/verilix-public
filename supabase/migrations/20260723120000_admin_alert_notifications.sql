-- ALERT(security_alerts)는 유저 본인이 절대 조회할 수 없도록 설계했지만, 지금까지는
-- 개발자 본인도 앱에서 조회할 방법이 없었다(select 정책 자체가 없어 service_role 전용).
-- 이제 관리자 전용 인앱 UI에서 볼 수 있도록 profiles.is_admin 플래그 + 전용 RLS 정책을 추가한다.
-- 1인 개발 단계라 이메일 하드코딩으로 시작 — 관리자가 여러 명이 되면 별도 초대/부여 플로우로 교체할 것.
alter table public.profiles add column is_admin boolean not null default false;

-- 관리자 지정은 공개 레포에 이메일을 남기지 않기 위해 마이그레이션에서 제거함(이미 원격에는 적용 완료).
-- 새 관리자는 service_role로 `update public.profiles set is_admin = true where email = '...'` 를 직접 실행할 것.

-- security_alerts: 관리자만 조회/리뷰 처리 가능. 일반 유저(플래그 당사자 포함)는 여전히 접근 불가 —
-- insert 정책만 있던 기존 상태에 select/update만 추가하고 delete는 열어주지 않는다(증거 보존).
create policy "관리자 조회" on public.security_alerts for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자 리뷰 처리" on public.security_alerts for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- conversations: ALERT가 걸린 대화는 증거 보존을 위해 소유자도 삭제할 수 없어야 한다.
-- Postgres RLS는 "for all" 정책 하나로 명령별 USING을 다르게 줄 수 없으므로,
-- 기존 단일 정책을 명령별 정책 4개로 쪼갠다. select/insert/update는 기존과 동일하게 허용하고,
-- delete에만 "이 대화를 참조하는 security_alerts가 없어야 함" 조건을 추가한다.
drop policy "본인만" on public.conversations;

create policy "본인만 조회" on public.conversations for select
  using (auth.uid() = user_id);

-- insert는 for all과 달리 with check가 필요하다 — using만 쓰면 신규 행 검증이 적용되지 않아
-- (insert 시점엔 참조할 기존 행이 없으므로) 삽입이 막힐 수 있다.
create policy "본인만 생성" on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "본인만 수정" on public.conversations for update
  using (auth.uid() = user_id);

create policy "플래그 없는 대화만 삭제" on public.conversations for delete
  using (
    auth.uid() = user_id
    and not exists (select 1 from public.security_alerts sa where sa.conversation_id = conversations.id)
  );

-- defense in depth: 위 RLS를 우회하는 경로(service_role 스크립트, 계정 삭제 cascade, 향후 관리자 도구 등)로
-- 대화가 지워지더라도 증거인 알럿 자체는 남아야 한다. on delete cascade -> on delete set null로 변경.
do $$
declare
  existing_conname text;
begin
  select con.conname into existing_conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'security_alerts' and con.contype = 'f'
    and pg_get_constraintdef(con.oid) like '%conversation_id%';
  if existing_conname is not null then
    execute format('alter table public.security_alerts drop constraint %I', existing_conname);
  end if;
end $$;

alter table public.security_alerts
  add constraint security_alerts_conversation_id_fkey foreign key (conversation_id) references public.conversations(id) on delete set null;
