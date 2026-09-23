# 🎨 Design Tokens — Bright Paper & Sage Accent
> 확정 팔레트 기준 파일. 작업 시 반드시 이 파일을 참조할 것.
> 임의로 색상 변경 금지. 토큰 이름 그대로 사용.
> 다크모드는 별도 팔레트가 아니라 **같은 토큰의 Dark 값**이다 — hue(그린/버건디/웜뉴트럴)는 유지하고 명도만 다크 배경에 맞게 조정. 구현은 `globals.css`의 `:root`(Light)/`.dark`(Dark) CSS 변수로 이뤄짐(아래 "구현" 섹션 참고).

---

## 1. Color Tokens

### Core Action Colors (Signature Accents)
| Token | Light | Dark | 용도 |
|-------|-----|-----|------|
| `color.primary` | `#1A3D2B` | `#3E7A57` | 저장, 완료, 전송 등 긍정 액션 버튼 배경 및 메인 강조 포인트 |
| `color.primary.hover` | `#243F2E` | `#4C8F68` | Primary hover 상태 (라이트는 어둡게, 다크는 밝게 — 방향이 반대임에 유의) |
| `color.primary.light` | `#2E5C3E` | `#6FAE86` | Primary 보조, 활성 뱃지 등 |
| `color.tertiary` | `#522B2D` | `#8B4A4C` | 삭제, 경고, 거부 버튼, 강조 포인트 |
| `color.tertiary.hover` | `#6B3537` | `#9E5759` | Tertiary hover 상태 |
| `color.secondary` | `#6C7B70` | `#8FA79A` | 보조 텍스트, 아이콘, 비활성 상태 |
| `color.secondary.light` | `#9DB5A4` | `#4F5C55` | 구분선, 서브 레이블 (낮은 대비 역할 유지 — 배경에 더 가깝게) |
| `color.neutral` | `#767775` | `#8C8A85` | 플레이스홀더, 비활성 텍스트 |
| `color.neutral.light` | `#B0B3B1` | `#524F48` | 구분선, 보더 (낮은 대비 역할 유지 — 배경에 더 가깝게) |

### Surface & Background (Bright Paper Palette)
| Token | Light | Dark | 용도 |
|-------|-----|-----|------|
| `color.bg` | `#FAF9F6` | `#171613` | 앱 전체 배경 (라이트: 오프화이트/크림, 다크: 차갑지 않은 웜톤 잉크블랙 — 종이 질감 정체성 유지) |
| `color.sidebar` | `#E0DDD6` | `#100F0D` | 사이드바 배경 (배경보다 한 단계 더 짙은 톤 — 라이트/다크 동일한 관계 유지) |
| `color.surface` | `#FAF9F6` | `#171613` | 카드, 패널, 입력창 배경 (배경과 동일하게 맞추고 보더로 경계를 구분하여 종이 질감 유지) |
| `color.surface.raised` | `#FCFBF9` | `#221F1B` | 모달, 드롭다운 배경 (라이트/다크 모두 배경보다 살짝 밝게 — 다크모드 elevation 컨벤션) |
| `color.border` | `#E0DDD6` | `#34322D` | 카드/인풋 테두리, 일반 구분선 |
| `color.border.strong` | `#C8C5BC` | `#47443D` | 강조 구분선 |

### Text
| Token | Light | Dark | 용도 |
|-------|-----|-----|------|
| `color.text.primary` | `#1A1A18` | `#EEEBE4` | 본문 주요 텍스트 |
| `color.text.secondary` | `#5A5A56` | `#A6A29A` | 보조 텍스트 |
| `color.text.muted` | `#9A9A96` | `#726E67` | 힌트, 플레이스홀더 |
| `color.text.on-primary` | `#FFFFFF` | `#FFFFFF` | Primary 배경 위 텍스트 |
| `color.text.on-tertiary` | `#FFFFFF` | `#FFFFFF` | Tertiary 배경 위 텍스트 |

