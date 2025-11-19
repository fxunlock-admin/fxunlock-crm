FROM node:22-alpine

WORKDIR /app

# Disable pnpm globally
ENV npm_config_package_manager=npm
ENV PNPM_HOME=/dev/null

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install all dependencies (including devDependencies for build)
RUN npm ci --verbose

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --omit=dev

# Expose port
EXPOSE 8002

# Start
CMD ["node", "dist/index.js"]
