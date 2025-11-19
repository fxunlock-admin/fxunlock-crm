FROM node:22-alpine

WORKDIR /app

# Disable pnpm
ENV npm_config_package_manager=npm

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --omit=dev

# Expose port
EXPOSE 8002

# Start
CMD ["node", "dist/index.js"]
