export interface OrganizationSite {
  id: string;
  publicName: string;
  slug: string;
  domain: string | null;
  phone: string | null;
  description: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteInput {
  publicName: string;
  slug: string;
  domain: string | null;
  phone: string | null;
  description: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
}

export class SiteApiError extends Error {
  constructor(readonly status: number) {
    super(`Site API request failed with status ${status}.`);
    this.name = "SiteApiError";
  }
}

function apiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured.");
  }
  return configuredUrl.replace(/\/+$/, "");
}

export class SiteApi {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(baseUrl = apiBaseUrl(), fetcher: typeof fetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetcher = fetcher.bind(globalThis);
  }

  getByOrganization(
    organizationId: string,
    signal?: AbortSignal,
  ): Promise<OrganizationSite | null> {
    return this.request<OrganizationSite>(
      `/sites?organizationId=${encodeURIComponent(organizationId)}`,
      { signal },
    ).catch((error: unknown) => {
      if (error instanceof SiteApiError && error.status === 404) {
        return null;
      }
      throw error;
    });
  }

  getById(organizationId: string, id: string): Promise<OrganizationSite> {
    return this.request(
      `/sites/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
    );
  }

  create(
    organizationId: string,
    input: SiteInput,
  ): Promise<OrganizationSite> {
    return this.request(
      `/sites?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  update(
    organizationId: string,
    id: string,
    input: SiteInput,
  ): Promise<OrganizationSite> {
    return this.request(
      `/sites/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  }

  async delete(organizationId: string, id: string): Promise<void> {
    await this.request<void>(
      `/sites/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "DELETE" },
    );
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const hasBody = init.body !== undefined;
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    if (!response.ok) {
      throw new SiteApiError(response.status);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
