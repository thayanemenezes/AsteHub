export interface VehicleCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleCategoryPage {
  data: VehicleCategory[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VehicleCategoryInput {
  name: string;
  description?: string;
}

export class VehicleCategoryApiError extends Error {
  constructor(readonly status: number) {
    super(`Vehicle category API request failed with status ${status}.`);
    this.name = "VehicleCategoryApiError";
  }
}

function apiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured.");
  }
  return configuredUrl.replace(/\/+$/, "");
}

export class VehicleCategoryApi {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(
    baseUrl = apiBaseUrl(),
    fetcher: typeof fetch = fetch,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetcher = fetcher.bind(globalThis);
  }

  list(
    organizationId: string,
    page: number,
    limit = 10,
    signal?: AbortSignal,
  ): Promise<VehicleCategoryPage> {
    const query = new URLSearchParams({
      organizationId,
      page: String(page),
      limit: String(limit),
    });
    return this.request(`/vehicle-categories?${query}`, { signal });
  }

  getById(organizationId: string, id: string): Promise<VehicleCategory> {
    return this.request(
      `/vehicle-categories/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
    );
  }

  create(
    organizationId: string,
    input: VehicleCategoryInput,
  ): Promise<VehicleCategory> {
    return this.request(
      `/vehicle-categories?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  update(
    organizationId: string,
    id: string,
    input: VehicleCategoryInput,
  ): Promise<VehicleCategory> {
    return this.request(
      `/vehicle-categories/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  }

  async delete(organizationId: string, id: string): Promise<void> {
    await this.request<void>(
      `/vehicle-categories/${encodeURIComponent(id)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "DELETE" },
    );
  }

  deleteMany(organizationId: string, ids: string[]) {
    return this.request<{ deletedCount: number }>(
      `/vehicle-categories/bulk?organizationId=${encodeURIComponent(organizationId)}`,
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
      throw new VehicleCategoryApiError(response.status);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
