import { createHash } from "node:crypto";

export type RefreshCoordinator = {
  run<T>(scopeKey: string, work: () => Promise<T>): Promise<T>;
};

class ProcessLocalRefreshCoordinator implements RefreshCoordinator {
  private readonly inflight = new Map<string, Promise<unknown>>();

  async run<T>(scopeKey: string, work: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(scopeKey);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = work().finally(() => {
      this.inflight.delete(scopeKey);
    });

    this.inflight.set(scopeKey, promise);
    return promise;
  }
}

const processCoordinator = new ProcessLocalRefreshCoordinator();

export function refreshCoordinatorScopeKey(refreshToken: string): string {
  return createHash("sha256").update(refreshToken).digest("hex");
}

export function getRefreshCoordinator(): RefreshCoordinator {
  return processCoordinator;
}

export function shouldClearAuthCookiesOnRefreshFailure(status: number): boolean {
  return status === 401 || status === 403;
}

export function isTransientRefreshFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const name = error.name;
  return (
    name === "TypeError" ||
    name === "AbortError" ||
    messageLooksLikeNetworkError(error.message)
  );
}

function messageLooksLikeNetworkError(message: string): boolean {
  return /fetch failed|network|ECONNRESET|ETIMEDOUT|socket/i.test(message);
}