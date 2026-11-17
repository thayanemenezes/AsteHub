import { headers } from "next/headers";

export interface PublicSite {
  publicName: string;
  slug: string;
  phone: string | null;
  description: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
}

export interface PublicVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  description: string | null;
  series: string | null;
  isElectric: boolean;
  images: string[];
  category: { id: string; name: string } | null;
}

export interface PublicLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  description: string | null;
}

export interface PublicPage<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicCategory {
  id: string;
  name: string;
}

export class PublicSiteApiError extends Error {
  constructor(readonly status: number) {
    super(`Public site API request failed with status ${status}.`);
    this.name = "PublicSiteApiError";
  }
}

function apiBaseUrl(): string {
  const configuredUrl =
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) {
    throw new Error("API_URL must be configured for the public website.");
  }
  return configuredUrl.replace(/\/+$/, "");
}

export async function resolvePublicTenant(): Promise<string> {
  const configuredSlug = process.env.PUBLIC_SITE_SLUG?.trim().toLowerCase();
  if (configuredSlug) {
    return configuredSlug;
  }

  const baseDomain = process.env.PUBLIC_BASE_DOMAIN?.trim().toLowerCase();
  const host = (await headers()).get("host")?.toLowerCase().split(":")[0];
  if (baseDomain && host?.endsWith(`.${baseDomain}`)) {
    const subdomain = host.slice(0, -(baseDomain.length + 1));
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain)) {
      return subdomain;
    }
  }

  throw new Error(
    "Set PUBLIC_SITE_SLUG or serve the website from a configured tenant subdomain.",
  );
}

export async function getPublicSite(tenant: string): Promise<PublicSite> {
  return request(`/public/${encodeURIComponent(tenant)}/site`);
}

export async function getPublicVehicles(
  tenant: string,
  page = 1,
  limit = 100,
  categoryId?: string,
): Promise<PublicPage<PublicVehicle>> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (categoryId) {
    query.set("categoryId", categoryId);
  }
  return request(
    `/public/${encodeURIComponent(tenant)}/vehicles?${query.toString()}`,
  );
}

export async function getPublicVehicle(
  tenant: string,
  id: string,
): Promise<PublicVehicle> {
  return request(
    `/public/${encodeURIComponent(tenant)}/vehicles/${encodeURIComponent(id)}`,
  );
}

export async function getPublicCategories(
  tenant: string,
): Promise<PublicCategory[]> {
  return request(`/public/${encodeURIComponent(tenant)}/categories`);
}

export async function getPublicLocations(
  tenant: string,
  page = 1,
  limit = 100,
): Promise<PublicPage<PublicLocation>> {
  return request(
    `/public/${encodeURIComponent(tenant)}/locations?page=${page}&limit=${limit}`,
  );
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new PublicSiteApiError(response.status);
  }
  return (await response.json()) as T;
}
