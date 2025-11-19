FROM node:22-alpine

WORKDIR /app

# Disable pnpm
ENV npm_config_package_manager=npm

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies with npm
RUN npm install --omit=dev

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npx tsc

# Expose port
EXPOSE 8002

# Start
CMD ["node", "dist/index.js"]
