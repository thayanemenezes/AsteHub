import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "../../src/app/login/page";
import RegisterPage from "../../src/app/register/page";
import AccountPage from "../../src/app/account/page";
import { AuthProvider } from "../../src/auth/auth-provider";
import { AuthApi } from "../../src/auth/auth-api";

const { push, redirect } = vi.hoisted(() => ({
  push: vi.fn(),
  redirect: vi.fn(),
}));
let storageSetItem: ReturnType<typeof vi.fn>;

vi.mock("next/navigation", () => ({
  redirect,
  useRouter: () => ({ push, replace: push, refresh: vi.fn() }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const publicUser = {
  id: "user-1",
  email: "driver@example.com",
  createdAt: "2026-10-20T12:00:00.000Z",
  organizations: [],
};

function renderLogin() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );
}

function renderRegister() {
  return render(
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  push.mockReset();
  redirect.mockReset();
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(null, 401)));
  storageSetItem = vi.fn();
  const storage = {
    length: 0,
    clear: vi.fn(),
    getItem: vi.fn(() => null),
    key: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: storageSetItem,
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: storage,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("login form", () => {
  it("renders accessible fields and validates invalid values before submitting", async () => {
    const user = userEvent.setup();
    renderLogin();

    expect(
      screen.getByRole("heading", { name: "Entrar no AsteHub" }),
    ).toBeVisible();
    expect(screen.getByLabelText("AsteHub início").querySelector("svg")).toHaveAttribute(
      "viewBox",
      "0 0 42 42",
    );
    expect(screen.getByLabelText("AsteHub início")).toHaveTextContent("AsteHub");
    const email = screen.getByRole("textbox", { name: /E-mail/ });
    const password = screen.getByLabelText("Senha");
    expect(email).toHaveAttribute("type", "email");
    expect(email).toBeRequired();
    expect(password).toHaveAttribute("type", "password");
    expect(password).toBeRequired();

    await user.type(email, "not-an-email");
    await user.type(password, "short");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Informe um e-mail válido.",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe(
      "http://localhost:3001/auth/me",
    );
  });

  it("logs in with the API contract and redirects after success", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(null, 401))
      .mockResolvedValueOnce(jsonResponse(publicUser))
      .mockResolvedValueOnce(jsonResponse(publicUser));
    renderLogin();

    await user.type(
      screen.getByRole("textbox", { name: /E-mail/ }),
      publicUser.email,
    );
    await user.type(
      screen.getByLabelText("Senha"),
      "correct-horse-battery-staple",
    );
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    const loginRequest = vi.mocked(fetch).mock.calls[1];
    expect(loginRequest?.[0]).toBe("http://localhost:3001/auth/login");
    expect(loginRequest?.[1]).toMatchObject({
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: publicUser.email,
        password: "correct-horse-battery-staple",
      }),
    });
    expect(vi.mocked(fetch).mock.calls[2]?.[0]).toBe(
      "http://localhost:3001/auth/me",
    );
    expect(vi.mocked(fetch).mock.calls[2]?.[1]).toMatchObject({
      credentials: "include",
    });
    expect(vi.mocked(storageSetItem)).not.toHaveBeenCalled();
  });

  it("shows a generic credential error and a network failure accessibly", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(null, 401))
      .mockResolvedValueOnce(
        jsonResponse({ message: "Invalid email or password." }, 401),
      );
    renderLogin();

    await user.type(
      screen.getByRole("textbox", { name: /E-mail/ }),
      publicUser.email,
    );
    await user.type(
      screen.getByLabelText("Senha"),
      "correct-horse-battery-staple",
    );
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou senha inválidos.",
    );

    vi.mocked(fetch).mockRejectedValueOnce(
      new TypeError("Network unavailable"),
    );
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível conectar à API. Tente novamente.",
    );
  });
});

describe("authentication API client", () => {
  it("calls the browser fetch function with its global receiver", async () => {
    let receiver: unknown;
    const browserFetch = vi.fn(function (
      this: unknown,
    ): Promise<Response> {
      receiver = this;
      return Promise.resolve(jsonResponse(publicUser));
    });
    vi.stubGlobal("fetch", browserFetch);

    const api = new AuthApi("http://localhost:3001");
    await api.register({
      email: publicUser.email,
      password: "correct-horse-battery-staple",
      organizationName: "AsteHub",
    });

    expect(receiver).toBe(globalThis);
  });
});

describe("registration form", () => {
  it("validates and submits the exact registration contract", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(null, 401))
      .mockResolvedValueOnce(jsonResponse(publicUser))
      .mockResolvedValueOnce(jsonResponse(publicUser));
    renderRegister();

    expect(
      screen.getByRole("heading", { name: "Crie sua conta" }),
    ).toBeVisible();
    expect(
      screen.getByRole("textbox", { name: /Nome da organização/ }),
    ).toBeRequired();
    await user.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "O nome da organização deve ter entre 2 e 120 caracteres.",
    );
    expect(fetch).toHaveBeenCalledTimes(1);

    await user.type(
      screen.getByRole("textbox", { name: "Nome da organização" }),
      "Locadora Central",
    );
    await user.type(
      screen.getByRole("textbox", { name: /E-mail/ }),
      publicUser.email,
    );
    await user.type(
      screen.getByLabelText("Senha"),
      "correct-horse-battery-staple",
    );
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    const registerRequest = vi.mocked(fetch).mock.calls[1];
    expect(registerRequest?.[0]).toBe("http://localhost:3001/auth/register");
    expect(registerRequest?.[1]).toMatchObject({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        email: publicUser.email,
        password: "correct-horse-battery-staple",
        organizationName: "Locadora Central",
      }),
    });
    expect(vi.mocked(fetch).mock.calls[2]?.[0]).toBe(
      "http://localhost:3001/auth/me",
    );
  });

  it("shows duplicate registration failures without revealing account details", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(null, 401))
      .mockResolvedValueOnce(
        jsonResponse(
          { message: "Unable to register with these details." },
          409,
        ),
      );
    renderRegister();

    await user.type(
      screen.getByRole("textbox", { name: /Nome da organização/ }),
      "Locadora Central",
    );
    await user.type(
      screen.getByRole("textbox", { name: /E-mail/ }),
      publicUser.email,
    );
    await user.type(
      screen.getByLabelText("Senha"),
      "correct-horse-battery-staple",
    );
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível criar a conta com estes dados.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(publicUser.email);
  });
});

describe("legacy account route", () => {
  it("redirects to the unified dashboard shell", () => {
    AccountPage();

    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
