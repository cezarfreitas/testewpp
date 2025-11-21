# ⚠️ INSTRUÇÕES IMPORTANTES

## Problema Resolvido

O erro `bufferUtil.mask is not a function` foi corrigido!

O Baileys não pode rodar dentro do Next.js API Routes devido a incompatibilidades do webpack com WebSockets nativos.

## Solução Implementada

Agora o projeto usa **2 servidores**:

1. **Servidor Node.js puro** (porta 3001) - Roda o Baileys
2. **Frontend Next.js** (porta 3000) - Interface do usuário

## Como Executar

### PASSO 1: Pare o servidor atual
Pressione `Ctrl+C` no terminal

### PASSO 2: Execute ambos os servidores
```bash
npm run dev:all
```

Este comando inicia ambos os servidores automaticamente!

### Ou execute separadamente:

**Terminal 1:**
```bash
npm run server
```

**Terminal 2:**
```bash
npm run dev
```

## Acesso

Abra no navegador: **http://localhost:3000**

O QR code será gerado e exibido automaticamente! 🎉

## Arquitetura

```
Frontend (Next.js :3000)
    ↓ HTTP
API Routes Next.js
    ↓ HTTP
Servidor Baileys (:3001)
    ↓ WebSocket
WhatsApp Web
```

## Arquivos Importantes

- `server/whatsapp-server.js` - Servidor Baileys (Node.js puro)
- `app/api/whatsapp/*` - Proxy para o servidor Baileys
- `components/QRCodeDisplay.tsx` - Interface do QR code

