#!/bin/sh

# Criar diretório de auth se não existir
mkdir -p /app/auth_info_baileys

echo "🚀 Iniciando servidor Express (Backend WhatsApp)..."

# Iniciar servidor Express com logs
node server/whatsapp-server.js > /tmp/express.log 2>&1 &
EXPRESS_PID=$!

echo "⏳ Aguardando servidor Express iniciar (PID: $EXPRESS_PID)..."
sleep 5

# Verificar se o servidor está rodando
if ! ps -p $EXPRESS_PID > /dev/null; then
    echo "❌ ERRO: Servidor Express falhou ao iniciar!"
    echo "--- Logs do Express ---"
    cat /tmp/express.log
    exit 1
fi

# Verificar se a porta 3001 está escutando
if ! netstat -tuln | grep -q ':3001'; then
    echo "⚠️  AVISO: Porta 3001 não está escutando ainda, aguardando mais 5s..."
    sleep 5
fi

echo "✅ Servidor Express rodando na porta 3001"
echo "🚀 Iniciando servidor Next.js..."

# Iniciar servidor Next.js
exec npm start

