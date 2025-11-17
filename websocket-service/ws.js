const WebSocket = require("ws");
const redis = require("redis");

const subscriber = redis.createClient({ url: "redis://127.0.0.1:6379" });
subscriber.connect().catch(()=>{});

const wss = new WebSocket.Server({ port: 9000 });
let clients = new Set();

wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
});

(async () => {
    await subscriber.subscribe("recipe-events", (message) => {
        // broadcast to connected websockets
        for (let ws of Array.from(clients)) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        }
    });
    console.log("WebSocket service running on ws://localhost:9000 and subscribed to recipe-events");
})();
