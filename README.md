<div align="center">
  <h1>☁️ PocketDB Relay Server</h1>
  <p><strong>El puente en la nube que conecta tus apps con tu base de datos móvil.</strong></p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
</div>

<br />

## 🌐 ¿Qué es PocketDB Relay?
Este es el servidor intermediario para el ecosistema PocketDB. Su función principal es recibir peticiones HTTP estándar (REST) desde cualquier aplicación o script de backend, traducirlas a eventos **WebSocket**, y enrutarlas directamente hacia el teléfono del desarrollador donde reside físicamente la base de datos SQLite.

Resuelve el problema del "NAT Traversal", permitiendo que tu teléfono actúe como una DB pública sin necesidad de configurar firewalls o usar Ngrok.

## ⚙️ ¿Cómo Funciona?
1. La App Móvil de PocketDB se conecta a este servidor por WebSockets y se registra con un `Device ID` único.
2. Tu backend o ORM envía un `POST` a `/api/query/:deviceId` con una sentencia SQL.
3. El Relay Server localiza al teléfono, envía el comando, espera que SQLite lo procese en el móvil, y te devuelve la respuesta.

## 🚀 Despliegue (Recomendado: Fly.io o Render)
Este servidor necesita mantener conexiones WebSocket abiertas de larga duración. No se recomienda usar Vercel (Serverless).

**Despliegue rápido en Fly.io:**
```bash
fly launch
fly deploy
```

## 🛠️ Instalación Local

```bash
git clone https://github.com/NekoCoder-en/server-pocketDB.git
cd server-pocketDB
npm install
npm start
```
El servidor escuchará por defecto en el puerto `3001`.

## 📖 Referencia de la API

### Ejecutar un Query
`POST /api/query/:deviceId`

**Body:**
```json
{
  "sql": "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);",
  "args": []
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": [
     // Resultados de tu tabla o filas afectadas
  ]
}
```
---
*Hecho con ❤️ para desarrolladores que buscan herramientas ágiles.*
