FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN apt-get update -qq && apt-get install -y -qq openssl >/dev/null 2>&1 && npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN apt-get update -qq && apt-get install -y -qq openssl >/dev/null 2>&1 && npx prisma generate
RUN npm run build
RUN npm run typecheck
RUN npm test

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -qq && apt-get install -y -qq openssl >/dev/null 2>&1
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh
EXPOSE 3015
ENTRYPOINT ["./docker-entrypoint.sh"]
