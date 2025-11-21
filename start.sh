#!/bin/sh

# Criar diretório de auth se não existir
mkdir -p /app/auth_info_baileys

# Iniciar servidor Express (WhatsApp Baileys) em background
node server/whatsapp-server.js &

# Aguardar um pouco para o servidor Express iniciar
sleep 3

# Iniciar servidor Next.js
exec npm start

