FROM node:18-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code dan build TypeScript
COPY . .
RUN npx prisma generate && npm run build

FROM node:18-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json dan prisma schema
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
RUN npm install --omit=dev && npx prisma generate

# Copy hasil build dist
COPY --from=build /app/dist ./dist

# Pastikan direktori uploads ada dengan permission yang sesuai
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Gunakan non-root user untuk keamanan
USER node

EXPOSE 3000

# Start the API Server (entry point di dist/src/server.js)
CMD ["node", "dist/src/server.js"]

