const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Landing Page Bonita Premium
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PocketDB Relay Server</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;900&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-color: #050505;
          --accent: #00F2FE;
          --accent-secondary: #4FACFE;
          --text-main: #FFFFFF;
          --text-muted: #8A99B5;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background-color: var(--bg-color);
          color: var(--text-main);
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        /* Animated Background Blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          animation: float 10s infinite ease-in-out alternate;
        }
        .blob-1 { width: 400px; height: 400px; background: rgba(0, 242, 254, 0.15); top: -100px; left: -100px; }
        .blob-2 { width: 500px; height: 500px; background: rgba(79, 172, 254, 0.1); bottom: -150px; right: -100px; animation-delay: -5s; }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 50px) scale(1.1); }
        }

        /* Glassmorphism Card */
        .glass-card {
          position: relative;
          z-index: 10;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 4rem 3rem;
          max-width: 600px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          transform: translateY(20px);
          opacity: 0;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp { to { transform: translateY(0); opacity: 1; } }

        h1 {
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          color: var(--text-muted);
          font-size: 1.15rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          font-weight: 300;
        }

        /* Status Indicator */
        .status-container {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 242, 254, 0.05);
          border: 1px solid rgba(0, 242, 254, 0.2);
          padding: 14px 28px;
          border-radius: 100px;
          transition: all 0.3s ease;
          cursor: default;
        }
        
        .status-container:hover {
          background: rgba(0, 242, 254, 0.1);
          border-color: rgba(0, 242, 254, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 242, 254, 0.1);
        }

        .pulse-dot {
          width: 10px;
          height: 10px;
          background-color: #00E676;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 230, 118, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
        }

        .status-text {
          color: #00E676;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .footer {
          position: absolute;
          bottom: 30px;
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.85rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          z-index: 10;
        }
      </style>
    </head>
    <body>
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      
      <div class="glass-card">
        <h1>PocketDB</h1>
        <p>El puente inteligente está en línea. Este servidor enruta las peticiones de forma segura hacia la base de datos física de tu teléfono móvil en tiempo real.</p>
        
        <div class="status-container">
          <div class="pulse-dot"></div>
          <span class="status-text">Relay Activo</span>
        </div>
      </div>

      <div class="footer">Edge Database Node &bull; Open Source</div>
    </body>
    </html>
  `);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Almacena las conexiones activas de los teléfonos
// Key: deviceId, Value: socket
const activeDevices = new Map();

// Almacena las promesas pendientes de las consultas HTTP
// Key: queryId, Value: { resolve, reject }
const pendingQueries = new Map();

io.on('connection', (socket) => {
  console.log(`[+] Nueva conexión WebSocket: ${socket.id}`);

  // El teléfono se registra con su ID único
  socket.on('register_device', (deviceId) => {
    activeDevices.set(deviceId, socket);
    socket.deviceId = deviceId; // Guardamos la referencia en el socket
    console.log(`[+] Dispositivo registrado: ${deviceId} en el socket ${socket.id}`);
  });

  // El teléfono responde a una consulta SQL
  socket.on('query_result', (data) => {
    const { queryId, error, result } = data;
    console.log(`[<] Respuesta recibida para queryId: ${queryId}`);
    
    if (pendingQueries.has(queryId)) {
      const { resolve, reject } = pendingQueries.get(queryId);
      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
      pendingQueries.delete(queryId);
    }
  });

  // Manejar desconexiones
  socket.on('disconnect', () => {
    console.log(`[-] Socket desconectado: ${socket.id}`);
    if (socket.deviceId) {
      activeDevices.delete(socket.deviceId);
      console.log(`[-] Dispositivo eliminado: ${socket.deviceId}`);
    }
  });
});

// Endpoint HTTP para que el desarrollador (o Prisma/CLI) envíe consultas
app.post('/api/query/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  const { sql, args } = req.body;

  if (!activeDevices.has(deviceId)) {
    return res.status(404).json({ error: 'Dispositivo no encontrado o desconectado. Verifica que la app esté abierta en el teléfono.' });
  }

  if (!sql) {
    return res.status(400).json({ error: 'Se requiere el parámetro "sql" en el body.' });
  }

  const socket = activeDevices.get(deviceId);
  const queryId = crypto.randomUUID();

  console.log(`[>] Enviando query ${queryId} al dispositivo ${deviceId}: ${sql}`);

  try {
    // Creamos una promesa que se resolverá cuando el teléfono responda por WebSocket
    const queryPromise = new Promise((resolve, reject) => {
      pendingQueries.set(queryId, { resolve, reject });
      
      // Timeout de 15 segundos por si el teléfono pierde conexión mientras procesa
      setTimeout(() => {
        if (pendingQueries.has(queryId)) {
          pendingQueries.delete(queryId);
          reject(new Error('Timeout: El teléfono tardó demasiado en responder.'));
        }
      }, 15000);
    });

    // Enviamos la petición al teléfono
    socket.emit('execute_query', { queryId, sql, args });

    // Esperamos la respuesta
    const result = await queryPromise;
    return res.json({ success: true, data: result });

  } catch (error) {
    console.error(`[X] Error en query ${queryId}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Relay escuchando en el puerto ${PORT}`);
  console.log(`📡 Esperando conexiones de teléfonos...`);
});
