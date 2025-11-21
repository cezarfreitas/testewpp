# WhatsApp Web - Baileys Frontend

Frontend Next.js + Servidor Node.js separado para conectar WhatsApp usando Baileys com exibição de QR Code.

## Instalação

```bash
npm install
```

## Executar

O projeto usa **dois servidores**:

1. **Servidor Baileys** (Node.js puro) - Porta 3001
2. **Frontend Next.js** - Porta 3000

### Opção 1: Executar ambos simultaneamente (recomendado)

```bash
npm run dev:all
```

### Opção 2: Executar separadamente

Terminal 1 - Servidor Baileys:
```bash
npm run server
```

Terminal 2 - Frontend Next.js:
```bash
npm run dev
```

Depois abra [http://localhost:3000](http://localhost:3000) no navegador.

## Como usar

1. Inicie os servidores com `npm run dev:all`
2. Acesse `http://localhost:3000`
3. Escaneie o QR Code exibido com seu WhatsApp
4. Aguarde a conexão ser estabelecida

## Estrutura

### Backend (Servidor Node.js - Porta 3001)
- `server/whatsapp-server.js` - Servidor Express com lógica Baileys
- Endpoints:
  - `GET /api/status` - Obter status e QR code
  - `POST /api/disconnect` - Desconectar
  - `POST /api/send-message` - Enviar mensagem

### Frontend (Next.js - Porta 3000)
- `app/api/whatsapp/*` - API Routes que fazem proxy para o servidor Baileys
- `components/QRCodeDisplay.tsx` - Componente React para exibir QR code
- `app/page.tsx` - Página principal

## Por que dois servidores?

O Baileys usa WebSockets nativos do Node.js que não são compatíveis com o ambiente webpack do Next.js API Routes. Por isso, é necessário um servidor Node.js separado.

## Tecnologias

- Next.js 14 (Frontend)
- Express (Servidor Baileys)
- React 18
- TypeScript
- Baileys (@whiskeysockets/baileys)
- QRCode
- Tailwind CSS

## Variáveis de Ambiente

Crie um arquivo `.env.local`:

```
WHATSAPP_SERVER_URL=http://localhost:3001
```
