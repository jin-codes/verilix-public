// ============================================
// Design Tokens — Bright Paper & Sage Accent
// 확정 팔레트. 임의 수정 금지.
// DESIGN_TOKENS.md의 코드 미러. 실제 Tailwind 구현은
// src/app/globals.css의 :root(light)/.dark(dark) CSS 변수 —
// 이 파일은 Tailwind 빌드에 연결되지 않는 참고용 TS 상수.
// ============================================

export const colors = {
  primary: {
    DEFAULT: "#1A3D2B",
    hover:   "#243F2E",
    light:   "#2E5C3E",
  },
  secondary: {
    DEFAULT: "#6C7B70",
    light:   "#9DB5A4",
  },
  tertiary: {
    DEFAULT: "#522B2D",
    hover:   "#6B3537",
  },
  neutral: {
    DEFAULT: "#767775",
    light:   "#B0B3B1",
  },
  bg:      "#FAF9F6",
  sidebar: "#E0DDD6",
  surface: {
    DEFAULT: "#FAF9F6",
    raised:  "#FCFBF9",
  },
  border: {
    DEFAULT: "#E0DDD6",
    strong:  "#C8C5BC",
  },
  text: {
    primary:     "#1A1A18",
    secondary:   "#5A5A56",
    muted:       "#9A9A96",
    onPrimary:   "#FFFFFF",
    onTertiary:  "#FFFFFF",
  },
} as const;

export const darkColors = {
  primary: {
    DEFAULT: "#3E7A57",
    hover:   "#4C8F68",
    light:   "#6FAE86",
  },
  secondary: {
    DEFAULT: "#8FA79A",
    light:   "#4F5C55",
  },
  tertiary: {
    DEFAULT: "#8B4A4C",
    hover:   "#9E5759",
  },
  neutral: {
    DEFAULT: "#8C8A85",
    light:   "#524F48",
  },
  bg:      "#171613",
  sidebar: "#100F0D",
  surface: {
    DEFAULT: "#171613",
    raised:  "#221F1B",
  },
  border: {
    DEFAULT: "#34322D",
    strong:  "#47443D",
  },
  text: {
    primary:     "#EEEBE4",
    secondary:   "#A6A29A",
    muted:       "#726E67",
    onPrimary:   "#FFFFFF",
    onTertiary:  "#FFFFFF",
  },
} as const;

export const typography = {
  fontFamily: "'Inter', sans-serif",
  fontSize: {
    xs:   "11px",
    sm:   "12px",
    base: "14px",
    md:   "15px",
    lg:   "18px",
    xl:   "22px",
  },
  fontWeight: {
    regular:  400,
    medium:   500,
    semibold: 600,
  },
  lineHeight: {
    tight: 1.3,
    base:  1.6,
  },
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
} as const;

export const radius = {
  sm:   "8px",
  md:   "14px",
  lg:   "20px",
  full: "9999px",
} as const;

export const shadow = {
  sm: "0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 8px 24px rgba(0,0,0,0.10)",
} as const;

export const tokens = {
  colors,
  darkColors,
  typography,
  spacing,
  radius,
  shadow,
} as const;

export default tokens;
