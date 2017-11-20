const request = require('request');
const moment = require('moment');
const requireClear = require('clear-require')

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3000;

moment.locale('en');


function getMostRecentStartDate(dbData) {
	const now = moment(new Date()).startOf('DAY').add(12, 'HOURS');

	return dbData.events.concat([{start: now}])
		.map((event) => event.start)
		.reduce((last, startDate) => {
			if (typeof last === 'string') {
				last = moment(new Date(last));
			}
			
			const current = moment(new Date(startDate));
			
			if (current.isAfter(last)) {
				return current;
			}

			return last;
		});
}

function getTwoWeeksFromNow() {
	return moment(new Date()).add(2, 'WEEKS').toString();
}

function getNextTwoWeekDates(dbData) {
	const lastStartDate = getMostRecentStartDate(dbData);
	const twoWeeksFromNow = moment(new Date()).add(2, 'WEEKS');

	const dates = [];
	let current = lastStartDate;

	while (current.isBefore(twoWeeksFromNow)) {

		const hour = current.get('hours');
		if (hour >= 12 && hour <= 22) {
			dates.push(moment(current));
			current.add(1, 'HOUR');
		} else {
			current.add(1, 'DAY').startOf('DAY').add(12, 'HOURS');
		}
		
		if (dates.length > 5000) {
			console.error('error: limit on creating new events 5000');
			break;
		}
	}
	return dates;
}

function getEvents() {
	return new Promise((resolve, reject) => {
		request({
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'GET',
			url: `http://${DB_HOST}:${DB_PORT}/events`,
		})
	})
}

function createUpcomingDates() {
	requireClear('./db.json');

	const dbData = require('./db.json');
	const gameIds = dbData.games.map((game) => game.id);
	const dates = getNextTwoWeekDates(dbData);
	const events = dates.map((date) => {
		return gameIds.map((id) => ({
			gameId: id,
			start: date.toString(),
			startHuman: date.format('llll'),
			created: moment(new Date()).toString(),
		}))
	})
	.reduce((collection, array) => collection.concat(array),[])

	if (events.length) {
		events.forEach((event) => {
			try{
				request({
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'POST',
					url: `http://${DB_HOST}:${DB_PORT}/events`,
					body: JSON.stringify(event)
				});			
				
			} catch(err) {
				console.error('failed to write new event', err);
			}
		})
	}
}

module.exports = {
	createUpcomingDates: createUpcomingDates,
	getMostRecentStartDate: getMostRecentStartDate,
	getNextTwoWeekDates: getNextTwoWeekDates,
};