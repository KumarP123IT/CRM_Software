FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /app/.output ./.output
COPY --from=build /app/dist ./dist 2>/dev/null || true
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
