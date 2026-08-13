FROM node:18-bookworm-slim AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

RUN rm -f package-lock.json && npm install

# Copy source code
COPY . .

# Build Next.js
RUN NEXT_TELEMETRY_DISABLED=1 npm run build -- --no-lint

FROM node:18-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]