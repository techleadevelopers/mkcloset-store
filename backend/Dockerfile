# --- Etapa de construção (builder) ---
# Usamos a imagem oficial do Node.js com a tag 'lts-alpine'
# que é ideal para ambientes de produção.
FROM node:lts-alpine as builder

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de definição de dependências
# e instala as dependências do projeto
COPY package*.json ./
RUN npm install

# Copia o restante do código-fonte da aplicação
COPY . .

# Constrói a aplicação (presumindo que seja um projeto NestJS/Typescript)
# O comando 'build' irá compilar o código para a pasta 'dist'
RUN npm run build

# --- Etapa de execução (runner) ---
# Usamos uma nova imagem 'node:lts-alpine' mais limpa e leve
# para rodar a aplicação em produção, sem as ferramentas de build.
FROM node:lts-alpine as runner

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários da etapa de construção
# Copia o código compilado da pasta 'dist'
COPY --from=builder /app/dist ./dist

# Copia os arquivos de definição de dependências e a pasta 'node_modules'
# A flag --production garante que apenas dependências de produção sejam copiadas
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expõe a porta em que a aplicação irá rodar
# A porta 3000 é a padrão para muitas aplicações Node.js e NestJS
EXPOSE 3000

# Comando para iniciar a aplicação
# O comando 'start:prod' é o padrão para iniciar a aplicação NestJS em modo de produção
CMD ["npm", "run", "start:prod"]

