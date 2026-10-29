import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import SitePage from "../../src/app/dashboard/site/page";
import { AuthProvider } from "../../src/auth/auth-provider";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

const currentUser = {
  id: "user-1",
  email: "owner@example.com",
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

const site = {
  id: "site-1",
  publicName: "Locadora Central",
  slug: "locadora-central",
  domain: "www.locadoracentral.com.br",
  phone: "+55 11 3333-4444",
  description: "Aluguel de veículos",
  primaryColor: "#282B74",
  secondaryColor: "#F2F2F8",
  logoUrl: "https://cdn.example.com/logo.png",
  createdAt: "2026-10-20T12:00:00.000Z",
  updatedAt: "2026-10-20T12:00:00.000Z",
};

let siteConfiguration: typeof site | null;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderSitePage() {
  return render(
    <AuthProvider>
      <SitePage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
  siteConfiguration = null;
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/sites" && (init?.method ?? "GET") === "GET") {
        return jsonResponse(siteConfiguration);
      }
      if (url.pathname === "/sites" && init?.method === "POST") {
        siteConfiguration = {
          ...site,
          ...(JSON.parse(String(init.body)) as object),
        };
        return jsonResponse(siteConfiguration, 201);
      }
      if (url.pathname.startsWith("/sites/") && init?.method === "GET") {
        return jsonResponse(siteConfiguration);
      }
      if (url.pathname.startsWith("/sites/") && init?.method === "PATCH") {
        if (!siteConfiguration) {
          return jsonResponse({ message: "Not found" }, 404);
        }
        siteConfiguration = {
          ...siteConfiguration,
          ...(JSON.parse(String(init.body)) as Partial<typeof site>),
        };
        return jsonResponse(siteConfiguration);
      }
      if (url.pathname.startsWith("/sites/") && init?.method === "DELETE") {
        siteConfiguration = null;
        return jsonResponse(null, 204);
      }
      return jsonResponse({ message: "Not found" }, 404);
    }),
  );
});

describe("site settings page", () => {
  it("validates each field inline and restricts phone to digits", async () => {
    const user = userEvent.setup();
    renderSitePage();
    await user.click(await screen.findByRole("button", { name: "Configurar site" }));
    const form = screen.getByRole("form", { name: "Configuração do site" });
    const publicName = within(form).getByLabelText("Nome público");
    const phone = within(form).getByLabelText("Telefone");
    await user.type(publicName, "A");
    await user.type(phone, "(11) 12x");
    expect(phone).toHaveValue("1112");
    await user.click(
      within(form).getByRole("button", { name: "Salvar configuração" }),
    );

    expect(
      await within(form).findByText("Informe ao menos 2 caracteres."),
    ).toBeVisible();
    expect(within(form).getByText("Informe ao menos 8 dígitos.")).toBeVisible();
    expect(publicName).toHaveAttribute("aria-invalid", "true");
    expect(
      vi.mocked(fetch).mock.calls.some(
        ([input, init]) =>
          new URL(String(input)).pathname === "/sites" &&
          init?.method === "POST",
      ),
    ).toBe(false);
  });

  it("creates and updates the organization site identity and branding", async () => {
    const user = userEvent.setup();
    renderSitePage();

    expect(await screen.findByText("Configure a presença pública")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Configurar site" }));

    const form = screen.getByRole("form", { name: "Configuração do site" });
    await user.type(
      within(form).getByLabelText("Nome público"),
      site.publicName,
    );
    await user.type(within(form).getByLabelText("Identificador do site"), site.slug);
    await user.type(within(form).getByLabelText("Domínio"), site.domain);
    await user.type(within(form).getByLabelText("Telefone"), site.phone);
    await user.type(within(form).getByLabelText("Descrição"), site.description);
    await user.type(
      within(form).getByLabelText("Cor principal"),
      site.primaryColor,
    );
    await user.type(
      within(form).getByLabelText("Cor secundária"),
      site.secondaryColor,
    );
    await user.type(within(form).getByLabelText("URL do logotipo"), site.logoUrl);
    await user.click(
      within(form).getByRole("button", { name: "Salvar configuração" }),
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Configuração do site salva com sucesso.",
    );
    expect(await screen.findByText(site.publicName)).toBeVisible();
    expect(siteConfiguration).toMatchObject({
      publicName: site.publicName,
      slug: site.slug,
      domain: site.domain,
      primaryColor: site.primaryColor,
    });

    await user.click(screen.getByRole("button", { name: "Editar configuração" }));
    const editForm = screen.getByRole("form", {
      name: "Configuração do site",
    });
    const description = within(editForm).getByLabelText("Descrição");
    await user.clear(description);
    await user.type(description, "Aluguel de veículos atualizado");
    await user.click(
      within(editForm).getByRole("button", { name: "Salvar alterações" }),
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Configuração do site salva com sucesso.",
    );
    expect(siteConfiguration?.description).toBe(
      "Aluguel de veículos atualizado",
    );
  });

  it("shows a validation error from API and preserves entered values", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") return jsonResponse(currentUser);
      if (url.pathname === "/sites" && (init?.method ?? "GET") === "GET") {
        return jsonResponse(null);
      }
      if (url.pathname === "/sites" && init?.method === "POST") {
        return jsonResponse({ message: "Conflict" }, 409);
      }
      return jsonResponse({ message: "Not found" }, 404);
    });
    renderSitePage();
    await user.click(await screen.findByRole("button", { name: "Configurar site" }));
    const form = screen.getByRole("form", { name: "Configuração do site" });
    await user.type(within(form).getByLabelText("Nome público"), "Minha locadora");
    await user.type(within(form).getByLabelText("Identificador do site"), "locadora");
    await user.click(
      within(form).getByRole("button", { name: "Salvar configuração" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(/slug ou domínio/);
    expect(within(form).getByLabelText("Nome público")).toHaveValue(
      "Minha locadora",
    );
    expect(toast.error).toHaveBeenCalled();
  });

  it("deletes a site configuration after confirmation", async () => {
    const user = userEvent.setup();
    siteConfiguration = { ...site };
    renderSitePage();

    expect(await screen.findByText(site.publicName)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Excluir configuração" }));
    const dialog = screen.getByRole("dialog", { name: "Excluir configuração?" });
    await user.click(
      within(dialog).getByRole("button", { name: "Excluir site" }),
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Configuração do site excluída com sucesso.",
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Configurar site" })).toBeVisible(),
    );
  });
});
