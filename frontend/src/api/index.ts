import { httpApi } from "./http-adapter";
import { mockApi } from "./mock";
import type { Api } from "./types";

// Mocks are on unless VITE_USE_MOCKS is explicitly "false".
const useMocks = (import.meta.env["VITE_USE_MOCKS"] ?? "true") !== "false";

export const api: Api = useMocks ? mockApi : httpApi;
export * from "./types";
