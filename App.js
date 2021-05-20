const http = require('http');
require('dotenv').config();
const {Client} = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const oAuthClient = new OAuth2Client(process.env.CLIENT_ID);
const port = 8000;


/* EXPRESS */
const express = require('express');
const app = express();
const session = require('express-session');
app.set('view engine','ejs');

/* CORS stuff */
app.use(cors({origin:'http://localhost:3000', credentials: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function(req, res) {
	res.render('pages/auth');
});

app.listen(port, () => {
	console.log(`listening in at http://localhost:${port}`);
})

/* PASSPORT SETUP */
const passport = require("passport");
let userProfile;
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine','ejs');
app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send('error logging in'));

passport.serializeUser(function(user, cb) {
	cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
	cb(null, obj);
});

/* Google Setup*/
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(new GoogleStrategy({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: 'http://localhost:8000/auth/google/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		userProfile=profile;
		return done(null, userProfile);
	}

));

const config = {
	host: 'localhost',
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: 'mydb',
	port: 5432,
}

const client = new Client(config);
function clientConnect() {
	client.connect(err => {
	if (err) throw err;
		else {
			console.log('connected successfully.');
		}
	});
}

clientConnect();

async function queryDb(sql) {
	return client
	.query(sql)
	.then((res) => {
		console.log('query ran. Result: ', res.rows);
		return res.rows;
	})
	.catch(err => console.log(err))
};

app.get('/test', async (req,res) => {
	const data = await queryDb('SELECT id, name FROM sample WHERE id in (\'6\',\'7\');');
	res.status(200).send(data);
});

app.get('/data', async (req,res) => {
	const data = await queryDb('SELECT * FROM sample;');
	res.status(200).send(data);
});

app.get('/auth/google',
	passport.authenticate('google', {scope : ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });

//Setting up posting with OAut2
app.post('/api/v1/auth/google', async (req, res) => {
	console.log('api/v1/auth/google was called');
	console.log('req: ',req);
	console.log('req.body: ',req.body);
	const { token } = req.body

	const ticket = await oAuthClient.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID
	});
	const { sub, name, email, picture } = ticket.getPayload();
	
	nameArray = name.split(' ');
	firstName = nameArray[0];
	lastName = nameArray[1];

	//console.log('name: ',name,'\nemail: ',email,'\npicture: ',picture,'sub: ',sub);
	const updateString = `INSERT INTO users (googleid, email, firstName, lastName) VALUES('${sub}','${email}','${firstName}','${lastName}') ON CONFLICT DO NOTHING;`;
	queryDb(updateString);
	
	res.status(201);
	const myJson = {
		'token': token
	}
	const myData = {
		'id': sub,
		'name': name,
		'email': email,
		'picture': picture,
	}
	const myJwt = jwt.sign(myJson, process.env.JWT_SECRET);
	console.log(myJson);
	res.cookie('jwt', myJwt, {
		domain: 'localhost:3000',
		httpOnly: true
	});
	res.json(myData);
	res.send();
});
