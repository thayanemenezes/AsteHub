"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { QuoteTrigger } from "./quote-trigger";
import styles from "./site-header.module.css";

const links = [
  { href: "/#assinatura", label: "Assinatura" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#calculadora", label: "Calculadora de Assinatura" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
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
            href="/#assinatura"
            aria-label="AsteHub Início"
          >
            <Image
              src="/logo-white.png"
              alt="AsteHub"
              width={160}
              height={44}
              priority
              className={styles.brandLogo}
            />
          </Link>

          <nav className={styles.nav} aria-label="Navegação principal">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <QuoteTrigger className={styles.quote}>
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
              <QuoteTrigger
                className={styles.quoteMobile}
                onOpen={() => setOpen(false)}
              >
                Solicitar orçamento
              </QuoteTrigger>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
