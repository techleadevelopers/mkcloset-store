# Stage 1: Build da aplicação NestJS
# Usamos uma imagem Node.js completa para ter todas as ferramentas de build.
FROM node:22-alpine AS build

# Define o diretório de trabalho dentro do container.
# Todos os comandos a seguir serão executados a partir deste diretório.
WORKDIR /app

# Copia os arquivos de configuração de dependência primeiro.
# Isso permite que o Docker use o cache da camada se os arquivos de dependência não mudarem.
COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento) para o processo de build.
# Alteramos de 'npm ci' para 'npm install' para uma abordagem mais robusta.
RUN npm install

# Copia o restante do código da sua pasta 'backend' para o container.
COPY . .

# O Prisma precisa do gerador para criar o client antes de compilar o código.
# Este comando é CRUCIAL para gerar os tipos de dados que sua aplicação usa.
RUN npx prisma generate

# Compila o projeto NestJS para JavaScript.
# O resultado estará na pasta 'dist'.
RUN npm run build

# --- Stage 2: Imagem final de produção ---
# Usamos uma imagem menor ('slim') para o container final, o que reduz o tamanho da imagem.
FROM node:22-alpine AS production

# Define o diretório de trabalho.
WORKDIR /app

# Define variáveis de ambiente. O Cloud Run irá sobrescrever a porta.
ENV NODE_ENV=production
ENV PORT=8080

# Copia apenas os artefatos compilados, os arquivos do Prisma e o package.json.
# A inclusão da pasta 'node_modules' completa é crucial para o sucesso da aplicação.
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

# A porta que o container irá expor.
EXPOSE 8080

# Comando para iniciar a aplicação.
# O caminho 'dist/src/main.js' é o caminho correto para o seu arquivo de inicialização.
CMD ["node", "dist/src/main.js"]
