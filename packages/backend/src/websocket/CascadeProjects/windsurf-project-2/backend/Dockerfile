# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copy only package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source and prisma
COPY src ./src
COPY tsconfig.json ./
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npx tsc

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy prisma schema (needed at runtime)
COPY prisma ./prisma

# Copy built application from builder
COPY --from=builder /build/dist ./dist

# Expose port
EXPOSE 8002

# Start
CMD ["node", "dist/index.js"]
