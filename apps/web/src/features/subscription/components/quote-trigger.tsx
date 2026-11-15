"use client";

import type { ReactNode } from "react";
import { useQuote } from "./quote-context";

export function QuoteTrigger({
  className,
  children,
  vehicleId,
  onOpen,
}: {
  className?: string;
  children: ReactNode;
  vehicleId?: string;
  onOpen?: () => void;
}) {
  const { openQuote } = useQuote();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onOpen?.();
        openQuote(vehicleId);
      }}
    >
      {children}
    </button>
  );
}
