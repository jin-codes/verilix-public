-- anon/authenticated 역할에도 테이블 권한(GRANT)이 누락되어 있었다.
-- RLS 정책이 걸려 있어도 GRANT가 없으면 브라우저 클라이언트(anon/authenticated)의
-- 모든 SELECT/INSERT/UPDATE/DELETE가 permission denied로 막힌다.
-- Supabase가 프로젝트 생성 시 기본으로 부여하는 권한을 복원한다.
grant usage on schema public to anon, authenticated;

grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
