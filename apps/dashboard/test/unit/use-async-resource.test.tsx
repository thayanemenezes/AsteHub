import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsyncResource } from "../../src/hooks/use-async-resource";

describe("useAsyncResource", () => {
  it("loads, preserves data after a failed refresh, and retries", async () => {
    const load = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockResolvedValueOnce("initial")
      .mockRejectedValueOnce(new Error("Request failed"))
      .mockResolvedValueOnce("updated");
    const { result } = renderHook(() => useAsyncResource("vehicles:1", load));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toBe("initial"));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.data).toBe("initial");
    expect(result.current.error).toEqual(new Error("Request failed"));
    expect(result.current.isRefreshing).toBe(false);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toBe("updated"));
    expect(result.current.status).toBe("success");
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("does not expose data from a different resource key", async () => {
    const load = vi.fn<(signal: AbortSignal) => Promise<string>>(
      async () => "loaded",
    );
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useAsyncResource(key, load),
      { initialProps: { key: "organization-a" } },
    );
    await waitFor(() => expect(result.current.data).toBe("loaded"));

    rerender({ key: "organization-b" });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });
});
