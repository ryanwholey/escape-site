var express = require('express');
var app = express();

var morgan = require('morgan');
var path = require('path');
var hbs = require('express-handlebars');


app.engine('handlebars', hbs({defaultLayout: path.resolve(__dirname, '../src/templates/index')}));
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 8080);
app.set('host', process.env.HOST || 'localhost');

app.use(morgan('tiny'));


// Assets

app.use('/lib',express.static(path.resolve(__dirname, '../src/lib')));
app.use('/bundles', express.static(path.resolve(__dirname, '../build')));



// Routes

app.get('/', function(req, res) {
	res.render(path.resolve(__dirname, '../src/templates/home'));
});
app.get('/contact', function(req, res) {
	res.render(path.resolve(__dirname, '../src/templates/contact'));
});
app.get('/book', function(req, res) {
	var data = {serverData: JSON.stringify({game: req.query.game})}
	res.render(path.resolve(__dirname, '../src/templates/book'), data, function(err, html) {
		if (err){
			res.status(500).send('error');
		} else {
			res.send(html);
		}
	});
});
app.get('/profile', function(req, res) {
	res.render(path.resolve(__dirname, '../src/templates/profile'));
});


app.listen(app.get('port'), function(err) {
	if(err) {
		console.error(err);
		return;
	}

	console.log('Server running on ' + app.get('host') + ':' + app.get('port'));
});
