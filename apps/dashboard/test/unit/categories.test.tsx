import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import CategoriesPage from "../../src/app/dashboard/categories/page";
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

const category = {
  id: "category-1",
  name: "SUV",
  description: "Utilitários esportivos",
  createdAt: "2026-10-20T12:00:00.000Z",
  updatedAt: "2026-10-20T12:00:00.000Z",
};

let categories: typeof category[];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderCategoriesPage() {
  return render(
    <AuthProvider>
      <CategoriesPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  categories = [{ ...category }];
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (
        url.pathname === "/vehicle-categories" &&
        (init?.method ?? "GET") === "GET"
      ) {
        return jsonResponse({
          data: categories,
          page: Number(url.searchParams.get("page")),
          limit: Number(url.searchParams.get("limit")),
          total: categories.length,
          totalPages: Math.ceil(categories.length / 10),
        });
      }
      if (
        url.pathname === "/vehicle-categories" &&
        init?.method === "POST"
      ) {
        const created = {
          ...category,
          id: "category-2",
          ...(JSON.parse(String(init.body)) as object),
        };
        categories = [created, ...categories];
        return jsonResponse(created, 201);
      }
      if (
        url.pathname.startsWith("/vehicle-categories/") &&
        init?.method === "PATCH"
      ) {
        const id = url.pathname.split("/").at(-1) ?? "";
        const updated = {
          ...category,
          ...(JSON.parse(String(init.body)) as object),
          id,
        };
        categories = categories.map((item) =>
          item.id === id ? updated : item,
        );
        return jsonResponse(updated);
      }
      if (
        url.pathname === "/vehicle-categories/bulk" &&
        init?.method === "DELETE"
      ) {
        const { ids } = JSON.parse(String(init.body)) as { ids: string[] };
        categories = categories.filter((item) => !ids.includes(item.id));
        return jsonResponse({ deletedCount: ids.length });
      }
      if (
        url.pathname.startsWith("/vehicle-categories/") &&
        init?.method === "DELETE"
      ) {
        const id = url.pathname.split("/").at(-1) ?? "";
        categories = categories.filter((item) => item.id !== id);
        return jsonResponse(null, 204);
      }
      return jsonResponse({ message: "Not found" }, 404);
    }),
  );
});

describe("vehicle categories page", () => {
  it("shows field-level validation and does not submit a too-short category name", async () => {
    const user = userEvent.setup();
    renderCategoriesPage();
    await user.click(screen.getByRole("button", { name: "Nova categoria" }));
    const dialog = screen.getByRole("dialog", { name: "Nova categoria" });
    const name = within(dialog).getByLabelText("Nome");
    await user.type(name, "A");
    await user.click(
      within(dialog).getByRole("button", { name: "Salvar categoria" }),
    );

    expect(
      await within(dialog).findByText("Informe ao menos 2 caracteres."),
    ).toBeVisible();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(
      vi.mocked(fetch).mock.calls.some(
        ([input, init]) =>
          new URL(String(input)).pathname === "/vehicle-categories" &&
          init?.method === "POST",
      ),
    ).toBe(false);
  });

  it("deletes a category individually", async () => {
    const user = userEvent.setup();
    renderCategoriesPage();

    const row = await screen.findByRole("row", { name: /SUV/ });
    await user.click(
      within(row).getByRole("button", { name: "Excluir SUV" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Excluir categoria?" });
    await user.click(
      within(dialog).getByRole("button", { name: "Excluir categoria" }),
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Categoria excluída com sucesso.",
    );
    expect(
      await screen.findByText("Nenhuma categoria cadastrada."),
    ).toBeVisible();
    expect(
      vi.mocked(fetch).mock.calls.some(
        ([input, init]) =>
          String(input).includes(
            "/vehicle-categories/category-1?organizationId=organization-1",
          ) && init?.method === "DELETE",
      ),
    ).toBe(true);
  });

  it("loads, creates, edits, and bulk deletes categories for the active organization", async () => {
    const user = userEvent.setup();
    renderCategoriesPage();

    const table = await screen.findByRole("table", {
      name: "Categorias de veículos da organização",
    });
    expect(within(table).getByText("SUV")).toBeVisible();
    expect(
      vi.mocked(fetch).mock.calls.some(([input]) =>
        String(input).includes(
          "/vehicle-categories?organizationId=organization-1&page=1&limit=10",
        ),
      ),
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Nova categoria" }));
    const createDialog = screen.getByRole("dialog", {
      name: "Nova categoria",
    });
    await user.type(within(createDialog).getByLabelText("Nome"), "Sedan");
    await user.type(
      within(createDialog).getByLabelText("Descrição"),
      "Carros de passeio",
    );
    await user.click(
      within(createDialog).getByRole("button", { name: "Salvar categoria" }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Categoria cadastrada com sucesso.",
    );
    const createdRow = await screen.findByRole("row", { name: /Sedan/ });

    await user.click(
      within(createdRow).getByRole("button", { name: "Editar Sedan" }),
    );
    const editDialog = screen.getByRole("dialog", {
      name: "Editar categoria",
    });
    const nameInput = within(editDialog).getByLabelText("Nome");
    await user.clear(nameInput);
    await user.type(nameInput, "Sedan executivo");
    await user.click(
      within(editDialog).getByRole("button", { name: "Salvar alterações" }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Categoria atualizada com sucesso.",
    );
    expect(await screen.findByText("Sedan executivo")).toBeVisible();

    await user.click(
      screen.getByRole("checkbox", {
        name: "Selecionar todas as categorias desta página",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Excluir selecionadas (2)" }),
    );
    const deleteDialog = screen.getByRole("dialog", {
      name: "Excluir categorias selecionadas?",
    });
    await user.click(
      within(deleteDialog).getByRole("button", {
        name: "Excluir categorias",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Categorias selecionadas excluídas com sucesso.",
    );
    expect(
      await screen.findByText("Nenhuma categoria cadastrada."),
    ).toBeVisible();

    const requests = vi.mocked(fetch).mock.calls.map(([input, init]) => ({
      url: String(input),
      init,
    }));
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes("/vehicle-categories?organizationId=organization-1") &&
          init?.method === "POST",
      ),
    ).toBe(true);
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes(
            "/vehicle-categories/category-2?organizationId=organization-1",
          ) && init?.method === "PATCH",
      ),
    ).toBe(true);
    expect(
      requests.some(
        ({ url, init }) =>
          url.includes(
            "/vehicle-categories/bulk?organizationId=organization-1",
          ) &&
          init?.method === "DELETE" &&
          init.body ===
            JSON.stringify({ ids: ["category-2", "category-1"] }),
      ),
    ).toBe(true);
  });
});
