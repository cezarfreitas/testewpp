# Dockerfile para Easypanel
FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias
RUN apk add --no-cache bash net-tools

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Criar diretório para auth antes do build
RUN mkdir -p /app/auth_info_baileys

# Verificar estrutura antes do build
RUN echo "=== Verificando estrutura de arquivos ===" && \
    echo "Conteúdo de /app:" && \
    ls -la /app/ && \
    echo "" && \
    echo "Verificando pasta app:" && \
    (test -d /app/app && (echo "✅ Pasta app encontrada" && ls -la /app/app/) || (echo "❌ Pasta app NÃO encontrada!" && exit 1)) && \
    echo "" && \
    echo "Verificando package.json:" && \
    (test -f /app/package.json && echo "✅ package.json encontrado" || (echo "❌ package.json NÃO encontrado!" && exit 1))

# Build do Next.js
RUN npm run build

# Remover devDependencies após build para reduzir tamanho
# Mantendo concurrently que pode ser útil
RUN npm prune --production --no-optional

# Script para iniciar ambos os servidores
COPY start.sh ./
RUN chmod +x start.sh

# Expor portas
EXPOSE 3000 3001

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Comando de inicialização
CMD ["./start.sh"]

