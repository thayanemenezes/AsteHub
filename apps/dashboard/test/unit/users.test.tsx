import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import { AcceptInvitationForm } from "../../src/app/accept-invitation/accept-invitation-form";
import UsersPage from "../../src/app/dashboard/users/page";
import { AuthProvider } from "../../src/auth/auth-provider";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

const currentUser = {
  id: "owner-id",
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

const ownerMember = {
  id: "membership-owner",
  email: "owner@example.com",
  role: "OWNER" as const,
  status: "ACTIVE" as const,
  createdAt: "2026-10-20T12:00:00.000Z",
};

const regularMember = {
  id: "membership-member",
  email: "member@example.com",
  role: "MEMBER" as const,
  status: "ACTIVE" as const,
  createdAt: "2026-10-21T12:00:00.000Z",
};

const pendingInvitation = {
  id: "invitation-1",
  email: "invited@example.com",
  role: "ADMIN" as const,
  expiresAt: "2026-10-28T12:00:00.000Z",
  createdAt: "2026-10-21T12:00:00.000Z",
};

let members: (typeof ownerMember)[];
let invitations: (typeof pendingInvitation)[];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderUsersPage() {
  return render(
    <AuthProvider>
      <UsersPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(toast.success).mockClear();
  vi.mocked(toast.error).mockClear();
  members = [{ ...ownerMember }, { ...regularMember }];
  invitations = [{ ...pendingInvitation }];
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      if (url.pathname === "/auth/me") {
        return jsonResponse(currentUser);
      }
      if (url.pathname === "/users" && method === "GET") {
        return jsonResponse({ members, invitations });
      }
      if (url.pathname === "/users/invitations" && method === "POST") {
        const input = JSON.parse(String(init?.body)) as {
          email: string;
          role: "ADMIN" | "MEMBER" | "OWNER";
        };
        const invitation = {
          ...pendingInvitation,
          id: "invitation-2",
          email: input.email,
          role: input.role,
        };
        invitations = [...invitations, invitation];
        return jsonResponse(invitation, 201);
      }
      if (
        url.pathname.startsWith("/users/invitations/") &&
        method === "DELETE"
      ) {
        const id = url.pathname.split("/").at(-1);
        invitations = invitations.filter((invitation) => invitation.id !== id);
        return jsonResponse(null, 204);
      }
      if (url.pathname.startsWith("/users/") && method === "PATCH") {
        const id = url.pathname.split("/").at(-1);
        const input = JSON.parse(String(init?.body)) as {
          role: "ADMIN" | "MEMBER" | "OWNER";
        };
        members = members.map((member) =>
          member.id === id ? { ...member, role: input.role } : member,
        );
        return jsonResponse(members.find((member) => member.id === id));
      }
      if (url.pathname.startsWith("/users/") && method === "DELETE") {
        const id = url.pathname.split("/").at(-1);
        members = members.filter((member) => member.id !== id);
        return jsonResponse(null, 204);
      }
      return jsonResponse({ message: "Not found" }, 404);
    }),
  );
});

describe("organization users page", () => {
  it("lists organization members and pending invitations and filters them", async () => {
    const user = userEvent.setup();
    renderUsersPage();

    const table = await screen.findByRole("table", {
      name: "Usuários da organização",
    });

    expect(within(table).getByText("owner@example.com")).toBeVisible();
    expect(within(table).getByText("member@example.com")).toBeVisible();
    expect(
      screen.getByRole("table", { name: "Convites pendentes" }),
    ).toHaveTextContent("invited@example.com");

    await user.type(
      screen.getByRole("searchbox", { name: "Pesquisar usuários" }),
      "member@",
    );
    await waitFor(() => {
      expect(within(table).getByText("member@example.com")).toBeVisible();
      expect(within(table).queryByText("owner@example.com")).toBeNull();
    });
  });

  describe("organization invitation acceptance", () => {
    it("accepts the invitation and directs the new member to sign in", async () => {
      const user = userEvent.setup();
      vi.stubGlobal(
        "fetch",
        vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
          const url = new URL(String(input));
          if (
            url.pathname === "/users/invitations/accept" &&
            init?.method === "POST"
          ) {
            expect(JSON.parse(String(init.body))).toEqual({
              token: "invitation-token",
              password: "a-secure-member-password",
            });
            return jsonResponse({ email: "new-person@example.com" }, 201);
          }
          return jsonResponse({ message: "Not found" }, 404);
        }),
      );
      render(<AcceptInvitationForm token="invitation-token" />);
      await user.type(
        screen.getByLabelText("Senha"),
        "a-secure-member-password",
      );
      await user.click(screen.getByRole("button", { name: "Aceitar convite" }));

      expect(
        screen.getByRole("heading", { name: "Convite aceito" }),
      ).toBeVisible();
      expect(screen.getByText(/new-person@example\.com/)).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Ir para o login" }),
      ).toHaveAttribute("href", "/login");
    });
  });

  it("invites a team member and updates the list", async () => {
    const user = userEvent.setup();
    renderUsersPage();

    await user.click(
      await screen.findByRole("button", { name: "Convidar usuário" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Convidar usuário" });
    await user.type(
      within(dialog).getByLabelText("E-mail"),
      "new-person@example.com",
    );
    await user.selectOptions(within(dialog).getByLabelText("Papel"), "ADMIN");
    await user.click(
      within(dialog).getByRole("button", { name: "Enviar convite" }),
    );

    expect(await screen.findByText("new-person@example.com")).toBeVisible();
    expect(toast.success).toHaveBeenCalledWith("Convite enviado com sucesso.");
    const invitationCall = vi
      .mocked(fetch)
      .mock.calls.find(
        ([input, init]) =>
          new URL(String(input)).pathname === "/users/invitations" &&
          init?.method === "POST",
      );
    expect(JSON.parse(String(invitationCall?.[1]?.body))).toEqual({
      email: "new-person@example.com",
      role: "ADMIN",
    });
  });

  it("changes a member role and removes the member", async () => {
    const user = userEvent.setup();
    renderUsersPage();

    const roleSelect = await screen.findByRole("combobox", {
      name: "Papel de member@example.com",
    });
    await user.selectOptions(roleSelect, "ADMIN");
    await waitFor(() => expect(roleSelect).toHaveValue("ADMIN"));

    await user.click(
      screen.getByRole("button", { name: "Remover member@example.com" }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Remover acesso",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Remover acesso" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("member@example.com")).toBeNull();
    });
    expect(toast.success).toHaveBeenCalledWith("Acesso removido com sucesso.");
  });
});
