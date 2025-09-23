# syntax=docker/dockerfile:1

# -------- Base image --------
FROM node:20-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

# Install system deps
RUN apk add --no-cache python3 make g++ curl

# -------- Dependencies layer --------
FROM base AS deps
COPY package.json package-lock.json ./
# Avoid running postinstall scripts (sequelize migrations) during image build
RUN npm ci --ignore-scripts --only=production && npm cache clean --force

# -------- Runtime layer --------
FROM base AS runner

# Install sequelize-cli globally for runtime migrations
RUN npm i -g sequelize-cli@6.6.3

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy app source and entrypoint
COPY src ./src
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD curl -fsS http://127.0.0.1:${PORT:-4000}/ || exit 1

# Drop privileges
USER nodeuser

# Start: run migrations then start server
CMD ["sh", "/app/entrypoint.sh"]

