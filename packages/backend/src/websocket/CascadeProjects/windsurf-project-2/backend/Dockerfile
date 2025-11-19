# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copy only package files
COPY package*.json ./

# Install dependencies with npm explicitly
RUN npm install --no-save

# Copy source and prisma
COPY src ./src
COPY tsconfig.json ./
COPY prisma ./prisma
COPY build.sh ./

# Make build script executable
RUN chmod +x build.sh

# Run build script
RUN ./build.sh

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --no-save

# Copy prisma schema (needed at runtime)
COPY prisma ./prisma

# Copy built application from builder
COPY --from=builder /build/dist ./dist

# Expose port
EXPOSE 8002

# Start
CMD ["node", "dist/index.js"]
