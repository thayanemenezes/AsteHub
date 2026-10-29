import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import LocationsPage from "../../src/app/dashboard/locations/page";
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

const location = {
  id: "location-1",
  name: "Unidade Centro",
  address: "Rua das Flores, 123",
  city: "São Paulo",
  state: "SP",
  phone: "+55 11 3333-4444",
  description: "Atendimento no centro",
  managerName: "Maria Silva",
  createdAt: "2026-10-20T12:00:00.000Z",
  updatedAt: "2026-10-20T12:00:00.000Z",
};

let locations: typeof location[];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderLocationsPage() {
  return render(
    <AuthProvider>
      <LocationsPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
  locations = [{ ...location }];
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/locations" && (init?.method ?? "GET") === "GET") {
        return jsonResponse({
          data: locations,
          page: Number(url.searchParams.get("page")),
          limit: Number(url.searchParams.get("limit")),
          total: locations.length,
          totalPages: Math.ceil(locations.length / 10),
        });
      }
      if (url.pathname === "/locations" && init?.method === "POST") {
        const created = {
          ...location,
          id: "location-2",
          ...(JSON.parse(String(init.body)) as object),
        };
        locations = [created, ...locations];
        return jsonResponse(created, 201);
      }
      if (url.pathname.startsWith("/locations/") && init?.method === "PATCH") {
        const id = url.pathname.split("/").at(-1) ?? "";
        const updated = {
          ...location,
          ...(JSON.parse(String(init.body)) as object),
          id,
        };
        locations = locations.map((item) => (item.id === id ? updated : item));
        return jsonResponse(updated);
      }
      if (url.pathname === "/locations/bulk" && init?.method === "DELETE") {
        const { ids } = JSON.parse(String(init.body)) as { ids: string[] };
        locations = locations.filter((item) => !ids.includes(item.id));
        return jsonResponse({ deletedCount: ids.length });
      }
      if (url.pathname.startsWith("/locations/") && init?.method === "DELETE") {
        const id = url.pathname.split("/").at(-1) ?? "";
        locations = locations.filter((item) => item.id !== id);
        return jsonResponse(null, 204);
      }
      return jsonResponse({ message: "Not found" }, 404);
    }),
  );
});

