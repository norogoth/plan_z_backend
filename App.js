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

const config = {
	host: 'localhost',
	user: username,
	password: password,
	port: port,
}

const client = new Client(config);
await client.connect( err => {
	if (err) throw err;
	else {
		getData();
	}
);

function getData(sql) {
	client
	.query(sql)
	.then(() => {
		console.log('query ran.');
		client.end();
	})
	.catch(err => console.log(err))
	.then(() => {
		console.log('finished execution.');
		process.exit();
	}
}
const res = await client.query('SELECT stuff FROM things;', (err, res) => {
	if (err) throw err;
	console.log(res);
	client.end();
});

