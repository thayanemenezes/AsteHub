/**
 * Shared Color Palette & Theme Tokens
 *
 * Source palette (blue/indigo):
 * - Glaucous        #7681B3  (Primary — CTAs, links, focus rings)
 * - Medium Slate    #6F73D2  (Secondary — interactive accent, hover)
 * - Sky Blue        #83C9F4  (Tertiary light — borders, chips)
 * - Sky Blue Light  #A3D5FF  (Primary light — hover tints)
 * - Alice Blue      #D9F0FF  (Subtle — tinted backgrounds, cards)
 */

export const RAW_PALETTE = {
  primary:      "#7681B3", // Glaucous
  secondary:    "#6F73D2", // Medium Slate Blue
  tertiary:     "#83C9F4", // Sky Blue (mid)
  primaryLight: "#A3D5FF", // Sky Blue (light)
  subtle:       "#D9F0FF", // Alice Blue
} as const;

export const themeTokens = {
  colors: {
    // Primary: Glaucous #7681B3 — CTAs, links, focus rings, active nav
    primary: {
      DEFAULT:  "#7681B3",
      hover:    "#6472A6",
      active:   "#556198",
      light:    "#A3D5FF",
      xlight:   "#C4E4FF",
      subtle:   "#D9F0FF",
      border:   "#83C9F4",
      contrast: "#FFFFFF",
    },

    // Secondary: Medium Slate Blue #6F73D2 — badges, interactive accent, chips
    secondary: {
      DEFAULT:  "#6F73D2",
      hover:    "#5F63C4",
      active:   "#5055B6",
      light:    "#9EA2E0",
      subtle:   "#ECEDFB",
      border:   "#B4B6EC",
      contrast: "#FFFFFF",
    },

    // Tertiary: Sky Blue #83C9F4 — tags, decorative highlights, progress bars
    tertiary: {
      DEFAULT:  "#83C9F4",
      hover:    "#6CBCEE",
      subtle:   "#D9F0FF",
      border:   "#A3D5FF",
      contrast: "#1E2D4A",
    },

    // Neutrals — dark ink + light blue-tinted paper
    neutral: {
      ink:           "#1A1C2E", // deep blue-dark for text
      inkSecondary:  "#2E3250",
      muted:         "#64688F",
      subtle:        "#9398BE",

      line:          "#C8CCEC",
      border:        "#BEC3E8",
      borderSubtle:  "#DDE0F5",
      borderStrong:  "#A8AEDE",

      background:    "#F3F5FF", // blue-tinted page background
      surface:       "#FFFFFF",
      surfaceSubtle: "#EEF0FB",
      dustGrey:      "#D9F0FF",
    },

    // Dark Canvas & Shells (Sidebar, Footer, Auth Aside)
    dark: {
      canvas:          "#1A1C2E", // deepest indigo-black
      surface:         "#252846", // main dark surface
      surfaceElevated: "#2F3358", // elevated panels in dark
      border:          "rgba(118, 129, 179, 0.18)",
      borderSubtle:    "rgba(118, 129, 179, 0.10)",
      text:            "#E8EAFF",
      muted:           "#9398BE",
    },

    // Feedback States (kept accessible, using palette tones)
    feedback: {
      success:        "#4E9A6F",
      successSubtle:  "#E6F5ED",
      warning:        "#B07D2A",
      warningSubtle:  "#FDF5E4",
      danger:         "#C0392B",
      dangerSubtle:   "#FDF2F1",
      focus:          "#7681B3",
    },
  },

  shadows: {
    subtle:   "0 4px 20px rgba(26, 28, 46, 0.06)",
    card:     "0 10px 30px rgba(26, 28, 46, 0.09)",
    elevated: "0 18px 45px rgba(26, 28, 46, 0.13)",
    dialog:   "0 24px 70px rgba(26, 28, 46, 0.28)",
  },

  gradients: {
    authAside:   "linear-gradient(135deg, #1A1C2E 0%, #252846 55%, #7681B3 100%)",
    welcomeCard: "radial-gradient(ellipse at 90% 20%, rgba(118, 129, 179, 0.18), transparent 45%), linear-gradient(115deg, #D9F0FF 0%, #F3F5FF 85%)",
    bannerShade: "linear-gradient(100deg, rgba(26, 28, 46, 0.94) 0%, rgba(26, 28, 46, 0.70) 50%, rgba(26, 28, 46, 0.15) 100%)",
    pageGlow:    "radial-gradient(circle at top right, rgba(118, 129, 179, 0.14), transparent 38%), radial-gradient(circle at bottom left, rgba(111, 115, 210, 0.08), transparent 32%)",
  },
} as const;

export type ThemeTokens = typeof themeTokens;
