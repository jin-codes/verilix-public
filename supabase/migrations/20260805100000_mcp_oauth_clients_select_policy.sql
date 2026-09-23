-- mcp_oauth_clients는 RLS만 켜져 있고 select 정책이 없어서, 유저 세션으로 mcp_oauth_tokens와
-- 조인(embed)해도 PostgREST가 클라이언트 이름을 항상 null로 걸러내고 있었다(client_id/redirect_uris는
-- public client의 공개 메타데이터라 비밀이 아님 — 노출돼도 안전). 유저가 /mcp에서 자신이 연결한 앱
-- 이름(Claude/ChatGPT 등)을 볼 수 있도록 authenticated에 select만 허용, insert/update/delete는
-- 여전히 service_role(register 라우트)만 가능하도록 별도 정책을 추가하지 않는다.
create policy "인증된 유저는 조회만 가능" on public.mcp_oauth_clients for select to authenticated using (true);
