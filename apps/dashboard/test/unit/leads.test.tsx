import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import type { Lead } from "@repo/contracts";
import LeadsPage from "../../src/app/dashboard/leads/page";
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

const lead: Lead = {
  id: "lead-1",
  contactName: "Ana Souza",
  email: "ana@example.com",
  phone: "11987654321",
  message: "Gostaria de uma cotação para um SUV.",
  status: "NEW",
  vehicleId: null,
  locationId: null,
  vehicle: null,
  location: null,
  createdAt: "2026-10-20T12:00:00.000Z",
  updatedAt: "2026-10-20T12:00:00.000Z",
};

let leads: Lead[];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderLeadsPage() {
  return render(
    <AuthProvider>
      <LeadsPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
  leads = [{ ...lead }];
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/leads" && method === "GET") {
        return jsonResponse({
          data: leads,
          page: Number(url.searchParams.get("page")),
          limit: Number(url.searchParams.get("limit")),
          total: leads.length,
          totalPages: Math.ceil(leads.length / 10),
        });
      }
      if (url.pathname === "/vehicles" || url.pathname === "/locations") {
        return jsonResponse({
          data: [],
          page: 1,
          limit: 100,
          total: 0,
          totalPages: 0,
        });
      }
      if (url.pathname === "/leads" && method === "POST") {
        const created: Lead = {
          ...lead,
          id: "lead-2",
          ...(JSON.parse(String(init?.body)) as Partial<Lead>),
        };
        leads = [created, ...leads];
        return jsonResponse(created, 201);
      }
      if (url.pathname.startsWith("/leads/") && method === "PATCH") {
        const id = url.pathname.split("/").at(-1) ?? "";
        const existing = leads.find((item) => item.id === id);
        if (!existing) {
          return jsonResponse({ message: "Not found" }, 404);
        }
        const updated: Lead = {
          ...existing,
          ...(JSON.parse(String(init?.body)) as Partial<Lead>),
          id,
        };
        leads = leads.map((item) => (item.id === id ? updated : item));
        return jsonResponse(updated);
      }
      if (url.pathname === "/leads/bulk" && method === "DELETE") {
        const { ids } = JSON.parse(String(init?.body)) as { ids: string[] };
        leads = leads.filter((item) => !ids.includes(item.id));
        return jsonResponse({ deletedCount: ids.length });
      }
      if (url.pathname.startsWith("/leads/") && method === "DELETE") {
        const id = url.pathname.split("/").at(-1) ?? "";
        leads = leads.filter((item) => item.id !== id);
        return jsonResponse(null, 204);
      }
      return jsonResponse({ message: "Not found" }, 404);
    }),
  );
});

describe("leads page", () => {
  it("lists leads for the active organization", async () => {
    renderLeadsPage();

    const table = await screen.findByRole(
      "table",
      { name: "Leads da organização" },
      { timeout: 5000 },
    );
    expect(within(table).getByText("Ana Souza")).toBeVisible();
    expect(within(table).getByText("Novo")).toBeVisible();
    expect(
      vi.mocked(fetch).mock.calls.some(([input]) =>
        String(input).includes(
          "/leads?organizationId=organization-1&page=1&limit=10",
        ),
      ),
    ).toBe(true);
  });

  it("shows field errors and blocks invalid lead creation", async () => {
    const user = userEvent.setup();
    renderLeadsPage();
    await user.click(await screen.findByRole("button", { name: "Novo lead" }));
    const dialog = screen.getByRole("dialog", { name: "Novo lead" });
    await user.type(within(dialog).getByLabelText("Nome do contato"), "A");
    const phone = within(dialog).getByLabelText("Telefone");
    await user.type(phone, "11ab");
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar lead" }),
    );

    expect(
      within(dialog).getByText("Informe ao menos 2 caracteres.", {
        selector: "#lead-contact-name-error",
      }),
    ).toBeVisible();
    expect(
      within(dialog).getByText("Informe um telefone com 8 a 15 dígitos."),
    ).toBeVisible();
    expect(phone).toHaveValue("11");
    expect(
      vi.mocked(fetch).mock.calls.some(
        ([input, init]) =>
          new URL(String(input)).pathname === "/leads" &&
          init?.method === "POST",
      ),
    ).toBe(false);
  });

  it("creates a lead and refreshes the list", async () => {
    const user = userEvent.setup();
    renderLeadsPage();
    await user.click(await screen.findByRole("button", { name: "Novo lead" }));
    const dialog = screen.getByRole("dialog", { name: "Novo lead" });
    await user.type(
      within(dialog).getByLabelText("Nome do contato"),
      "Carlos Lima",
    );
    await user.type(within(dialog).getByLabelText("Telefone"), "11912345678");
    await user.type(
      within(dialog).getByLabelText("Mensagem"),
      "Preciso de informações sobre aluguel.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar lead" }),
    );

    expect(toast.success).toHaveBeenCalledWith("Lead cadastrado com sucesso.");
    expect(await screen.findByText("Carlos Lima")).toBeVisible();
    expect(
      vi.mocked(fetch).mock.calls.some(
        ([input, init]) =>
          new URL(String(input)).pathname === "/leads" &&
          init?.method === "POST" &&
          JSON.parse(String(init.body)).phone === "11912345678",
      ),
    ).toBe(true);
  });

  it("updates lead status and deletes selected leads", async () => {
    const user = userEvent.setup();
    renderLeadsPage();
    const table = await screen.findByRole(
      "table",
      { name: "Leads da organização" },
      { timeout: 5000 },
    );
    const row = within(table).getByRole("row", { name: /Ana Souza/ });
    await user.click(
      within(row).getByRole("button", { name: "Editar lead de Ana Souza" }),
    );
    const editDialog = screen.getByRole("dialog", { name: "Editar lead" });
    await user.selectOptions(within(editDialog).getByLabelText("Status"), "CONTACTED");
    await user.click(
      within(editDialog).getByRole("button", { name: "Salvar alterações" }),
    );
    expect(toast.success).toHaveBeenCalledWith("Lead atualizado com sucesso.");
    expect(await screen.findByText("Contatado")).toBeVisible();

    await user.click(
      screen.getByRole("checkbox", { name: "Selecionar Ana Souza" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Excluir selecionados (1)" }),
    );
    const deleteDialog = screen.getByRole("dialog", {
      name: "Excluir leads selecionados?",
    });
    await user.click(
      within(deleteDialog).getByRole("button", { name: "Excluir leads" }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Leads selecionados excluídos com sucesso.",
    );
    expect(await screen.findByText("Nenhum lead cadastrado.")).toBeVisible();
  });
});
