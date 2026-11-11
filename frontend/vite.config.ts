import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    tsConfigPaths(),
    tanstackStart({ server: { entry: "server" } }),
    // Deploy target: node-server (VPS/Render/Docker), vercel, cloudflare-module
    nitro({ preset: process.env["NITRO_PRESET"] ?? "node-server" }),
    viteReact(),
    tailwindcss(),
  ],
});
