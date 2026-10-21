export interface OrganizationMembership {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: "ACTIVE" | "SUSPENDED";
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
  organizations?: OrganizationMembership[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  organizationName: string;
}

export class AuthApiError extends Error {
  constructor(readonly status: number) {
    super(`Authentication API request failed with status ${status}.`);
    this.name = "AuthApiError";
  }
}

function apiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured.");
  }

  return configuredUrl.replace(/\/+$/, "");
}

export class AuthApi {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(
    baseUrl = apiBaseUrl(),
    fetcher: typeof fetch = fetch,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetcher = fetcher.bind(globalThis);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      return await this.request<AuthUser>("/auth/me");
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        return null;
      }
      throw error;
    }
  }

  register(input: RegisterInput): Promise<AuthUser> {
    return this.request<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  login(input: LoginInput): Promise<AuthUser> {
    return this.request<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async logout(): Promise<void> {
    await this.request<void>("/auth/logout", { method: "POST" });
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
      throw new AuthApiError(response.status);
    }
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
