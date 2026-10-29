import type {
  CreateLeadInput,
  Lead,
  LeadPage,
  LeadStatus,
  UpdateLeadInput,
} from "@repo/contracts";

export type {
  CreateLeadInput,
  Lead,
  LeadPage,
  LeadStatus,
  UpdateLeadInput,
};

export class LeadApiError extends Error {
  constructor(readonly status: number) {
    super(`Lead API request failed with status ${status}.`);
    this.name = "LeadApiError";
  }
}

function apiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured.");
  }
  return configuredUrl.replace(/\/+$/, "");
}

export class LeadApi {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(baseUrl = apiBaseUrl(), fetcher: typeof fetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetcher = fetcher.bind(globalThis);
  }

  list(
    organizationId: string,
    page: number,
    limit = 10,
    signal?: AbortSignal,
  ): Promise<LeadPage> {
    const query = new URLSearchParams({
      organizationId,
      page: String(page),
      limit: String(limit),
    });
    return this.request(`/leads?${query}`, { signal });
  }

  getById(organizationId: string, id: string): Promise<Lead> {
    return this.request(
      `/leads/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
    );
  }

  create(organizationId: string, input: CreateLeadInput): Promise<Lead> {
    return this.request(
      `/leads?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  update(
    organizationId: string,
    id: string,
    input: UpdateLeadInput,
  ): Promise<Lead> {
    return this.request(
      `/leads/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  }

  async delete(organizationId: string, id: string): Promise<void> {
    await this.request<void>(
      `/leads/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "DELETE" },
    );
  }

  deleteMany(organizationId: string, ids: string[]) {
    return this.request<{ deletedCount: number }>(
      `/leads/bulk?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "DELETE", body: JSON.stringify({ ids }) },
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
      throw new LeadApiError(response.status);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
