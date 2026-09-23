// 유저 1인당 하루 $0.20 = 20크레딧. profiles.credits_total 기본값과 동일하게 유지할 것.
// MIN_CREDITS_RESERVE_HAIKU(3)가 항상 못 건드리는 절대 버퍼라 실사용 가능한 건 20-3=17크레딧
// (Haiku 기본 대화는 대부분 최소과금 플로어에 걸려 1크레딧/턴이라 하루 약 17턴 상당).
export const DAILY_CREDITS = 20

// 딥 모드(Sonnet) 한 턴도 감당 못 할 만큼 남으면 딥 모드 자체를 차단하는 예약분(모델과 무관한
// 전체 차단 기준이 아님 — 그건 아래 MIN_CREDITS_RESERVE_HAIKU 참고).
// deep 모드(Sonnet) + max_tokens(4096) 풀 사용을 가정한 최악 시나리오로 계산:
// 입력 3000 tok(시스템 프롬프트+배경지식+히스토리 요약 여유치) + 출력 4096 tok(max_tokens).
// (3000*3 + 4096*15) / 1e6 = $0.07044 → 7.044 → 올림 8크레딧.
export const MIN_CREDITS_RESERVE = 8

// 위와 같은 최악 시나리오를 Haiku 단가로 계산한 최종 하한선 — 이 미만이면 모델과 무관하게
// (Haiku 포함) 요청 자체를 차단한다. (3000*1 + 4096*5) / 1e6 = $0.02348 → 2.348 → 올림 3크레딧.
export const MIN_CREDITS_RESERVE_HAIKU = 3
