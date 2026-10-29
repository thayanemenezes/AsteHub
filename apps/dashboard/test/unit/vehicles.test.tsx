import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import VehiclesPage from "../../src/app/dashboard/vehicles/page";
import { AuthProvider } from "../../src/auth/auth-provider";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: ({ autoClose }: { autoClose: number }) => (
    <div data-testid="toast-container" data-auto-close={autoClose} />
  ),
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

const vehicle = {
  id: "vehicle-1",
  make: "Toyota",
  model: "Corolla",
  year: 2024,
  description: "Sedan automático",
  createdAt: "2026-10-20T12:00:00.000Z",
  updatedAt: "2026-10-20T12:00:00.000Z",
};

let vehicles: typeof vehicle[];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderVehiclesPage() {
  return render(
    <AuthProvider>
      <VehiclesPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  vehicles = [{ ...vehicle }];
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/vehicles" && init?.method === "POST") {
        const created = {
          ...vehicle,
          id: "vehicle-2",
          ...(JSON.parse(String(init.body)) as object),
        };
        vehicles = [created, ...vehicles];
        return jsonResponse(created, 201);
      }
      if (url.pathname === "/vehicles" && (init?.method ?? "GET") === "GET") {
        return jsonResponse({
          data: vehicles,
          page: Number(url.searchParams.get("page")),
          limit: Number(url.searchParams.get("limit")),
          total: vehicles.length,
          totalPages: Math.ceil(vehicles.length / 10),
        });
      }
      if (
        url.pathname.startsWith("/vehicles/") &&
        init?.method === "PATCH"
      ) {
        const id = url.pathname.split("/").at(-1) ?? "";
        const updated = {
          ...vehicle,
          ...(JSON.parse(String(init.body)) as object),
          id,
        };
        vehicles = vehicles.map((item) =>
          item.id === id ? updated : item,
        );
        return jsonResponse(updated);
      }
      if (url.pathname === "/vehicles/bulk" && init?.method === "DELETE") {
        const { ids } = JSON.parse(String(init.body)) as { ids: string[] };
        vehicles = vehicles.filter((item) => !ids.includes(item.id));
        return jsonResponse({ deletedCount: ids.length });
      }
      if (
        url.pathname.startsWith("/vehicles/") &&
        init?.method === "DELETE"
      ) {
        const id = url.pathname.split("/").at(-1) ?? "";
        vehicles = vehicles.filter((item) => item.id !== id);
        return jsonResponse(null, 204);
      }
      return jsonResponse({ message: "Not found" }, 404);
    }),
  );
});

