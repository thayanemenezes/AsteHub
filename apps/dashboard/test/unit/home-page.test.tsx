import { afterEach, describe, expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));

import HomePage from "../../src/app/page";

afterEach(() => {
  vi.unstubAllEnvs();
  redirect.mockClear();
});

describe("home page", () => {
  it("redirects to login under the configured Pages base path", () => {
    vi.stubEnv("PAGES_BASE_PATH", "/AsteHub");

    expect(() => HomePage()).toThrow("NEXT_REDIRECT:/AsteHub/login");
    expect(redirect).toHaveBeenCalledWith("/AsteHub/login");
  });

  it("redirects to login at the domain root when no base path is configured", () => {
    vi.stubEnv("PAGES_BASE_PATH", "/");

    expect(() => HomePage()).toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
