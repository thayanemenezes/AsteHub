import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/features/subscription/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "AsteHub | Assinatura de veículos",
  description:
    "Landing de locação por assinatura: banners, frota, regras, vantagens e perguntas frequentes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
