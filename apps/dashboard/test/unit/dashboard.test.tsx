import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardHomePage from "../../src/app/dashboard/page";
import DashboardLayout from "../../src/app/dashboard/layout";
import { DashboardModulePage } from "../../src/app/dashboard/_components/module-placeholder";
import { AuthProvider } from "../../src/auth/auth-provider";

const { push, replace, currentPath } = vi.hoisted(() => {
  let path = "/dashboard";
  return {
    push: vi.fn(),
    replace: vi.fn(),
    currentPath: {
      get: () => path,
      set: (nextPath: string) => {
        path = nextPath;
      },
    },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath.get(),
  useRouter: () => ({ push, replace, refresh: vi.fn() }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const authenticatedUser = {
  id: "user-1",
  email: "manager@example.com",
  createdAt: "2026-10-20T12:00:00.000Z",
  organizations: [
    {
      id: "organization-1",
      name: "Locadora Central",
      role: "OWNER" as const,
      status: "ACTIVE" as const,
    },
  ],
};

function renderDashboard(children: React.ReactNode = <p>Conteúdo privado</p>) {
  return render(
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>,
  );
}

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  currentPath.set("/dashboard");
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(jsonResponse(authenticatedUser)),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("dashboard shell", () => {
  it("shows the requested navigation groups and marks the current route", async () => {
    renderDashboard();

    const navigation = await screen.findByRole("navigation", {
      name: "Navegação principal",
    });
    for (const label of [
      "Visão geral",
      "Veículos",
      "Categorias",
      "Unidades",
      "Site",
      "Leads",
      "Usuários",
      "Configurações",
    ]) {
      expect(within(navigation).getByRole("link", { name: label })).toBeVisible();
    }

    expect(
      within(navigation).getByRole("link", { name: "Visão geral" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).queryByRole("link", { name: /Reservas|Financeiro|CRM/ }),
    ).not.toBeInTheDocument();
    expect(await screen.findAllByText("Locadora Central")).not.toHaveLength(0);
    expect(screen.getAllByText("manager@example.com")).not.toHaveLength(0);
  });

  it("marks a nested module route active and supports the mobile menu", async () => {
    currentPath.set("/dashboard/vehicles");
    const user = userEvent.setup();
    renderDashboard();

    const navigation = await screen.findByRole("navigation", {
      name: "Navegação principal",
    });
    expect(
      within(navigation).getByRole("link", { name: "Veículos" }),
    ).toHaveAttribute("aria-current", "page");

    const menuButton = screen.getByRole("button", { name: "Abrir menu" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(
      within(navigation).getByRole("link", { name: "Visão geral" }),
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(menuButton).toHaveFocus();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("ends the session through the existing API and redirects to login", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(authenticatedUser));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(null, 204));
    renderDashboard();

    const accountMenu = await screen.findByRole("button", {
      name: "Ações da conta de manager@example.com",
    });
    expect(accountMenu).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Sair da conta" })).not.toBeInTheDocument();
    await user.click(accountMenu);
    expect(accountMenu).toHaveAttribute("aria-expanded", "true");
    await user.click(await screen.findByRole("button", { name: "Sair da conta" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
    expect(vi.mocked(fetch).mock.calls[1]?.[0]).toBe(
      "http://localhost:3001/auth/logout",
    );
    expect(vi.mocked(fetch).mock.calls[1]?.[1]).toMatchObject({
      method: "POST",
      credentials: "include",
    });
  });

  it("closes the account dropdown with Escape and restores focus", async () => {
    const user = userEvent.setup();
    renderDashboard();

    const accountMenu = await screen.findByRole("button", {
      name: "Ações da conta de manager@example.com",
    });
    await user.click(accountMenu);
    expect(screen.getByRole("button", { name: "Sair da conta" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(accountMenu).toHaveAttribute("aria-expanded", "false");
    expect(accountMenu).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Sair da conta" })).not.toBeInTheDocument();
  });

  it("redirects expired sessions to login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(null, 401)));
    renderDashboard();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("shows a recoverable network error and retries the session check", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Network unavailable"));
    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Confira sua conexão e tente carregar sua sessão novamente.",
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findAllByText("manager@example.com")).not.toHaveLength(0);
  });
});

describe("dashboard overview", () => {
  it("greets the signed-in user, shows their organization, and offers real module links", async () => {
    render(
      <AuthProvider>
        <DashboardHomePage />
      </AuthProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "Visão geral" }),
    ).toBeVisible();
    expect(
      await screen.findByRole("heading", {
        name: "Olá, manager@example.com",
      }),
    ).toBeVisible();
    expect(screen.getByText("Locadora Central")).toBeVisible();
    expect(screen.getByRole("link", { name: /Cadastrar veículo/ })).toHaveAttribute(
      "href",
      "/dashboard/vehicles",
    );
    expect(screen.getByRole("link", { name: /Adicionar unidade/ })).toHaveAttribute(
      "href",
      "/dashboard/locations",
    );
    expect(screen.getByRole("link", { name: /Gerenciar site/ })).toHaveAttribute(
      "href",
      "/dashboard/site",
    );
    expect(screen.getByRole("link", { name: /Ver leads/ })).toHaveAttribute(
      "href",
      "/dashboard/leads",
    );
    expect(screen.queryByText(/\b(0|12|24)\b/)).not.toBeInTheDocument();
  });
});

describe("module placeholder", () => {
  it("renders the module title, description, and a clear empty state", () => {
    render(
      <DashboardModulePage
        title="Veículos"
        description="Gerencie o catálogo de veículos da sua organização."
      />,
    );

    expect(screen.getByRole("heading", { name: "Veículos" })).toBeVisible();
    expect(
      screen.getByText("Gerencie o catálogo de veículos da sua organização."),
    ).toBeVisible();
    expect(screen.getByText("Este módulo ainda está sendo preparado.")).toBeVisible();
  });
});
