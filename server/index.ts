import type { ServerWebSocket } from 'bun';

const clients = new Set<ServerWebSocket<unknown>>();

const server = Bun.serve({
  port: 8080,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      const success = server.upgrade(req);
      if (success) {
        return undefined;
      }
      return new Response('WebSocket upgrade failed', { status: 400 });
    }

    return new Response('Touch Indicator WebSocket Server', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
      console.log(`Client connected. Total clients: ${clients.size}`);
    },
    message(ws, message) {
      const data = message.toString();
      console.log(`Received: ${data}`);

      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      }
    },
    close(ws) {
      clients.delete(ws);
      console.log(`Client disconnected. Total clients: ${clients.size}`);
    },
  },
});

console.log(`WebSocket server running at ws://localhost:${server.port}`);
