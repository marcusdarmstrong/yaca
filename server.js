const http = require('http');

const server = http.createServer((req, res) => {
  const body = 'hello world';
	res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain'
  })
  .end(body);
});

server.listen(process.env.PORT);
console.log(`Listening on ${process.env.PORT}`);
