/**
 * Shared Color Palette & Theme Tokens
 *
 * Source palette from user specification:
 * - Alice Blue: #D9F0FF
 * - Sky Blue: #A3D5FF
 * - Sky Blue (Vibrant): #83C9F4
 * - Medium Slate Blue: #6F73D2
 * - Glaucous: #7681B3 (Primary Color)
 */

export const RAW_PALETTE = {
  aliceBlue: "#D9F0FF",
  skyBluePastel: "#A3D5FF",
  skyBlueVibrant: "#83C9F4",
  mediumSlateBlue: "#6F73D2",
  glaucous: "#7681B3",
} as const;

export const themeTokens = {
  colors: {
    // Primary: Glaucous (#7681B3) - Core brand identity
    primary: {
      DEFAULT: "#7681B3",
      hover: "#636EA2",
      active: "#525D91",
      light: "#8F9BCB",
      subtle: "#EEF2FA",
      border: "#CCD3E8",
      contrast: "#FFFFFF",
    },

    // Secondary / Interactive: Medium Slate Blue (#6F73D2) - Badges, accents, focus rings
    secondary: {
      DEFAULT: "#6F73D2",
      hover: "#5B5FB8",
      active: "#4D51A8",
      light: "#8C90E2",
      subtle: "#EEF0FB",
      border: "#CAD0F3",
      contrast: "#FFFFFF",
    },

    // Accent: Vibrant Sky Blue (#83C9F4) - Highlights, status, dark section accents
    accent: {
      DEFAULT: "#83C9F4",
      hover: "#6CBCEE",
      active: "#55ADE9",
      subtle: "#E8F5FD",
      border: "#BCE2FA",
      contrast: "#0D3352",
    },

    // Sky: Pastel Sky Blue (#A3D5FF) - Subtle borders, tags, secondary fills
    sky: {
      DEFAULT: "#A3D5FF",
      hover: "#8EC7FB",
      subtle: "#F0F7FF",
      border: "#CCE5FF",
      contrast: "#0E3354",
    },

    // Ice: Alice Blue (#D9F0FF) - Light backgrounds, input fields, row stripes
    ice: {
      DEFAULT: "#D9F0FF",
      subtle: "#F4FAFF",
      border: "#BEE3FC",
      contrast: "#0F2B48",
    },

    // High Contrast Typography & Neutral Ink
    neutral: {
      ink: "#151B2E",
      inkSecondary: "#333C57",
      muted: "#586380",
      subtle: "#8792AB",
      line: "#DFE5F0",
      lineSubtle: "#EDF1F7",
      border: "#DFE5F0",
      borderSubtle: "#EDF1F7",
      borderStrong: "#C4CEE0",
      background: "#F4F7FC",
      surface: "#FFFFFF",
      surfaceSubtle: "#F0F4FA",
    },

    // Dark Surface & Shells (Sidebar, Footer, Hero banners)
    dark: {
      canvas: "#121624",
      surface: "#181D30",
      surfaceElevated: "#222942",
      border: "rgba(255, 255, 255, 0.10)",
      borderSubtle: "rgba(255, 255, 255, 0.06)",
      text: "#F1F4FB",
      muted: "#9BA5C0",
    },

    // Feedback States
    feedback: {
      success: "#1E8E63",
      successSubtle: "#EFFBF5",
      warning: "#D97706",
      warningSubtle: "#FFFBEB",
      danger: "#D9383A",
      dangerSubtle: "#FDF2F2",
      focus: "#6F73D2",
    },
  },

  // Shadows
  shadows: {
    subtle: "0 4px 20px rgba(21, 27, 46, 0.04)",
    card: "0 10px 30px rgba(21, 27, 46, 0.06)",
    elevated: "0 18px 45px rgba(21, 27, 46, 0.10)",
    dialog: "0 24px 70px rgba(18, 22, 36, 0.28)",
  },

  // Gradients
  gradients: {
    authAside: "linear-gradient(135deg, #181D30 0%, #242B48 55%, #7681B3 100%)",
    welcomeCard: "radial-gradient(ellipse at 90% 20%, rgba(131, 201, 244, 0.28), transparent 45%), linear-gradient(115deg, #D9F0FF 0%, #F0F4FA 80%)",
    bannerShade: "linear-gradient(100deg, rgba(18, 22, 36, 0.94) 0%, rgba(18, 22, 36, 0.70) 50%, rgba(18, 22, 36, 0.15) 100%)",
    pageGlow: "radial-gradient(circle at top right, rgba(118, 129, 179, 0.18), transparent 38%), radial-gradient(circle at bottom left, rgba(131, 201, 244, 0.12), transparent 32%)",
  },
} as const;

export type ThemeTokens = typeof themeTokens;
