const request = require('request');
const moment = require('moment');
// const osLocale = require('os-locale');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3000;

moment.locale('en');

function zeroDate(date, setHours) {
	if (typeof date === 'string') {
		date = new Date(date);
	}
	if (setHours) {
		date.setHours(0);
	}
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);

	return date;
}

function getMostRecentStartDate(dbData) {
	const now = moment(new Date()).startOf('DAY').add(12, 'HOURS');

	return dbData.events.concat([{start: now}])
		.map((event) => event.start)
		.reduce((last, startDate) => {
			if (typeof last === 'string') {
				last = moment(last);
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

function createUpcomingDates() {
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
			request({
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
				url: `http://${DB_HOST}:${DB_PORT}/events`,
				body: JSON.stringify(event)
			});			
		})
	}
}

module.exports = {
	createUpcomingDates: createUpcomingDates,
	getMostRecentStartDate: getMostRecentStartDate,
	getNextTwoWeekDates: getNextTwoWeekDates,
};