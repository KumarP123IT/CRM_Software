#!/usr/bin/env bash
# Removes Lovable from the Konvo frontend. Run from inside the /frontend folder:
#   bash delovable.sh
# Commit first (git add -A && git commit -m "before delovable") so you can undo.
set -euo pipefail

[ -f package.json ] || { echo "Run this inside the frontend folder."; exit 1; }

echo "1/7 Removing the Lovable package and lockfiles"
npm uninstall @lovable.dev/vite-tanstack-config --ignore-scripts --no-audit --no-fund || true
rm -f bun.lock bunfig.toml        # keep npm only; two lockfiles drift apart

echo "2/7 Writing a plain vite.config.ts (replaces the Lovable wrapper)"
cat > vite.config.ts <<'EOF'
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
EOF

echo "3/7 Removing the Lovable error-reporting shim"
rm -f src/lib/lovable-error-reporting.ts
python3 - <<'EOF'
p = "src/routes/__root.tsx"
s = open(p).read()
s = s.replace('import { reportLovableError } from "../lib/lovable-error-reporting";\n', "")
s = s.replace(
    '  useEffect(() => {\n    reportLovableError(error, { boundary: "tanstack_root_error_component" });\n  }, [error]);\n',
    "",
)
s = s.replace(
    'import { useEffect, type ReactNode } from "react";',
    'import type { ReactNode } from "react";',
)
open(p, "w").write(s)
EOF

echo "4/7 Cleaning AGENTS.md and README.md"
sed -i '/LOVABLE:BEGIN/,/LOVABLE:END/d' AGENTS.md
cat > README.md <<'EOF'
# Frontend

TanStack Start + React 19 + TypeScript + Tailwind v4 + shadcn/ui.

```sh
npm install
npm run dev      # http://localhost:3000
npm test
npm run build
```

Set `VITE_USE_MOCKS=false` and `VITE_API_BASE_URL` in `.env` to use a real backend.
EOF

echo "5/7 Fixing dotfiles that were saved without their leading dot"
[ -f gitignore ] && mv -f gitignore .gitignore
[ -f prettierrc ] && mv -f prettierrc .prettierrc
[ -f prettierignore ] && mv -f prettierignore .prettierignore
grep -qx '.output' .gitignore || echo '.output' >> .gitignore
grep -qx '.env' .gitignore || printf '.env\n.env.*\n!.env.example\n' >> .gitignore

echo "6/7 Syncing install (package-lock.json was updated by the uninstall)"
npm install --no-audit --no-fund

echo "7/7 Checking"
if grep -rIil lovable . --exclude-dir=node_modules --exclude-dir=.output --exclude=package-lock.json; then
  echo "Lovable references remain in the files above."
else
  echo "No Lovable references left."
fi
npx vite build
npx vitest run
echo "Done. Run: git add -A && git commit -m 'Remove Lovable'"
