"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { QuoteTrigger } from "./quote-trigger";
import styles from "./site-header.module.css";
import Image from "next/image";
import type { PublicSite } from "../public-site-api";

const links = [
  { href: "/veiculos", label: "Assinatura" },
  { href: "/", label: "Unidades" },
  { href: "/#faq", label: "Dúvidas" },
];

export function SiteHeader({ site }: { site: PublicSite }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link
            className={styles.brand}
            href="/"
            aria-label={`${site.publicName} - início`}
          >
            {site.logoUrl ? (
              <Image
                src={site.logoUrl}
                alt={site.publicName}
                width={160}
                height={44}
                className={styles.brandLogo}
                unoptimized
              />
            ) : (
              <span className={styles.brandName}>{site.publicName}</span>
            )}
          </Link>

          <nav className={styles.nav} aria-label="Navegação principal">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <QuoteTrigger className={styles.quote} onOpen={() => setOpen(false)}>
              Solicitar orçamento
            </QuoteTrigger>

            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={
                open ? "Fechar menu de navegação" : "Abrir menu de navegação"
              }
              onClick={() => setOpen((current) => !current)}
            >
              {open ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className={styles.mobileBackdrop} onClick={() => setOpen(false)}>
          <nav
            id="mobile-navigation"
            className={styles.drawer}
            aria-label="Navegação mobile"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerLinks}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.drawerLink}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={styles.drawerCta}>
              
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
