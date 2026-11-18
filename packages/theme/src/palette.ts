import { RAW_PALETTE, themeTokens } from "./tokens.js";

export { RAW_PALETTE, themeTokens };
export const PRIMARY_COLOR = RAW_PALETTE.glaucous; // #7681B3
export const SECONDARY_COLOR = RAW_PALETTE.mediumSlateBlue; // #6F73D2
export const ACCENT_COLOR = RAW_PALETTE.skyBlueVibrant; // #83C9F4
export const SKY_COLOR = RAW_PALETTE.skyBluePastel; // #A3D5FF
export const ICE_COLOR = RAW_PALETTE.aliceBlue; // #D9F0FF

export function getAccessibleTextColor(hexColor: string): "#FFFFFF" | "#151B2E" {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#151B2E" : "#FFFFFF";
}
