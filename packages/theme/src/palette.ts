import { RAW_PALETTE, themeTokens } from "./tokens.js";

export { RAW_PALETTE, themeTokens };
export const PRIMARY_COLOR   = RAW_PALETTE.darkCyan;   // #119da4
export const SECONDARY_COLOR = RAW_PALETTE.cerulean;   // #0c7489
export const TEAL_COLOR      = RAW_PALETTE.darkTeal;   // #13505b
export const INK_COLOR       = RAW_PALETTE.black;      // #040404
export const NEUTRAL_COLOR   = RAW_PALETTE.dustGrey;   // #d7d9ce

/**
 * Returns accessible foreground (#040404 or #FFFFFF) for a given background hex.
 */
export function getAccessibleTextColor(hexColor: string): "#FFFFFF" | "#040404" {
  const hex = hexColor.replace("#", "").replace(/ff$/i, "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#040404" : "#FFFFFF";
}
