# Stage 1: Build a development image with all dependencies
# Usando a imagem Node.js 22 COMPLETA.
FROM node:22 AS build 

# Define o diretório de trabalho na raiz do projeto.
# O Docker irá copiar todos os arquivos para cá.
WORKDIR /usr/src/app

# Copia as pastas backend e client para o container.
# O ponto final (.) significa 'toda a raiz do projeto'.
COPY . .

# Define o WORKDIR para a pasta do backend
WORKDIR /usr/src/app/backend

# Instala as dependências.
# A partir de agora, todos os comandos são executados na pasta 'backend'.
RUN npm install

# Agora os comandos serão executados dentro de /usr/src/app/backend.
RUN npx prisma generate

# Constrói a aplicação.
RUN npm run build


# Stage 2: Create a production-ready image
FROM node:22 AS production 

# Define o diretório de trabalho na raiz do projeto.
WORKDIR /usr/src/app/backend

# Copia apenas os arquivos necessários da etapa de construção.
COPY --from=build /usr/src/app/backend/node_modules ./node_modules
COPY --from=build /usr/src/app/backend/dist ./dist
COPY --from=build /usr/src/app/backend/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=build /usr/src/app/backend/prisma/schema.prisma ./prisma/schema.prisma

# A variável de ambiente DATABASE_URL DEVE ser configurada NO PAINEL DO RAILWAY.
# Não podemos usar a sintaxe do Railway no Dockerfile.
ENV PORT 8080
EXPOSE 8080

# Adicionamos a migração ao comando de inicialização
# Isso garante que a migração será executada ANTES da sua aplicação iniciar,
# e terá acesso à variável DATABASE_URL.
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
