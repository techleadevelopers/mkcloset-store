# Stage 1: Build Image
# Usa uma imagem oficial do Node.js como base
FROM node:22-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependência (package.json e afins) do backend
# O path 'backend/package*.json' é relativo à raiz do monorepo, onde o Dockerfile deve estar.
COPY ./backend/package*.json ./

# Instala as dependências.
RUN npm install

# Copia todo o restante do código da sua aplicação (backend)
COPY ./backend .

# Gera o cliente do Prisma.
RUN npx prisma generate

# Executa o build da sua aplicação NestJS.
# O build irá criar a pasta `dist` no diretório de trabalho atual.
RUN npm run build


# Stage 2: Production Image
# Cria uma imagem mais leve para produção
FROM node:22-alpine AS production

# Define o diretório de trabalho da aplicação
WORKDIR /usr/src/app

# Copia apenas os arquivos essenciais da imagem de build
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/package*.json ./

# Define a porta que a aplicação irá expor
EXPOSE 8080

# Comando para rodar a aplicação
# Primeiro, ele aplica as migrações (só vai rodar se houver migrações pendentes)
# e depois inicia a aplicação NestJS.
CMD npx prisma migrate deploy && node dist/main.js