> **검증 필요**: 위 Dark 값은 hue를 유지하며 명도를 조정한 첫 제안이다. `text.on-primary`/`text.on-tertiary`(흰 텍스트)가 다크모드의 중간 톤 accent 위에서 WCAG AA(4.5:1)를 실제로 만족하는지는 아직 계측 도구로 확인하지 않았음 — 버튼 텍스트 가독성 이슈가 보이면 이 값부터 재조정할 것.

---

## 2. Typography

| Token | Value | 용도 |
|-------|-------|------|
| `font.family` | `'Inter', sans-serif` | 전체 폰트 |
| `font.size.xs` | `11px` | 라벨, 캡션 |
| `font.size.sm` | `12px` | 보조 텍스트 |
| `font.size.base` | `14px` | 본문 |
| `font.size.md` | `15px` | 강조 본문 |
| `font.size.lg` | `18px` | 섹션 제목 |
| `font.size.xl` | `22px` | 페이지 제목 |
| `font.weight.regular` | `400` | 일반 텍스트 |
| `font.weight.medium` | `500` | 버튼, 라벨 |
| `font.weight.semibold` | `600` | 제목, 강조 |
| `font.line-height.tight` | `1.3` | 제목 |
| `font.line-height.base` | `1.6` | 본문 |

---

## 3. Spacing & Shape

| Token | Value | 용도 |
|-------|-------|------|
| `space.1` | `4px` | 최소 간격 |
| `space.2` | `8px` | 아이콘-텍스트 간격 |
| `space.3` | `12px` | 컴포넌트 내부 패딩 |
| `space.4` | `16px` | 카드 패딩 |
| `space.5` | `20px` | 섹션 간격 |
| `space.6` | `24px` | 큰 섹션 간격 |
| `space.8` | `32px` | 페이지 패딩 |
| `radius.sm` | `8px` | 버튼, 인풋 |
| `radius.md` | `14px` | 카드 |
| `radius.lg` | `20px` | 모달, 패널 |
| `radius.full` | `9999px` | 뱃지, 태그 |

---

## 4. Shadow & Border

| Token | Value | 용도 |
|-------|-------|------|
| `shadow.sm` | `0 1px 3px rgba(0,0,0,0.06)` | 카드 기본 |
| `shadow.md` | `0 4px 12px rgba(0,0,0,0.08)` | 드롭다운, 모달 |
| `shadow.lg` | `0 8px 24px rgba(0,0,0,0.10)` | 팝오버 |
| `border.width` | `1px` | 기본 보더 |
| `border.style` | `solid` | 기본 보더 |

---

## 5. Component Rules

> 아래 hex는 Light 기준 참고값이다. Dark 값은 위 1번 표 참고 — 컴포넌트 코드에서는 hex를 직접 쓰지 말고 토큰 클래스(`bg-primary`, `text-text-secondary` 등)를 써서 라이트/다크 전환이 자동으로 반영되게 할 것.

### Sidebar
- 배경: `color.sidebar` (`#E0DDD6`)
- 우측 테두리: `1px solid color.border` (`#E0DDD6` 또는 약간 더 짙은 `#C8C5BC` 적용 가능)
- 기본 텍스트: `color.text.primary` (`#1A1A18` with `opacity: 0.65`)
- 활성 메뉴: 배경에 `color.bg` (`#FAF9F6`) 또는 `#C8C5BC`를 은은하게 사용하고, 텍스트 `opacity: 1`
- 너비: `220px` (데스크탑), 접힘 시 `56px`

### Card
- 배경: `color.surface` (`#FAF9F6` - 배경과 통일하여 라인 중심의 정갈함 구현)
- 보더: `1px solid color.border` (`#E0DDD6`)
- 반경: `radius.md` (14px)
- 패딩: `space.4` (16px)
- 그림자: `shadow.sm`

