const http = require("http")
const express = require('express');
var compression = require('compression');
const SocketServer = require('ws').Server;

const port = process.env.PORT || 3000;
const app = express();
app.set("x-powered-by", false);
app.use(compression())
app.use("/client/", express.static("client/dist"));
app.get('/latest', (req, res) => {
  res.send(JSON.stringify(require('./sample.json')));
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
const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({
      type: 'ping'
      value: new Date().toTimeString()
    });
  });
}, 1000);


app.post('/api/add-comment', (req, res) => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({
      type: 'comment',
      value: req.body
    });
  });
  res.status(200).end(req.body);
});



server.listen(port, () => console.log(`Yaca listening on port ${port}!`));
