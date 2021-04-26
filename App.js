const http = require('http');
const expwessReq = require('express');
const expwess = expwessReq();
const {Client} = require('pg');
const cors = require('cors');
const port = 8000;

expwess.get('/', (req, res) => {
	res.send('Server is up and running');
})

expwess.listen(port, () => {
	console.log(`listening in at http://localhost:${port}`);
})

let data = null;
const username = 'bismarck';
const password = 'chongle33';

const config = {
	host: 'localhost',
	user: username,
	password: password,
	database: 'mydb',
	port: port,
}

const client = new Client(config);
client.connect(err => {
	if (err) throw err;
	else {
		getData();
	}
});

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
	})
const res = client.query(sql, (err, res) => {
	if (err) throw err;
	console.log(res);
	client.end();
});
}

getData('SELECT * FROM sample;');
