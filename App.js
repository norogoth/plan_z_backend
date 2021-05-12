const http = require('http');
require('dotenv').config();
const {Client} = require('pg');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const oAuthClient = new OAuth2Client(process.env.CLIENT_ID);
const port = 8000;

/* EXPRESS */
const expwessWeq = require('express');
const app = expwessWeq();
const server = expwessWeq.Router()
const session = require('express-session');
app.set('view engine','ejs');

app.use(session({
	resave: false,
	saveUnititialized: true,
	secret: 'SECRET'
}));

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

app.use(cors());


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
	res.end('Ok');
/*
	const { token } = req.body

	const ticket = await OAuthClient.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID
	});
	const { name, email, picture } = ticket.getPayload();
	
	console.log('name: ',name,'\nemail: ',email,'\npicture: ',picture
	);
	const updateString = `INSERT INTO users (email, firstName, lastName) VALUES("${email}","${name}","${name}") ON CONFLICT DO NOTHING/UPDATE;`;
	queryDb(updateString);

	const user = await db.user.upsert({
		where: {email: email },
		update: {name, picture },
		create: {name, email, picture }
	})

	res.status(201);
	res.json(user)
*/
});







