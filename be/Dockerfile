FROM node:24-bookworm-slim AS build
WORKDIR /app

# Install runtime dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code dan build TypeScript
COPY . .
RUN npx prisma generate && npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package.json dan prisma schema
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

# Copy hasil build dist & entrypoint
COPY --from=build /app/dist ./dist
COPY --from=build /app/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=build /app/scripts ./scripts

# Pastikan direktori uploads dan permission entrypoint sesuai
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Gunakan non-root user untuk keamanan
USER node

EXPOSE 3000

# Apply reviewed migrations before startup
ENTRYPOINT ["/app/docker-entrypoint.sh"]


