const dbData = require('./db.json');
const request = require('request');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3000;

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

function getMostRecentStartDate() {
	return dbData.events.concat([{start: new Date().toISOString()}])
		.map((event) => event.start)
		.reduce((last, startDate) => {
			if (typeof last === 'string') {
				last = new Date(last);
			}
			
			const current = new Date(startDate);
			
			if (current > last) {
				return current;
			}

			return last;
		});
}
function getNextTwoWeekDates() {
	const lastStartDate = getMostRecentStartDate();
	const twoWeeksFromNow = zeroDate(new Date());
	twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 20);

	const dates = [];
	let current = zeroDate(new Date(lastStartDate));

	while (current < twoWeeksFromNow) {
		let hour = current.getHours();
		if (hour >= 12 && hour <= 22) {
			current.setHours(current.getHours() + 1);
		} else {
			current.setHours(20);
			current.setDate(current.getDate() + 1);
		}
		dates.push(new Date(current));
		if (dates.length > 400) {
			console.error('error');
			break;
		}
	}
	return dates;
}

function createUpcomingDates() {
	const gameIds = dbData.games.map((game) => game.id);
	const dates = getNextTwoWeekDates();
	const events = dates.map((date) => {
		return gameIds.map((id) => ({
			gameId: id,
			start: date,
			created: zeroDate(new Date(), true),
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
	// console.log(dates);
}

module.exports = {
	createUpcomingDates: createUpcomingDates
};