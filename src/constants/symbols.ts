export const CONTRACT_SUFFIX = "H26";
export const API_BASE_URL = "https://camarilla-api.vercel.app/api/v1/tfex";

export const SYMBOLS = {
  S50: `S50${CONTRACT_SUFFIX}`,
  GO: `GO${CONTRACT_SUFFIX}`,
} as const;

export type SymbolType = (typeof SYMBOLS)[keyof typeof SYMBOLS];
