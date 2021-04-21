const http = require('http');
const expwess = express();
const psql = require('pg');
const cors = require('cors');
const port = 8000;

expwess.get('/', (req, res) => {
	res.send('Server is up and running');
}

expwess.listen(port, () => {
	console.log(`listening in at http://localhost:${port}`);
}

let data = null;
const username = 'user';
const password = 'password';

const client = new Client();
await client.connect();

const res = await client.query('SELECT stuff FROM things;', (err, res) => {
	if (err) throw err;
	console.log(res);
	client.end();
});







