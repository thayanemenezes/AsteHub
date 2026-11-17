"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { QuoteDialog } from "./quote-dialog";
import { QuoteContext } from "./quote-context";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { PublicSite } from "../public-site-api";
import styles from "./site-shell.module.css";

export function SiteShell({
  children,
  site,
}: {
  children: ReactNode;
  site: PublicSite;
}) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [initialVehicleId, setInitialVehicleId] = useState<
    string | undefined
  >();

  const handleOpenQuote = (vehicleId?: string) => {
    setInitialVehicleId(vehicleId);
    setQuoteOpen(true);
  };
  const siteTheme: CSSProperties & {
    "--site-primary"?: string;
    "--site-secondary"?: string;
  } = {
    ...(site.primaryColor ? { "--site-primary": site.primaryColor } : {}),
    ...(site.secondaryColor
      ? { "--site-secondary": site.secondaryColor }
      : {}),
  };

  return (
    <QuoteContext.Provider
      value={{
        openQuote: handleOpenQuote,
      }}
    >
      <div style={siteTheme}>
        <a className={styles.skip} href="#conteudo">
          Pular para o conteúdo principal
        </a>
        <SiteHeader site={site} />
        <div id="conteudo">{children}</div>
        <SiteFooter site={site} />

        <QuoteDialog
          open={quoteOpen}
          initialVehicleId={initialVehicleId}
          siteSlug={site.slug}
          onClose={() => setQuoteOpen(false)}
        />
      </div>
    </QuoteContext.Provider>
  );
}