describe("vehicle management page", () => {
  it("shows field-level validation errors and blocks invalid vehicle requests", async () => {
    const user = userEvent.setup();
    renderVehiclesPage();
    await user.click(screen.getByRole("button", { name: "Novo veículo" }));
    const dialog = screen.getByRole("dialog", { name: "Novo veículo" });
    const make = within(dialog).getByLabelText("Marca");
    const model = within(dialog).getByLabelText("Modelo");
    const year = within(dialog).getByLabelText("Ano");
    await user.clear(make);
    await user.type(make, "A");
    await user.clear(model);
    await user.clear(year);
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar veículo" }),
    );

    expect(
      within(dialog).getByText("Informe ao menos 2 caracteres.", {
        selector: "#vehicle-make-error",
      }),
    ).toBeVisible();
    expect(within(dialog).getByText("O ano deve conter 4 dígitos.")).toBeVisible();
    expect(make).toHaveAttribute("aria-invalid", "true");
    expect(
      vi.mocked(fetch).mock.calls.some(
        ([input, init]) =>
          new URL(String(input)).pathname === "/vehicles" &&
          init?.method === "POST",
      ),
    ).toBe(false);
  });

  it("loads the tenant vehicle list and integrates create, edit, and bulk delete", async () => {
    const user = userEvent.setup();
    renderVehiclesPage();

    expect(await screen.findByTestId("toast-container")).toHaveAttribute(
      "data-auto-close",
      "4000",
    );

    const table = await screen.findByRole("table", {
      name: "Veículos da organização",
    });
    expect(within(table).getByText(/Toyota\s+Corolla/)).toBeVisible();
    expect(vi.mocked(fetch).mock.calls.some(([input]) =>
      String(input).includes(
        "/vehicles?organizationId=organization-1&page=1&limit=10",
      ),
    )).toBe(true);

    await user.click(screen.getByRole("button", { name: "Novo veículo" }));
    const createDialog = screen.getByRole("dialog", { name: "Novo veículo" });
    await user.type(within(createDialog).getByLabelText("Marca"), "Honda");
    await user.type(within(createDialog).getByLabelText("Modelo"), "Civic");
    await user.clear(within(createDialog).getByLabelText("Ano"));
    await user.type(within(createDialog).getByLabelText("Ano"), "2025");
    await user.click(
      within(createDialog).getByRole("button", { name: "Salvar veículo" }),
    );
    expect(toast.success).toHaveBeenNthCalledWith(
      1,
      "Veículo cadastrado com sucesso.",
    );

    const createdRow = await screen.findByRole("row", {
      name: /Honda Civic 2025/,
    });
    expect(createdRow).toBeVisible();

    await user.click(
      within(createdRow).getByRole("button", { name: "Editar Honda Civic" }),
    );
    const editDialog = screen.getByRole("dialog", { name: "Editar veículo" });
    const modelInput = within(editDialog).getByLabelText("Modelo");
    await user.clear(modelInput);
    await user.type(modelInput, "Civic Touring");
    await user.click(
      within(editDialog).getByRole("button", { name: "Salvar alterações" }),
    );
    expect(toast.success).toHaveBeenNthCalledWith(
      2,
      "Veículo atualizado com sucesso.",
    );
    expect(await screen.findByText(/Civic Touring/)).toBeVisible();

    const selection = screen.getByRole("checkbox", {
      name: "Selecionar todos os veículos desta página",
    });
    await user.click(selection);
    await user.click(screen.getByRole("button", { name: "Excluir selecionados (2)" }));
    const confirmation = screen.getByRole("dialog", {
      name: "Excluir veículos selecionados?",
    });
    await user.click(
      within(confirmation).getByRole("button", { name: "Excluir veículos" }),
    );
    expect(toast.success).toHaveBeenNthCalledWith(
      3,
      "Veículos selecionados excluídos com sucesso.",
    );
    expect(await screen.findByText("Nenhum veículo cadastrado.")).toBeVisible();

    const requests = vi.mocked(fetch).mock.calls.map(([input, init]) => ({
      url: String(input),
      init,
    }));
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes("/vehicles?organizationId=organization-1") &&
          init?.method === "POST",
      ),
    ).toBe(true);
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes("/vehicles/vehicle-2?organizationId=organization-1") &&
          init?.method === "PATCH",
      ),
    ).toBe(true);
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes("/vehicles/bulk?organizationId=organization-1") &&
          init?.method === "DELETE" &&
          init.body === JSON.stringify({ ids: ["vehicle-2", "vehicle-1"] }),
      ),
    ).toBe(true);
  });

  it("shows a Toastify success notification after deleting one vehicle", async () => {
    const user = userEvent.setup();
    renderVehiclesPage();

    const row = await screen.findByRole("row", { name: /Toyota Corolla 2024/ });
    await user.click(
      within(row).getByRole("button", { name: "Excluir Toyota Corolla" }),
    );
    const confirmation = screen.getByRole("dialog", {
      name: "Excluir veículo?",
    });
    await user.click(
      within(confirmation).getByRole("button", { name: "Excluir veículo" }),
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Veículo excluído com sucesso.",
    );
  });

  it("navigates between pages without hiding the current list while refreshing", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/vehicles" && (init?.method ?? "GET") === "GET") {
        const page = Number(url.searchParams.get("page"));
        return jsonResponse({
          data:
            page === 1
              ? [vehicle]
              : [{ ...vehicle, id: "vehicle-2", make: "Honda", model: "Civic" }],
          page,
          limit: 10,
          total: 11,
          totalPages: 2,
        });
      }
      return jsonResponse({}, 404);
    });
    renderVehiclesPage();

    const table = await screen.findByRole("table", {
      name: "Veículos da organização",
    });
    expect(within(table).getByText(/Toyota\s+Corolla/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(await screen.findByText(/Honda\s+Civic/)).toBeVisible();
    expect(screen.getByText("Página 2 de 2")).toBeVisible();
    expect(
      vi.mocked(fetch).mock.calls.some(([input]) =>
        String(input).includes(
          "/vehicles?organizationId=organization-1&page=2&limit=10",
        ),
      ),
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(await screen.findByText(/Toyota\s+Corolla/)).toBeVisible();
    expect(screen.getByText("Página 1 de 2")).toBeVisible();
  });

  it("shows a recoverable loading error instead of a false empty state", async () => {
    const fetcher = vi.mocked(fetch);
    fetcher.mockImplementationOnce(async (input) => {
      expect(String(input)).toMatch(/\/auth\/me$/);
      return jsonResponse(currentUser);
    });
    fetcher.mockImplementationOnce(async () => {
      return Promise.reject(new TypeError("Network unavailable"));
    });
    const user = userEvent.setup();
    renderVehiclesPage();

    expect(
      await screen.findByText("Não foi possível carregar os veículos."),
    ).toBeVisible();
    expect(screen.queryByText("Nenhum veículo cadastrado.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() =>
      expect(screen.getByRole("table", { name: "Veículos da organização" })).toBeVisible(),
    );
  });
});
