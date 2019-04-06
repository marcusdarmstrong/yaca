const express = require('express');
const SocketServer = require('ws').Server;

const port = process.env.PORT || 3000;
const server = express();
server.set("x-powered-by", false);
//server.use("/client/", express.static("client/dist"));

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


/*server.get("/", (req, res) => {
  res.send(`<!doctype html><html>
<head><title>Commenting</title></head>
<body>
  <script src="https://yaca-web.herokuapp.com/client/bundle.js"></script>
</body>
</html>`);
});*/
server.listen(port, () => console.log(`Yaca listening on port ${port}!`));
