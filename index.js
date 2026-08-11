const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

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
