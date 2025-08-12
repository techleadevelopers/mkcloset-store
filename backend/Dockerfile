# Usa a imagem oficial do Node.js como base
FROM node:22-alpine

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
RUN apk update && apk add postgresql-client

# Constrói a aplicação NestJS
RUN npm run build

# Define a porta que a aplicação irá expor
# A porta 8080 é a porta padrão que o Cloud Run espera
EXPOSE 8080

# Comando para rodar a aplicação
# Ele executa as migrações do Prisma e depois inicia o servidor
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
