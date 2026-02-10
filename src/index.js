import express from 'express';
import { matchesRouter } from './routes/matches.js';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
// Create an HTTP server instance using the app
const server = http.createServer(app);

// Use JSON middleware to parse incoming JSON requests
app.use(express.json());

// Define a root GET route that returns a welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Sportz server!');
});

// Use the matches router for all routes starting with '/matches'
app.use('/matches', matchesRouter);

// Attach the WebSocket server to the HTTP server and extract the broadcast function
const { broadcastMatchCreated } = attachWebSocketServer(server);

// Store the broadcast function in app.locals for use in route handlers
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running at ${baseUrl}`);
  console.log(`Websocket is running on ${baseUrl.replace('http', 'ws')}/ws`)
});