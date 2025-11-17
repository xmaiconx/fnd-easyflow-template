# ========================================
# Stage 1: Base - Dependencies Installation
# ========================================
FROM node:20-alpine AS base

# Install production dependencies needed for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files for dependency resolution
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY libs/app-shared/package*.json ./libs/app-shared/
COPY libs/app-database/package*.json ./libs/app-database/
COPY libs/app-infra/package*.json ./libs/app-infra/

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# ========================================
# Stage 2: Builder - Compile TypeScript
# ========================================
FROM base AS builder

WORKDIR /app

# Copy TypeScript configs
COPY tsconfig.base.json ./
COPY libs/app-shared/tsconfig.json ./libs/app-shared/
COPY libs/app-infra/tsconfig.json ./libs/app-infra/
COPY libs/app-database/tsconfig.json ./libs/app-database/
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY apps/backend/webpack.config.js ./apps/backend/

# Copy source code
COPY libs/app-shared/src ./libs/app-shared/src
COPY libs/app-infra/src ./libs/app-infra/src
COPY libs/app-database/src ./libs/app-database/src
COPY libs/app-database/migrations ./libs/app-database/migrations
COPY libs/app-database/knexfile.js ./libs/app-database/knexfile.js
COPY apps/backend/src ./apps/backend/src

# Build packages in dependency order
# 1. app-shared (no dependencies)
RUN cd libs/app-shared && npm run build

# 2. app-infra (depends on app-shared)
RUN cd libs/app-infra && npm run build

# 3. app-database (depends on app-shared)
RUN cd libs/app-database && npm run build

# 4. backend (depends on all libs)
RUN cd apps/backend && npm run build

# ========================================
# Stage 3: Production - Runtime
# ========================================
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY libs/app-shared/package*.json ./libs/app-shared/
COPY libs/app-database/package*.json ./libs/app-database/
COPY libs/app-infra/package*.json ./libs/app-infra/

# Install ONLY production dependencies
RUN npm ci --omit=dev --legacy-peer-deps && \
    npm cache clean --force

# Copy compiled code from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/libs/app-shared/dist ./libs/app-shared/dist
COPY --from=builder /app/libs/app-database/dist ./libs/app-database/dist
COPY --from=builder /app/libs/app-infra/dist ./libs/app-infra/dist

# Copy migration files (needed for runtime migrations)
COPY --from=builder /app/libs/app-database/migrations ./libs/app-database/migrations
COPY --from=builder /app/libs/app-database/knexfile.js ./libs/app-database/knexfile.js

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment defaults
ENV NODE_ENV=production \
    NODE_MODE=hybrid \
    PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run entrypoint script
CMD ["docker-entrypoint.sh"]
