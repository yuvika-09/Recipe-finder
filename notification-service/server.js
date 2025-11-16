const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const subscriber = require('./queue');

const app = express();  
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// When Redis publishes a message → send to all WebSocket clients
subscriber.on("message", (channel, message) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
});

wss.on("connection", () => {
    console.log("User connected to Notification WebSocket");
});

server.listen(3003, () => {
    console.log("Notification Service running on http://localhost:3003");
});
