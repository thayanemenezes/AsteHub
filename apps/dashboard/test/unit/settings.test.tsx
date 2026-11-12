import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import SettingsForm from "../../src/app/dashboard/settings/settings-form";
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

let siteConfiguration: Record<string, unknown> | null;
let dashboardLanguage: "pt-BR" | "en";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderSettings() {
  return render(
    <AuthProvider>
      <SettingsForm />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
  siteConfiguration = null;
  dashboardLanguage = "pt-BR";
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/users/me/settings") {
        if (init?.method === "PATCH") {
          dashboardLanguage = (
            JSON.parse(String(init.body)) as { language: "pt-BR" | "en" }
          ).language;
        }
        return jsonResponse({ language: dashboardLanguage });
      }
      if (url.pathname === "/sites" && (init?.method ?? "GET") === "GET") {
        return siteConfiguration
          ? jsonResponse(siteConfiguration)
          : jsonResponse({ message: "Not found" }, 404);
      }
      if (url.pathname === "/sites" && init?.method === "POST") {
        siteConfiguration = {
          id: "site-1",
          ...(JSON.parse(String(init.body)) as object),
        };
        return jsonResponse(siteConfiguration, 201);
      }
      if (url.pathname.startsWith("/sites/") && init?.method === "PATCH") {
        siteConfiguration = {
          ...siteConfiguration,
          ...(JSON.parse(String(init.body)) as object),
        };
        return jsonResponse(siteConfiguration);
      }
      return jsonResponse({ message: "Not found" }, 404);
    }),
  );
});

describe("dashboard settings", () => {
  it("shows ready-to-edit settings and creates site settings on save", async () => {
    const user = userEvent.setup();
    renderSettings();

    await screen.findByLabelText("Nome público");
    await waitFor(() =>
      expect(screen.getByLabelText("Nome público")).toHaveValue(
        "Locadora Central",
      ),
    );
    expect(screen.getByLabelText("Identificador do site")).toHaveValue(
      "locadora-central",
    );
    expect(screen.getByLabelText("Idioma do dashboard")).toHaveValue("pt-BR");
    expect(
      screen.queryByRole("button", { name: /configurar site/i }),
    ).not.toBeInTheDocument();

    const siteForm = screen.getByRole("form", {
      name: "Configurações do site",
    });
    await user.type(
      within(siteForm).getByLabelText("Título SEO"),
      "Aluguel de veículos",
    );
    await user.type(
      within(siteForm).getByLabelText("Imagem Open Graph (HTTPS)"),
      "https://cdn.example.com/preview.png",
    );
    await user.click(
      within(siteForm).getByRole("button", {
        name: "Salvar configurações do site",
      }),
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Configurações do site salvas com sucesso.",
    );
    expect(siteConfiguration).toMatchObject({
      publicName: "Locadora Central",
      slug: "locadora-central",
      seoTitle: "Aluguel de veículos",
      ogImageUrl: "https://cdn.example.com/preview.png",
    });
  });

  it("saves the account language and validates secure image URLs", async () => {
    const user = userEvent.setup();
    renderSettings();

    const languageSelect = await screen.findByLabelText(
      "Idioma do dashboard",
    );
    await user.selectOptions(languageSelect, "en");
    await user.click(
      screen.getByRole("button", { name: "Salvar preferência" }),
    );
    expect(dashboardLanguage).toBe("en");
    expect(toast.success).toHaveBeenCalledWith(
      "Idioma preferido salvo com sucesso.",
    );

    const siteForm = screen.getByRole("form", {
      name: "Configurações do site",
    });
    await user.type(
      within(siteForm).getByLabelText("Imagem Open Graph (HTTPS)"),
      "http://cdn.example.com/preview.png",
    );
    await user.click(
      within(siteForm).getByRole("button", {
        name: "Salvar configurações do site",
      }),
    );

    expect(
      await within(siteForm).findByText("Informe uma URL HTTPS válida."),
    ).toBeVisible();
    expect(siteConfiguration).toBeNull();
  });

  it("shows a load error and retries fetching settings", async () => {
    const user = userEvent.setup();
    let failFirstSettingsRequest = true;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/users/me/settings") {
        if (failFirstSettingsRequest) {
          failFirstSettingsRequest = false;
          return jsonResponse({ message: "Unavailable" }, 503);
        }
        return jsonResponse({ language: "pt-BR" });
      }
      if (url.pathname === "/sites") {
        return jsonResponse({ message: "Not found" }, 404);
      }
      return jsonResponse({ message: "Not found" }, 404);
    });

    renderSettings();

    expect(
      await screen.findByText(
        "Não foi possível carregar as configurações. Tente novamente.",
      ),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByLabelText("Idioma do dashboard")).toBeVisible();
  });
});
