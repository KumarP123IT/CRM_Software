FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS build
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Prisma CLI (devDependency) is needed for `migrate deploy` at container start.
# Pinned to the version in package-lock.json — a floating `prisma@6` can
# resolve to a CLI that rejects the schema or writes a different migrations table.
RUN npm install -g prisma@6.19.3
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
EXPOSE 4000
CMD ["sh", "-c", "prisma migrate deploy && node dist/index.js"]
