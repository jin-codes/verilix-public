-- 유저가 openai/anthropic/google 3사 키를 동시에 등록해둘 수 있으므로, 채팅에 실제로 쓸
-- 프로바이더 하나를 명시적으로 고르게 한다(설정의 API 키 화면 토글). null이면 앱 기본
-- Anthropic 키 + 크레딧 시스템을 그대로 쓴다.
alter table public.profiles
  add column active_byok_provider text check (active_byok_provider in ('openai', 'anthropic', 'google'));
