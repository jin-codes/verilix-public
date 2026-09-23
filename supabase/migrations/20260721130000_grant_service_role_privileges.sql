-- service_role은 RLS를 우회하는 신뢰 역할이지만, 이 프로젝트의 baseline 마이그레이션에는
-- 테이블 권한(GRANT)이 누락되어 있었다. Supabase가 프로젝트 생성 시 기본으로 부여하는
-- 권한을 복원한다 (기존 테이블 + 앞으로 생성될 테이블 모두 대상).
grant usage on schema public to service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
