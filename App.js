const http = require('http');
require('dotenv').config();
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

const config = {
	host: 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'mydb',
	port: 5432,
}

const client = new Client(config);
client.connect(err => {
	if (err) throw err;
	else {
		getData('SELECT * FROM sample;');
	}
});

function getData(sql) {
	client
	.query(sql)
	.then((res) => {
		console.log('query ran. Result: ', res.rows);
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

