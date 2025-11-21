const express = require('express');
const cors = require('cors');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let sock = null;
let qrCode = null;
let connectionStatus = 'close';
let isInitializing = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
let receivedMessages = []; // Array para armazenar mensagens recebidas
const MAX_MESSAGES = 100; // Limite de mensagens armazenadas

async function initWhatsApp() {
  if (sock && connectionStatus !== 'close') {
    return { success: true, status: connectionStatus };
  }

  if (isInitializing) {
    return { success: true, status: 'initializing' };
  }

  try {
    isInitializing = true;
    console.log('\n🔄 Iniciando conexão WhatsApp...');
    
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`📦 Usando versão WA v${version.join('.')} (isLatest: ${isLatest})`);

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('WhatsApp Web'),
      syncFullHistory: false,
      markOnlineOnConnect: false,
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      console.log('📡 Connection update:', { 
        connection, 
        hasQr: !!qr,
        attempts: reconnectAttempts 
      });

      if (connection) {
        connectionStatus = connection;
      }

      if (qr) {
        try {
          console.log('📱 Gerando QR code...');
          qrCode = await QRCode.toDataURL(qr);
          connectionStatus = 'connecting'; // Garante que o status seja 'connecting' quando há QR code
          console.log('✅ QR code gerado com sucesso!');
          console.log('👉 Escaneie o QR code no frontend: http://localhost:3000\n');
          reconnectAttempts = 0; // Reset attempts when QR is generated
        } catch (err) {
          console.error('❌ Erro ao gerar QR code:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error instanceof Boom) 
          ? lastDisconnect.error.output.statusCode 
          : lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log('🔴 Conexão fechada.');
        console.log('   Motivo:', lastDisconnect?.error?.message || 'Desconhecido');
        console.log('   Status Code:', statusCode);
        console.log('   Reconectar?', shouldReconnect);

        sock = null;
        connectionStatus = 'close';
        
        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`\n⏳ Reconectando (tentativa ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          qrCode = null;
          isInitializing = false;
          
          setTimeout(() => {
            initWhatsApp();
          }, 3000);
        } else {
          if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.log('\n⚠️  Máximo de tentativas atingido.');
            console.log('💡 Tente reiniciar o servidor ou limpe a pasta auth_info_baileys\n');
          }
          qrCode = null;
          isInitializing = false;
          reconnectAttempts = 0;
        }
      } else if (connection === 'open') {
        console.log('✅ Conectado com sucesso!\n');
        connectionStatus = 'open';
        qrCode = null;
        isInitializing = false;
        reconnectAttempts = 0;
      } else if (connection === 'connecting') {
        connectionStatus = 'connecting';
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // Listener para mensagens recebidas
    sock.ev.on('messages.upsert', async (m) => {
      const messages = m.messages || [];
      
      for (const msg of messages) {
        // Ignorar mensagens próprias e status
        if (msg.key.fromMe || !msg.message) continue;
        
        // Extrair número do remetente
        let senderNumber = 'Desconhecido';
        let groupId = null;
        const remoteJid = msg.key.remoteJid || '';
        
        // Se tem participant, é mensagem de grupo - usar o participant como remetente
        if (msg.key.participant) {
          senderNumber = msg.key.participant.replace('@s.whatsapp.net', '').replace('@c.us', '');
          groupId = remoteJid;
        } else {
          // Mensagem direta - usar remoteJid
          senderNumber = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
        }
        
        // Detectar se é grupo ou lista
        const isGroup = remoteJid.includes('@g.us');
        const isList = remoteJid.includes('@lid');
        
        const messageData = {
          id: msg.key.id,
          from: senderNumber,
          groupId: groupId ? groupId.replace('@g.us', '').replace('@lid', '') : null,
          isGroup: isGroup,
          isList: isList,
          message: msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   JSON.stringify(msg.message),
          timestamp: new Date().toISOString(),
          fullData: msg // Dados completos da mensagem
        };
        
        // Adicionar à lista (manter apenas as últimas MAX_MESSAGES)
        receivedMessages.unshift(messageData);
        if (receivedMessages.length > MAX_MESSAGES) {
          receivedMessages.pop();
        }
        
        const source = isGroup ? `Grupo ${groupId?.substring(0, 20)}` : (isList ? `Lista ${groupId?.substring(0, 20)}` : 'Direta');
        console.log('📨 Mensagem recebida:', senderNumber, `(${source})`, '-', messageData.message.substring(0, 50));
      }
    });

    setTimeout(() => {
      isInitializing = false;
    }, 10000);

    return { success: true, status: connectionStatus };
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
    sock = null;
    qrCode = null;
    connectionStatus = 'close';
    isInitializing = false;
    return { success: false, error: error.message };
  }
}

// Rota para obter status e QR code
app.get('/api/status', async (req, res) => {
  try {
    await initWhatsApp();
    
    res.json({
      status: connectionStatus,
      qrCode: qrCode,
      connected: connectionStatus === 'open',
    });
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({
      error: 'Erro ao obter status da conexão',
      details: error.message
    });
  }
});

// Rota para desconectar
app.post('/api/disconnect', (req, res) => {
  try {
    if (sock) {
      sock.end(undefined);
      sock = null;
      qrCode = null;
      connectionStatus = 'close';
    }
    reconnectAttempts = 0;
    res.json({ success: true, message: 'Desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ error: 'Erro ao desconectar' });
  }
});

// Rota para reiniciar conexão
app.post('/api/restart', async (req, res) => {
  try {
    console.log('\n🔄 Reiniciando conexão...');
    
    if (sock) {
      sock.end(undefined);
    }
    
    sock = null;
    qrCode = null;
    connectionStatus = 'close';
    isInitializing = false;
    reconnectAttempts = 0;
    
    await initWhatsApp();
    
    res.json({ success: true, message: 'Conexão reiniciada' });
  } catch (error) {
    console.error('Erro ao reiniciar:', error);
    res.status(500).json({ error: 'Erro ao reiniciar conexão' });
  }
});

// Rota para enviar mensagem
app.post('/api/send-message', async (req, res) => {
  try {
    const { number, message } = req.body;
    
    if (!number || !message) {
      return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
    }
    
    if (!sock || connectionStatus !== 'open') {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }

    // Formatar número (remover caracteres não numéricos)
    const cleanNumber = number.replace(/\D/g, '');
    const jid = `${cleanNumber}@s.whatsapp.net`;
    
    await sock.sendMessage(jid, { text: message });
    
    console.log(`✅ Mensagem enviada para ${cleanNumber}`);
    
    res.json({ success: true, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ 
      error: 'Erro ao enviar mensagem',
      details: error.message 
    });
  }
});

// Rota para obter mensagens recebidas
app.get('/api/messages', (req, res) => {
  try {
    res.json({
      success: true,
      messages: receivedMessages,
      count: receivedMessages.length
    });
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    res.status(500).json({ error: 'Erro ao obter mensagens' });
  }
});

// Rota para limpar mensagens
app.delete('/api/messages', (req, res) => {
  try {
    receivedMessages = [];
    res.json({ success: true, message: 'Mensagens limpas' });
  } catch (error) {
    console.error('Erro ao limpar mensagens:', error);
    res.status(500).json({ error: 'Erro ao limpar mensagens' });
  }
});

// Inicia o servidor
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Servidor Baileys rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://${HOST}:${PORT}`);
  console.log('\n✓ Aguardando requisições...\n');
});

// Inicializa o WhatsApp ao iniciar o servidor
initWhatsApp();

