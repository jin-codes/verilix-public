-- 주간 다이제스트: 유저별 마지막 발송 시각 추적 (고정 7일 윈도우 대신, cron 지연/실패에도
-- 누락 없이 "마지막으로 보낸 시점 이후 전부"를 계산하기 위함)
alter table profiles add column if not exists last_digest_sent_at timestamptz;
alter table profiles add column if not exists digest_enabled boolean not null default true;
