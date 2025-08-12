# Stage 1: Build a development image with all dependencies
# Usando a imagem Node.js 22 COMPLETA.
FROM node:22 AS build 

# Define o diretório de trabalho na raiz do projeto.
# Esta é a principal mudança para resolver o erro de arquivos não encontrados.
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências e instala as dependências do projeto.
# A instrução 'COPY' agora considera o diretório de trabalho na raiz do projeto.
COPY backend/package*.json ./backend/

# Define o WORKDIR para a pasta do backend
WORKDIR /usr/src/app/backend

# Instala as dependências.
RUN npm install

# Copia todo o restante do código do backend para o diretório de trabalho.
# A partir daqui, o Dockerfile trabalha apenas dentro da pasta 'backend'.
COPY backend .

# Agora os comandos serão executados dentro de /usr/src/app.
RUN npx prisma generate # Isso agora gerará o engine debian-openssl-3.0.x

# Constrói a aplicação.
RUN npm run build


# Stage 2: Create a production-ready image
FROM node:22 AS production 

# Define o diretório de trabalho na raiz do projeto.
WORKDIR /usr/src/app/backend

# Copia apenas os arquivos necessários da etapa de construção para o novo diretório de trabalho.
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
