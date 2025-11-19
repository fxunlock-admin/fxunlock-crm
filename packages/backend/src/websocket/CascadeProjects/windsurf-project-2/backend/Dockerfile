FROM node:22-slim

WORKDIR /app

# Completely remove pnpm
RUN npm uninstall -g pnpm 2>/dev/null || true
RUN rm -f /usr/local/bin/pnpm /usr/bin/pnpm

COPY package*.json ./
RUN npm ci --ignore-scripts 2>&1 | grep -v pnpm || true

COPY src ./src
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm run prisma:generate 2>&1 | grep -v pnpm || true
RUN npm run build 2>&1 | grep -v pnpm || true

EXPOSE 8002

# Ensure pnpm is not in PATH
ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Push schema to database and run migrations on startup
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
