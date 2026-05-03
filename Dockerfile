# ── Frontend Dockerfile ─────────────────────────────────────────
# Stage 1: build React app with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --silent

# Copy source
COPY . .

# Build — API calls use relative /api path (proxied by nginx)
RUN npm run build

# ── Stage 2: serve with Nginx ────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx SPA config (path relative to build context = project root)
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
