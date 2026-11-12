import type { OrganizationRole } from "../auth/auth-api";

export type { OrganizationRole } from "../auth/auth-api";

export function isOrganizationRole(value: string): value is OrganizationRole {
  return value === "OWNER" || value === "ADMIN" || value === "MEMBER";
}

export interface OrganizationMember {
  id: string;
  email: string;
  role: OrganizationRole;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: OrganizationRole;
  expiresAt: string;
  createdAt: string;
}

export interface OrganizationUsers {
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
}

export type DashboardLanguage = "pt-BR" | "en";

export interface UserSettings {
  language: DashboardLanguage;
}

export class UserApiError extends Error {
  constructor(readonly status: number) {
    super(`User API request failed with status ${status}.`);
    this.name = "UserApiError";
  }
}

function apiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configuredUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured.");
  }
  return configuredUrl.replace(/\/+$/, "");
}

export class UserApi {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(baseUrl = apiBaseUrl(), fetcher: typeof fetch = fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetcher = fetcher.bind(globalThis);
  }

  getSettings(signal?: AbortSignal): Promise<UserSettings> {
    return this.request("/users/me/settings", { signal });
  }

  updateSettings(language: DashboardLanguage): Promise<UserSettings> {
    return this.request("/users/me/settings", {
      method: "PATCH",
      body: JSON.stringify({ language }),
    });
  }

  list(
    organizationId: string,
    signal?: AbortSignal,
  ): Promise<OrganizationUsers> {
    return this.request(
      `/users?organizationId=${encodeURIComponent(organizationId)}`,
      { signal },
    );
  }

  invite(
    organizationId: string,
    input: { email: string; role: OrganizationRole },
  ): Promise<OrganizationInvitation> {
    return this.request(
      `/users/invitations?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  updateMember(
    organizationId: string,
    membershipId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    return this.request(
      `/users/${encodeURIComponent(membershipId)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "PATCH", body: JSON.stringify({ role }) },
    );
  }

  removeMember(organizationId: string, membershipId: string): Promise<void> {
    return this.request(
      `/users/${encodeURIComponent(membershipId)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "DELETE" },
    );
  }

  revokeInvitation(
    organizationId: string,
    invitationId: string,
  ): Promise<void> {
    return this.request(
      `/users/invitations/${encodeURIComponent(invitationId)}?organizationId=${encodeURIComponent(organizationId)}`,
      { method: "DELETE" },
    );
  }

  acceptInvitation(input: {
    token: string;
    password: string;
  }): Promise<{ email: string }> {
    return this.request("/users/invitations/accept", {
      method: "POST",
      body: JSON.stringify(input),
    });
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
      throw new UserApiError(response.status);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
