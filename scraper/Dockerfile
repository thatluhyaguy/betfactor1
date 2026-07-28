# Single-stage Node.js + Playwright build for Railway / Cloud containers
FROM mcr.microsoft.com/playwright/node:20-jammy

WORKDIR /app

# Copy package definition and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy scraper source code
COPY . .

# Generate Prisma client using bundled schema fallback or @prisma/client
RUN npx prisma generate || true

# Compile TypeScript
RUN npm run build

# Expose no ports needed for worker
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
