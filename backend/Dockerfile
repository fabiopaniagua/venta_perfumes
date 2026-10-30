FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma en alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npx ts-node prisma/seed.ts && node dist/index.js"]
