# Stage 1: build do backend
FROM node:22 AS build
WORKDIR /app/backend

# Copia só o que é necessário do backend
COPY backend/package*.json ./
RUN npm ci

COPY backend ./

# Gera o Prisma Client (OpenSSL 3 no Debian)
RUN npx prisma generate

# Compila o NestJS
RUN npm run build

# Log opcional para validar onde está o main
RUN ls -la dist && (ls -la dist/src || true)

# Stage 2: runtime mínimo
FROM node:22-slim AS production
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8080

# Copia dependências e artefatos
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/prisma ./prisma

EXPOSE 8080

# Se seu build gera dist/src/main.js (mais comum no Nest):
CMD ["node", "dist/src/main.js"]
# Caso você ajuste seu build para dist/main.js, mude para:
# CMD ["node", "dist/main.js"]