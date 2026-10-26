"use client";

import { useCallback, useEffect, useState } from "react";

export type AsyncResourceStatus = "idle" | "loading" | "success" | "error";

interface AsyncResourceSnapshot<T> {
  key: string | null;
  status: AsyncResourceStatus;
  data?: T;
  error?: unknown;
}

export interface AsyncResource<T> {
  data: T | undefined;
  error: unknown;
  status: AsyncResourceStatus;
  isLoading: boolean;
  isRefreshing: boolean;
  retry: () => void;
}

export function useAsyncResource<T>(
  key: string | null,
  load: (signal: AbortSignal) => Promise<T>,
): AsyncResource<T> {
  const [snapshot, setSnapshot] = useState<AsyncResourceSnapshot<T>>({
    key: null,
    status: "idle",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (key === null) {
      setSnapshot({ key: null, status: "idle" });
      return;
    }

    const controller = new AbortController();
    setSnapshot((current) => ({
      key,
      status: "loading",
      ...(current.key === key && current.data !== undefined
        ? { data: current.data }
        : {}),
    }));

    void load(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setSnapshot({ key, status: "success", data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setSnapshot((current) => ({
          key,
          status: "error",
          error,
          ...(current.key === key && current.data !== undefined
            ? { data: current.data }
            : {}),
        }));
      });

    return () => controller.abort();
  }, [attempt, key, load]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  const hasCurrentData = key !== null && snapshot.key === key;
  const status = key === null
    ? "idle"
    : hasCurrentData
      ? snapshot.status
      : "loading";
  const data = hasCurrentData ? snapshot.data : undefined;

  return {
    data,
    error: hasCurrentData ? snapshot.error : undefined,
    status,
    isLoading: status === "loading" && data === undefined,
    isRefreshing: status === "loading" && data !== undefined,
    retry,
  };
}
