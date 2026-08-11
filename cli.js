const readline = require('readline');

// Evitar advertencias de fetch en Node 18+
process.removeAllListeners('warning');

const DEVICE_ID = process.argv[2];
const API_KEY = process.argv[3];
const RELAY_URL = process.argv[4] || 'http://localhost:3001';

if (!DEVICE_ID || !API_KEY) {
  console.error("❌ Error: Faltan credenciales de conexión.");
  console.log("Uso: node cli.js <DEVICE_ID> <API_KEY> [RELAY_URL]");
  console.log("Ejemplo: node cli.js 3A5F9B mi_secreto https://tu-relay.fly.dev");
  process.exit(1);
}

const cleanUrl = RELAY_URL.endsWith('/') ? RELAY_URL.slice(0, -1) : RELAY_URL;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\x1b[36mpocketdb>\x1b[0m ' // Color cyan para el prompt
});

console.log(`\n☁️  Bienvenido al Monitor Interactivo de PocketDB.`);
console.log(`📡 Conectado al dispositivo \x1b[33m${DEVICE_ID}\x1b[0m a través de ${cleanUrl}`);
console.log(`Escribe tus consultas SQL (ej. SELECT * FROM users;). Escribe 'exit' para salir.\n`);

rl.prompt();

rl.on('line', async (line) => {
  let sql = line.trim();
  
  if (sql.toLowerCase() === 'exit' || sql.toLowerCase() === '.quit') {
    console.log("¡Adiós!");
    process.exit(0);
  }

  if (sql === '') {
    rl.prompt();
    return;
  }

  // --- CAPA DE TRADUCCIÓN (MySQL -> SQLite) ---
  const upperSql = sql.toUpperCase().replace(';', '').trim();
  
  if (upperSql === 'SHOW TABLES') {
    sql = "SELECT name AS 'Table' FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
  } else if (upperSql.startsWith('DESCRIBE ')) {
    const tableName = sql.split(' ')[1].replace(';', '');
    sql = `PRAGMA table_info(${tableName});`;
  }
  // --------------------------------------------

  try {
    const response = await fetch(`${cleanUrl}/api/query/${DEVICE_ID}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': API_KEY 
      },
      body: JSON.stringify({ sql })
    });

    const text = await response.text();
    
    try {
      const json = JSON.parse(text);
      if (json.success) {
        const data = json.data;
        if (Array.isArray(data) && data.length > 0) {
          // Si es un array de resultados (SELECT), imprimirlo como tabla
          console.table(data);
        } else if (Array.isArray(data) && data.length === 0) {
          console.log("\x1b[90m(0 filas)\x1b[0m"); // Gris
        } else {
          // Si es un resultado de INSERT/UPDATE/DELETE (filas afectadas)
          console.log(`\x1b[32mÉxito. Filas afectadas/insertadas:\x1b[0m`, data);
        }
      } else {
        console.error(`\x1b[31mError del motor SQLite:\x1b[0m ${json.error}`);
      }
    } catch(e) {
      console.error("\x1b[31mError de comunicación con el servidor:\x1b[0m", text);
    }
  } catch (error) {
    console.error(`\x1b[31mError de red:\x1b[0m ${error.message}`);
  }

  rl.prompt();
}).on('close', () => {
  console.log('¡Adiós!');
  process.exit(0);
});
