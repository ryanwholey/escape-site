const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults();
const DEFAULT_PORT = 3000;

let port;

const portInfo = process.argv
	.map((arg, index) => ({arg, index}))
	.filter((arg) => arg.arg === '--port');

if (portInfo.length) {
	port = process.argv[portInfo[0].index + 1];
} else if (process.env.DB_PORT) {
	port = process.env.DB_PORT;
} else {
	port = DEFAULT_PORT;
}

server.use(middlewares)
server.use(router)
server.listen(port, () => {
  	console.log('JSON Server is running on port ', port);
});
