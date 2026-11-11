import { describe, expect, it } from "vitest";
import { httpApi } from "./http-adapter";
import { mockApi } from "./mock";
import type { Api } from "./types";

function methodTree(api: Api): Record<string, string[]> {
  return Object.fromEntries(
    (Object.keys(api) as (keyof Api)[]).map((k) => [k, Object.keys(api[k] as object).sort()]),
  );
}

describe("API mock/http adapter parity", () => {
  it("exposes the same resource keys", () => {
    expect(Object.keys(mockApi).sort()).toEqual(Object.keys(httpApi).sort());
  });

  it("exposes the same methods on every resource", () => {
    expect(methodTree(mockApi)).toEqual(methodTree(httpApi));
  });

  it("covers the AuthApi surface", () => {
    expect(Object.keys(mockApi.auth).sort()).toEqual(
      ["checkSlug", "forgotPassword", "login", "register"].sort(),
    );
  });
});
