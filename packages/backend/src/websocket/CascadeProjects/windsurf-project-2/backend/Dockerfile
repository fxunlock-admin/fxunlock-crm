FROM node:22-slim

WORKDIR /app

# Remove pnpm if it exists
RUN npm uninstall -g pnpm 2>/dev/null || true

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY src ./src
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm run prisma:generate
RUN npm run build

EXPOSE 8002

CMD ["node", "dist/index.js"]
