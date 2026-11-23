import { describe, expect, it, vi } from "vitest";

import {
  getRefreshCoordinator,
  shouldClearAuthCookiesOnRefreshFailure,
} from "./refresh-coordinator";

describe("shouldClearAuthCookiesOnRefreshFailure", () => {
  it("purge sur jeton invalide", () => {
    expect(shouldClearAuthCookiesOnRefreshFailure(401)).toBe(true);
    expect(shouldClearAuthCookiesOnRefreshFailure(403)).toBe(true);
  });

  it("conserve la session sur erreur temporaire", () => {
    expect(shouldClearAuthCookiesOnRefreshFailure(503)).toBe(false);
    expect(shouldClearAuthCookiesOnRefreshFailure(429)).toBe(false);
  });
});

describe("single-flight refresh (processus local)", () => {
  it("n'exécute qu'un seul travail concurrent par clé", async () => {
    const coordinator = getRefreshCoordinator();
    const work = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return { ok: true as const };
    });

    const [a, b] = await Promise.all([
      coordinator.run("scope-test", work),
      coordinator.run("scope-test", work),
    ]);

    expect(a).toEqual(b);
    expect(work).toHaveBeenCalledTimes(1);
  });
});