import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/features/subscription/components/site-shell";
import {
  getPublicSite,
  PublicSiteApiError,
  resolvePublicTenant,
} from "@/features/subscription/public-site-api";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite(await resolvePublicTenant()).catch(
    (error: unknown) => {
      if (error instanceof PublicSiteApiError && error.status === 404) {
        return null;
      }
      throw error;
    },
  );
  return {
    title: site?.seoTitle ?? site?.publicName ?? "AsteHub",
    description:
      site?.seoDescription ?? site?.description ?? "Site público da locadora.",
    openGraph: {
      title: site?.ogTitle ?? site?.seoTitle ?? site?.publicName,
      description:
        site?.ogDescription ??
        site?.seoDescription ??
        site?.description ??
        undefined,
      images: site?.ogImageUrl ? [site.ogImageUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tenant = await resolvePublicTenant();
  const site = await getPublicSite(tenant).catch((error: unknown) => {
    if (error instanceof PublicSiteApiError && error.status === 404) {
      return null;
    }
    throw error;
  });
  return (
    <html lang="pt-BR">
      <body>
        {site ? <SiteShell site={site}>{children}</SiteShell> : children}
      </body>
    </html>
  );
}
