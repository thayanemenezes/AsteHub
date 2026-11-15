"use client";

import { createContext, useContext } from "react";

export type QuoteContextValue = {
  openQuote: (initialVehicleId?: string) => void;
};

export const QuoteContext = createContext<QuoteContextValue | null>(null);

export function useQuote() {
  const value = useContext(QuoteContext);
  if (!value) {
    throw new Error("useQuote deve ser usado dentro do site público.");
  }
  return value;
}
