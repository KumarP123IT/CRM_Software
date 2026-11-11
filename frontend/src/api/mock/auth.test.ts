import { describe, expect, it } from "vitest";
import { HttpError } from "../http";
import { MOCK_PASSWORD, mockApi } from "./index";
import { team } from "./data";

describe("mock login", () => {
  it("accepts a seeded user with the mock password", async () => {
    const email = team[0]!.email;
    const r = await mockApi.auth.login({ email, password: MOCK_PASSWORD });
    expect(r.user.email).toBe(email);
    expect(r.token).toBe("mock-token");
  });

  it("rejects an unknown email", async () => {
    await expect(
      mockApi.auth.login({ email: "nobody@example.in", password: MOCK_PASSWORD }),
    ).rejects.toMatchObject({
      status: 401,
      code: "invalid_credentials",
    } satisfies Partial<HttpError>);
  });

  it("rejects the wrong password for a known user", async () => {
    await expect(
      mockApi.auth.login({ email: team[0]!.email, password: "wrong-password" }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
