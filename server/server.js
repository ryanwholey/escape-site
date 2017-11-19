const express = require('express');
const app = express();

const morgan = require('morgan');
const path = require('path');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser')
const session = require('express-session');

const db = require('./dbAPI');

function checkPermission(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/login');
	}
}

function getUser(username, password) {
	if (!username || !password) {
		return null;
	}

	return {
		id: 1,
		username: 'admin'
	};
}

function template(name) {
	return path.resolve(__dirname, '../src/templates/' + name);
}

function fabricateDates() {
	const dates = [];

	for (const i = 0; i < 14; i++) {
		let date = new Date();
		date.setDate(date.getDate() + i);
		for (const j = 0; j < 9; j++) {		
			date.setHours(12 + j);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			dates.push(date.toISOString());
		}
	}
	return dates;
}	

const api = {
	getGameData(gameId) {
		if (gameId) {
			gameId = parseInt(gameId, 10);
		}

		const games = require('./db.json').games
			.filter((game) =>  game.id === gameId);

		if (games.length) {
			return games[0];
		} 
		return {};
	},
	getEventsData(gameId) {
		if (!gameId) {
			gameId = 1;
		} else {
			gameId = parseInt(gameId, 10);
		}

		return require('./db.json').events
			.filter((event) => event.gameId === gameId);
	}
}

app.engine('handlebars', hbs({defaultLayout: template('index')}));
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || 'localhost');

app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: 'super secret secret code',
	saveUninitialized: true,
	resave: true,
}));


app.post('/submit-contact', function(req, res) {
	res.render(template('thanks'), {backUrl: '/contact'});
});

app.get('/purchase', function(req, res) {
	res.render(template('purchase'));
});

// Assets

app.use('/lib',express.static(path.resolve(__dirname, '../src/assets/lib')));
app.use('/bundles', express.static(path.resolve(__dirname, '../build')));


// Routes

app.get('/', function(req, res) {
	res.render(template('home'));
});

app.get('/contact', function(req, res) {
	res.render(template('contact'));
});

app.get('/refresh', function(req, res) {
	// console.log(req);
	db.createUpcomingDates();

	res.redirect('/');
	// res.status(200).send('ok');
})

app.get('/book', function(req, res) {
	// var gameData

	if (!req.query.game) {
		return res.redirect('/book?game=1');
	}
	const gameId = parseInt(req.query.game, 10);
	const eventsData = api.getEventsData(gameId);
	const gameData = api.getGameData(gameId);
	
	const data = {
		serverData: JSON.stringify({
			events: eventsData,
		}),
		game: gameData
	};
	
	res.render(template('book'), data);
});

app.get('/profile', checkPermission, function(req, res) {
	const user = JSON.parse(req.session.user);

	res.render(template('profile'), {user});
});


app.get('/logout', function(req, res) {
	req.session.user = null;
	res.redirect('/')
});

app.get('/login', function(req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render(template('login'));
	}

});

app.post('/login', function(req, res) {
	const user = getUser(req.body.username, req.body.password);

	if (!user) {
		res.render(template('login'), {errors: ['username or password does not match']});
	} else {
		req.session.user = JSON.stringify(user);
		
		res.redirect('/profile');
	}

});


app.listen(app.get('port'), function(err) {
	let dbErr;
	try {
		// db.createUpcomingDates();
	} catch(e) {
		dbErr = e;
	}
	if (err || dbErr) {
		console.error(dbErr);
		console.error(err);
		return;
	}

	console.log(`Server running on ${app.get('host')}:${app.get('port')}`);
});
