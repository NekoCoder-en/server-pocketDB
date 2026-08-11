const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Landing Page Bonita Premium
// Landing Page (Documentación de la API)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketDB API Reference</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #000000;
      --bg-surface: #111111;
      --border: #333333;
      --text-main: #EDEDED;
      --text-muted: #888888;
      --accent: #0070F3;
      --code-bg: #1A1A1A;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background-color: var(--bg-base); color: var(--text-main); display: flex; min-height: 100vh; line-height: 1.6; }
    
    /* Layout */
    .sidebar { width: 280px; background-color: var(--bg-surface); border-right: 1px solid var(--border); padding: 2rem; position: fixed; height: 100vh; overflow-y: auto; }
    .content { margin-left: 280px; flex: 1; padding: 4rem; max-width: 900px; }
    
    /* Sidebar */
    .logo { font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; letter-spacing: -0.5px; }
    .nav-group { margin-bottom: 2rem; }
    .nav-title { font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem; letter-spacing: 1px; }
    .nav-link { display: block; color: var(--text-main); text-decoration: none; font-size: 0.95rem; margin-bottom: 0.75rem; transition: color 0.2s; }
    .nav-link:hover { color: var(--accent); }
    
    /* Content */
    h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -1px; }
    h2 { font-size: 1.5rem; font-weight: 600; margin-top: 3rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    h3 { font-size: 1.1rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1.5rem; color: var(--text-muted); font-size: 1.05rem; }
    
    /* Code Blocks */
    code { font-family: 'Fira Code', monospace; font-size: 0.9em; background: var(--code-bg); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid var(--border); }
    pre { background: var(--code-bg); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); overflow-x: auto; margin-bottom: 2rem; }
    pre code { background: transparent; padding: 0; border: none; font-size: 0.85rem; color: #E3E3E3; }
    
    /* Endpoints */
    .endpoint { display: inline-block; background: var(--bg-surface); border: 1px solid var(--border); padding: 0.5rem 1rem; border-radius: 6px; font-family: 'Fira Code', monospace; font-size: 0.9rem; margin-bottom: 1rem; }
    .method { color: var(--accent); font-weight: 600; margin-right: 0.5rem; }
    
    /* Status Badge */
    .status-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,255,100,0.1); border: 1px solid rgba(0,255,100,0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; color: #00E676; font-weight: 600; margin-bottom: 2rem; }
    .status-dot { width: 8px; height: 8px; background: #00E676; border-radius: 50%; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    th, td { text-align: left; padding: 1rem; border-bottom: 1px solid var(--border); }
    th { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
    td { font-size: 0.95rem; }
  </style>
</head>
<body>
  
  <div class="sidebar">
    <div class="logo">PocketDB</div>
    
    <div class="nav-group">
      <div class="nav-title">Empezando</div>
      <a href="#intro" class="nav-link">Introducción</a>
      <a href="#auth" class="nav-link">Autenticación</a>
    </div>
    
    <div class="nav-group">
      <div class="nav-title">Referencia API</div>
      <a href="#execute" class="nav-link">Ejecutar Consulta</a>
    </div>

    <div class="nav-group">
      <div class="nav-title">Ejemplos</div>
      <a href="#examples-node" class="nav-link">Uso en JavaScript</a>
    </div>
  </div>

  <div class="content">
    <div class="status-badge">
      <div class="status-dot"></div>
      Relay Server Online
    </div>

    <h1 id="intro">Documentación de la API</h1>
    <p>PocketDB Relay Server proporciona una API HTTP RESTful moderna que te permite interactuar de forma remota y segura con la base de datos SQLite alojada en tu dispositivo móvil. Todas las peticiones HTTP se transforman en mensajes WebSocket de baja latencia bajo el capó.</p>

    <h2 id="auth">Autenticación y Conexión</h2>
    <p>La API no utiliza sistemas de tokens complejos. Utiliza el identificador <code>deviceId</code> único (6 caracteres) que aparece en la pantalla principal de la aplicación móvil de PocketDB para enrutar las consultas al dispositivo exacto.</p>

    <h2 id="execute">Ejecutar Consulta (Query)</h2>
    <p>Envía cualquier sentencia SQL estándar (incluyendo <code>CREATE DATABASE</code>, <code>USE</code>, <code>SELECT</code>, <code>INSERT</code>) al dispositivo móvil enlazado.</p>
    
    <div class="endpoint">
      <span class="method">POST</span> /api/query/:deviceId
    </div>

    <h3>Parámetros de Ruta</h3>
    <table>
      <tr>
        <th>Parámetro</th>
        <th>Tipo</th>
        <th>Descripción</th>
      </tr>
      <tr>
        <td><code>deviceId</code></td>
        <td><code>string</code></td>
        <td>El ID de 6 caracteres visible en la aplicación móvil.</td>
      </tr>
    </table>

    <h3>Cuerpo de la Petición (JSON)</h3>
    <pre><code>{
  "sql": "SELECT * FROM usuarios WHERE edad > ?",
  "args": [18]
}</code></pre>

    <h3>Respuesta Exitosa (200 OK)</h3>
    <pre><code>{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Ana",
      "edad": 28
    }
  ]
}</code></pre>

    <h2 id="examples-node">Ejemplo Completo</h2>
    <p>Un flujo típico implica primero cambiar de contexto a tu base de datos con <code>USE</code>, y luego ejecutar operaciones seguras usando parámetros para evitar inyecciones SQL.</p>
    
    <pre><code>// 1. Configuración
const DEVICE_ID = '3C9DT6'; // Tu ID de la app móvil
const RELAY_URL = 'https://pocketdb-otnm.onrender.com';

async function ejecutarSQL(sql, args = []) {
  const res = await fetch(\`\${RELAY_URL}/api/query/\${DEVICE_ID}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, args })
  });
  return await res.json();
}

// 2. Ejecución
async function main() {
  // A. Cambiamos a la base de datos aislada 'ecommerce'
  await ejecutarSQL('USE ecommerce;');
  
  // B. Insertamos un dato con argumentos parametrizados (PreparedStatement)
  const result = await ejecutarSQL(
    'INSERT INTO productos (nombre, precio) VALUES (?, ?);', 
    ['Laptop Gamer', 1200]
  );
  
  console.log('ID insertado exitosamente:', result.data.lastInsertRowId);
}

main();</code></pre>

  </div>

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
