# Stage 1: Build a development image with all dependencies
# Usa uma imagem Node.js 22 para o build
FROM node:22 AS build

# Define o diretório de trabalho na raiz do contêiner
WORKDIR /usr/src/app

# Copia todo o conteúdo do seu repositório para o contêiner
COPY . .

# Define o diretório de trabalho para a pasta 'backend'
WORKDIR /usr/src/app/backend

# Adiciona o comando para garantir que o usuário 'node' tenha permissão de escrita
# para o diretório de trabalho
RUN chown -R node:node /usr/src/app

# Instala as dependências, que estão no package.json do backend
RUN npm install

# Instala o cliente psql para depuração
RUN apt-get update && apt-get install -y postgresql-client

# Constrói a aplicação NestJS
RUN npm run build

# --- INÍCIO: Comandos de depuração para verificar o build ---
# Lista o conteúdo do diretório 'dist' após o build
RUN echo "Conteúdo do diretório 'dist' após o build:"
RUN ls -la dist
# --- FIM: Comandos de depuração ---


# Stage 2: Create a production-ready image
# Usa uma imagem Node.js 22 para produção, que é mais leve
FROM node:22 AS production

# Define o diretório de trabalho para a pasta 'backend'
WORKDIR /usr/src/app/backend

# Copia apenas os arquivos essenciais da etapa de build
COPY --from=build /usr/src/app/backend/node_modules ./node_modules
COPY --from=build /usr/src/app/backend/dist ./dist
COPY --from=build /usr/src/app/backend/prisma ./prisma

# --- INÍCIO: Comandos de depuração para verificar a cópia ---
# Lista o conteúdo do diretório 'dist' após a cópia
RUN echo "Conteúdo do diretório 'dist' após a cópia:"
RUN ls -la dist
# --- FIM: Comandos de depuração ---

# Define a porta que a aplicação irá expor
# A porta 8080 é a porta padrão que o Cloud Run espera
EXPOSE 8080

# Comando para rodar a aplicação
# Removemos a migração do CMD para evitar a falha de build.
# A migração será feita manualmente após o deploy.
CMD ["node", "dist/main.js"]
