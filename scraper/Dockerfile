FROM node:20-slim

WORKDIR /app

# Install chromium and system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Playwright to use system chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

# Install npm packages
COPY package.json ./
RUN npm install

# Copy code
COPY . .

# Build TypeScript
RUN npm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
