<div align="center">
  <h1>☁️ PocketDB Relay Server</h1>
  <p><strong>El puente en la nube que conecta tus apps con tu base de datos móvil.</strong></p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
</div>

<br />

## 🌐 ¿Qué es PocketDB Relay?
Este es el servidor intermediario para el ecosistema PocketDB. Su función principal es recibir peticiones HTTP estándar (REST) desde cualquier aplicación y enrutarlas directamente hacia el teléfono del desarrollador vía **WebSockets**. Resuelve el problema de red (NAT Traversal), permitiendo que tu teléfono actúe como una base de datos pública.

## 🌟 La Filosofía Open Source de PocketDB

Este proyecto consta de un servidor central y una aplicación móvil. Está diseñado para ofrecer dos alternativas:

1. **Servidor Público Oficial:** Mantenemos una instancia de este servidor siempre encendida en la nube (ej. Fly.io). Los usuarios que descarguen el APK de la aplicación móvil se conectarán aquí por defecto para una experiencia de "cero configuración".
2. **Tu Propio Servidor (Self-Hosted):** Si eres una empresa o un desarrollador que requiere privacidad absoluta y control total, puedes clonar este repositorio y levantar este servidor en tu propia infraestructura. Luego, solo introduces tu URL en la app móvil.

## 🚀 Despliegue de tu propio Servidor

Este servidor requiere conexiones WebSocket de larga duración (evita Serverless como Vercel). Recomendamos **Fly.io**, **Render** o **Railway**.

**Ejemplo con Fly.io:**
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

## 📖 Referencia de la API (Uso del Cliente)

Una vez que el teléfono esté conectado, puedes enviarle consultas SQL mediante HTTP.

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
  "data": []
}
```
