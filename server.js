const http = require("http")
const express = require('express');
const SocketServer = require('ws').Server;

const port = process.env.PORT || 3000;
const app = express();
app.set("x-powered-by", false);
app.use("/client/", express.static("client/dist"));
app.get('/latest', (req, res) => {
  res.send(`{"foo":"bar"}`);
});
app.get('/', (req, res) => {
  res.send(`<!doctype html><html>
<head><title>Commenting</title></head>
<body>
  <script src="https://yaca-web.herokuapp.com/client/bundle.js"></script>
</body>
</html>`);
});

const server = http.createServer(app);
server.listen(port, () => console.log(`Yaca listening on port ${port}!`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);