### Button — Primary (전송 / 저장 / 완료)
- 배경: `color.primary` (`#1A3D2B`), hover: `color.primary.hover` (`#243F2E`)
- 텍스트: `color.text.on-primary` (`#FFFFFF`)
- 패딩: `8px 16px`, 반경: `radius.sm` (8px)
- 폰트: `font.weight.medium`, `font.size.sm`

### Button — Tertiary (Danger / 삭제 / 거부)
- 배경: `color.tertiary` (`#522B2D`), hover: `color.tertiary.hover` (`#6B3537`)
- 텍스트: `color.text.on-tertiary` (`#FFFFFF`)
- 동일 패딩/반경

### Button — Outlined
- 배경: `transparent`
- 보더: `1px solid color.border` (`#E0DDD6`)
- 텍스트: `color.text.primary` (`#1A1A18`)
- hover 시 은은한 배경 적용

### Input / Search / Chat Bar
- 배경: `color.surface` (`#FAF9F6`)
- 보더: `1px solid color.border` (`#E0DDD6`)
- 포커스 보더: `color.primary` (`#1A3D2B` - 얇게 포인트만 줌)
- 반경: `radius.sm` (8px)
- 패딩: `8px 12px`

---

## 6. Claude Code 지시사항

```
이 프로젝트의 디자인 토큰은 DESIGN_TOKENS.md를 따릅니다.

규칙:
1. 색상은 반드시 토큰 값(hex)을 사용할 것. 임의 색상 사용 금지.
2. Background/Surface: #FAF9F6 (일반 화면 및 카드 배경) / Sidebar: #E0DDD6 (사이드바)
3. Primary (전송/저장 버튼): #1A3D2B / Tertiary (삭제/거부 버튼): #522B2D
4. 폰트는 Inter만 사용. 크기는 토큰 기준.
5. 카드 radius는 14px, 버튼 radius는 8px 고정.
6. 그림자는 subtle하게 — shadow.sm 기본.
7. 디자인 방향: 밝고 은은한 종이 질감(에디토리얼) + 미니멀.
   Linear 스타일의 높은 정보 밀도, 절제된 UI.
8. 다크모드: hex 리터럴을 컴포넌트에 직접 쓰지 말고 CSS 변수 기반 토큰 클래스를 쓸 것
   (예: style={{ color: '#5A5A56' }} 금지 → text-text-secondary 클래스 사용).
   그래야 <html class="dark">가 토글될 때 자동으로 다크 값으로 전환됨.
```

---

## 7. 구현 위치

- **실제 CSS 변수 정의**: `src/app/globals.css` — `:root`(Light)와 `.dark`(Dark) 블록에 위 1번 표의 모든 토큰이 CSS 커스텀 프로퍼티로 정의됨. Tailwind v4의 `@theme inline`이 이 변수들을 `bg-primary`, `text-text-secondary`, `border-border-strong` 같은 유틸리티 클래스로 노출.
- **토글**: `<html>`에 `.dark` 클래스 유무로 전환 (`@custom-variant dark (&:is(.dark *))`). 초기 로드 시 FOUC 방지용 인라인 스크립트가 `localStorage`의 저장된 선호도(또는 `prefers-color-scheme`)를 읽어 hydration 전에 클래스를 세팅.
- **`tokens.ts`(루트)**: 위 표를 코드로 미러링한 TS 상수(`colors`/`darkColors`). Tailwind 빌드에 직접 연결되지는 않고(Tailwind v4는 `@config` 없이 JS config를 자동 로드하지 않음) 참고/비-Tailwind 컨텍스트(차트 등)용 레퍼런스로 유지.
- **`tailwind.config.ts`는 존재하지 않음** — v3 스타일 JS config였으나 이 프로젝트의 Tailwind v4 설정에서 로드되지 않는 죽은 코드였기 때문에 제거됨. 색상/radius/spacing 전부 `globals.css`의 `@theme`가 유일한 실제 구현체.
