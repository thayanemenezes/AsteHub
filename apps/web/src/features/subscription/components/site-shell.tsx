"use client";

import { useState, type ReactNode } from "react";
import { QuoteDialog } from "./quote-dialog";
import { QuoteContext } from "./quote-context";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./site-shell.module.css";

export function SiteShell({ children }: { children: ReactNode }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [initialVehicleId, setInitialVehicleId] = useState<
    string | undefined
  >();

  const handleOpenQuote = (vehicleId?: string) => {
    setInitialVehicleId(vehicleId);
    setQuoteOpen(true);
  };

  return (
    <QuoteContext.Provider
      value={{
        openQuote: handleOpenQuote,
      }}
    >
      <a className={styles.skip} href="#conteudo">
        Pular para o conteúdo principal
      </a>
      <SiteHeader />
      <div id="conteudo">{children}</div>
      <SiteFooter />

      <QuoteDialog
        open={quoteOpen}
        initialVehicleId={initialVehicleId}
        onClose={() => setQuoteOpen(false)}
      />
    </QuoteContext.Provider>
  );
}
