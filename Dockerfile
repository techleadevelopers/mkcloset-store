# Usamos uma imagem Node.js completa. Não há segundo estágio para copiar arquivos.
FROM node:22-alpine

# Define o diretório de trabalho dentro do container.
WORKDIR /app

# Copia os arquivos de configuração de dependência.
COPY package*.json ./

# Instala TODAS as dependências, incluindo as de desenvolvimento.
# Isso garante que nada falte na hora de rodar a aplicação.
RUN npm install

# Copia o restante do código da sua pasta 'backend' para o container.
COPY . .

# O Prisma precisa do gerador.
RUN npx prisma generate

# Compila o projeto NestJS para JavaScript.
# O resultado estará na pasta 'dist'.
RUN npm run build

# Define variáveis de ambiente.
ENV NODE_ENV=production
ENV PORT=8080

# A porta que o container irá expor.
EXPOSE 8080

# Comando para iniciar a aplicação.
CMD ["node", "dist/src/main.js"]
