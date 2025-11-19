FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm run build

EXPOSE 8002

CMD ["node", "dist/index.js"]