describe("locations page", () => {
  it("accepts only numeric phone characters and displays inline field errors", async () => {
    const user = userEvent.setup();
    renderLocationsPage();
    await user.click(screen.getByRole("button", { name: "Nova unidade" }));
    const dialog = screen.getByRole("dialog", { name: "Nova unidade" });
    const phone = within(dialog).getByLabelText("Telefone");
    await user.type(phone, "12ab-34");
    expect(phone).toHaveValue("1234");
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar unidade" }),
    );

    expect(
      within(dialog).getByText("Informe ao menos 2 caracteres.", {
        selector: "#location-name-error",
      }),
    ).toBeVisible();
    expect(within(dialog).getByText("Informe ao menos 8 dígitos.")).toBeVisible();
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(
      vi.mocked(fetch).mock.calls.some(
        ([input, init]) =>
          new URL(String(input)).pathname === "/locations" &&
          init?.method === "POST",
      ),
    ).toBe(false);
  });

  it("loads, creates, edits, and bulk deletes organization locations", async () => {
    const user = userEvent.setup();
    renderLocationsPage();

    const table = await screen.findByRole("table", {
      name: "Unidades da organização",
    });
    expect(within(table).getByText("Unidade Centro")).toBeVisible();
    expect(within(table).getByText("São Paulo, SP")).toBeVisible();
    expect(
      vi.mocked(fetch).mock.calls.some(([input]) =>
        String(input).includes(
          "/locations?organizationId=organization-1&page=1&limit=10",
        ),
      ),
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Nova unidade" }));
    const createDialog = screen.getByRole("dialog", { name: "Nova unidade" });
    await user.type(within(createDialog).getByLabelText("Nome"), "Unidade Sul");
    await user.type(
      within(createDialog).getByLabelText("Endereço"),
      "Avenida Brasil, 50",
    );
    await user.type(within(createDialog).getByLabelText("Cidade"), "Curitiba");
    await user.type(within(createDialog).getByLabelText("Estado"), "PR");
    await user.type(
      within(createDialog).getByLabelText("Gestor"),
      "João Santos",
    );
    await user.click(
      within(createDialog).getByRole("button", { name: "Salvar unidade" }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Unidade cadastrada com sucesso.",
    );

    const createdRow = await screen.findByRole("row", { name: /Unidade Sul/ });
    await user.click(
      within(createdRow).getByRole("button", { name: "Editar Unidade Sul" }),
    );
    const editDialog = screen.getByRole("dialog", { name: "Editar unidade" });
    const nameInput = within(editDialog).getByLabelText("Nome");
    await user.clear(nameInput);
    await user.type(nameInput, "Unidade Sul Atualizada");
    await user.click(
      within(editDialog).getByRole("button", { name: "Salvar alterações" }),
    );
    expect(toast.success).toHaveBeenCalledWith("Unidade atualizada com sucesso.");
    expect(await screen.findByText("Unidade Sul Atualizada")).toBeVisible();

    await user.click(
      screen.getByRole("checkbox", {
        name: "Selecionar todas as unidades desta página",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Excluir selecionadas (2)" }),
    );
    const deleteDialog = screen.getByRole("dialog", {
      name: "Excluir unidades selecionadas?",
    });
    await user.click(
      within(deleteDialog).getByRole("button", { name: "Excluir unidades" }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Unidades selecionadas excluídas com sucesso.",
    );
    expect(await screen.findByText("Nenhuma unidade cadastrada.")).toBeVisible();

    const requests = vi.mocked(fetch).mock.calls.map(([input, init]) => ({
      url: String(input),
      init,
    }));
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes("/locations?organizationId=organization-1") &&
          init?.method === "POST" &&
          JSON.parse(String(init.body)).managerName === "João Santos",
      ),
    ).toBe(true);
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes(
            "/locations/location-2?organizationId=organization-1",
          ) && init?.method === "PATCH",
      ),
    ).toBe(true);
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes("/locations/bulk?organizationId=organization-1") &&
          init?.method === "DELETE",
      ),
    ).toBe(true);
  });

  it("deletes a location individually", async () => {
    const user = userEvent.setup();
    renderLocationsPage();

    const row = await screen.findByRole("row", { name: /Unidade Centro/ });
    await user.click(
      within(row).getByRole("button", { name: "Excluir Unidade Centro" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Excluir unidade?" });
    await user.click(
      within(dialog).getByRole("button", { name: "Excluir unidade" }),
    );
    expect(toast.success).toHaveBeenCalledWith("Unidade excluída com sucesso.");
  });

  it("navigates through paginated locations", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/locations" && (init?.method ?? "GET") === "GET") {
        const pageNumber = Number(url.searchParams.get("page"));
        return jsonResponse({
          data:
            pageNumber === 1
              ? [location]
              : [{ ...location, id: "location-2", name: "Unidade Sul" }],
          page: pageNumber,
          limit: 10,
          total: 11,
          totalPages: 2,
        });
      }
      return jsonResponse({ message: "Not found" }, 404);
    });
    renderLocationsPage();

    await screen.findByRole("table", { name: "Unidades da organização" });
    await user.click(screen.getByRole("button", { name: "Próxima página" }));

    expect(await screen.findByText("Unidade Sul")).toBeVisible();
    expect(screen.getByText("Página 2 de 2")).toBeVisible();
    expect(
      vi.mocked(fetch).mock.calls.some(([input]) =>
        String(input).includes(
          "/locations?organizationId=organization-1&page=2&limit=10",
        ),
      ),
    ).toBe(true);
  });
});
