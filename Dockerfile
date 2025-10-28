# Dockerfile - Imagem de Produção para Versalles RPG (Next.js)

# --- Estágio 1: Build ---
# Usamos uma imagem Node.js leve (Alpine Linux) como base para o build.
# 'AS base' nomeia este estágio para referência futura.
FROM node:18-alpine AS base

# Instala dependências do sistema operacional que podem ser necessárias
# para algumas bibliotecas Node.js (ex: libs de imagem, criptografia).
# libc6-compat é para compatibilidade, openssl para criptografia.
RUN apk add --no-cache libc6-compat openssl

# Define o diretório de trabalho dentro do container.
WORKDIR /app

# Copia os arquivos de definição de dependências primeiro.
# Isso aproveita o cache do Docker: se esses arquivos não mudarem,
# o Docker reutiliza a camada da instalação das dependências, acelerando builds futuros.
COPY package.json package-lock.json* ./
# Se você usar Yarn, copie yarn.lock e use 'yarn install --frozen-lockfile'
# COPY package.json yarn.lock* ./

# Instala as dependências de produção e desenvolvimento (necessárias para o build).
# --frozen-lockfile garante que as versões exatas do lockfile sejam usadas.
RUN npm install --frozen-lockfile
# Se usar Yarn: RUN yarn install --frozen-lockfile

# Copia todo o restante do código-fonte do seu projeto para o diretório /app no container.
COPY . .

# Executa o comando de build do Next.js.
# Isso otimiza sua aplicação para produção (gera arquivos estáticos, compila código, etc.).
RUN npm run build
# Se usar Yarn: RUN yarn build

# --- Estágio 2: Runner ---
# Usamos outra imagem Node.js Alpine como base para a imagem final.
# Essa imagem será menor porque não inclui as dependências de desenvolvimento.
FROM node:18-alpine AS runner

# Define o diretório de trabalho.
WORKDIR /app

# Define a variável de ambiente NODE_ENV como 'production'.
# Muitas bibliotecas (incluindo Next.js e React) usam isso para otimizações.
ENV NODE_ENV=production

# Copia as dependências de *produção* do estágio 'base'.
# Isso evita copiar as dependências de desenvolvimento para a imagem final.
COPY --from=base /app/node_modules ./node_modules

# Copia o package.json (necessário para o comando 'npm start').
COPY --from=base /app/package.json ./package.json

# Copia a pasta 'public' (arquivos estáticos como imagens, fontes).
COPY --from=base /app/public ./public

# Copia a pasta '.next' (resultado do build do Next.js).
# Contém o código otimizado e os assets da sua aplicação.
COPY --from=base /app/.next ./.next

# Copia o arquivo de configuração do Next.js.
COPY --from=base /app/next.config.js ./next.config.js

# Expõe a porta 3000, que é a porta padrão que o Next.js usa para rodar a aplicação.
# O docker-compose ou o comando 'docker run' mapeará esta porta interna para uma porta no host.
EXPOSE 3000

# O comando que será executado quando o container iniciar.
# 'npm start' (ou 'yarn start') executa o servidor Next.js otimizado para produção.
CMD ["npm", "start"]
# Se usar Yarn: CMD ["yarn", "start"]