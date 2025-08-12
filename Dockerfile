# Stage 1: Build Image
# Usa uma imagem oficial do Node.js como base
FROM node:22-alpine AS build

# Define o diretório de trabalho na raiz do container
# A sua aplicação está no diretório 'backend', então vamos direto para lá.
WORKDIR /usr/src/app/backend

# Copia os arquivos de definição de dependência (package.json e afins) do backend
COPY ./package*.json ./

# Instala as dependências, incluindo as de desenvolvimento
RUN npm install

# Copia todo o restante do código da sua aplicação (backend)
COPY . .

# Gera o cliente do Prisma. Isso garante que o binário do Prisma
# seja compatível com a arquitetura do container.
RUN npx prisma generate

# Executa o build da sua aplicação NestJS.
# Este comando irá criar a pasta `dist` no diretório de trabalho atual.
RUN npm run build


# Stage 2: Production Image
# Cria uma imagem mais leve para produção
FROM node:22-alpine AS production

# Define o diretório de trabalho da aplicação
WORKDIR /usr/src/app/backend

# Copia apenas os arquivos essenciais da imagem de build
COPY --from=build /usr/src/app/backend/node_modules ./node_modules
COPY --from=build /usr/src/app/backend/dist ./dist
COPY --from=build /usr/src/app/backend/prisma ./prisma
COPY --from=build /usr/src/app/backend/package*.json ./

# Define a porta que a aplicação irá expor
EXPOSE 8080

# Comando para rodar a aplicação
# Primeiro, ele aplica as migrações (só vai rodar se houver migrações pendentes)
# e depois inicia a aplicação NestJS.
CMD npx prisma migrate deploy && node dist/main.js