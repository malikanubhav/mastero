# =========================
# File: Dockerfile.backend
# Root-level Dockerfile for BACKEND (workspace: backend)
# - Uses root lockfile (workspaces)
# - Installs only backend deps
# - No node_modules/.cache mounts (avoids EBUSY)
# - Node 22.12+ to satisfy modern tooling
# =========================
# syntax=docker/dockerfile:1.7

# Deps stage: install ONLY backend deps using the ROOT lockfile
FROM node:22.12.0 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --workspace backend

# Build stage (optional; runs if you have a backend build script)
FROM node:22.12.0 AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY backend /app/backend
RUN npm run -w backend build --if-present

# Runtime stage
FROM node:22.12.0 AS runner
WORKDIR /app
ENV NODE_ENV=production
# bring in backend sources and hoisted node_modules
COPY --from=build /app/backend /app/backend
COPY --from=build /app/node_modules /app/node_modules
# your app must listen on process.env.PORT and host 0.0.0.0, expose any port you actually use
EXPOSE 777
CMD ["npm","run","-w","backend","start"]
