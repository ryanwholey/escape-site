import '../css/book.css'

(function() {
	function loadAndRenderEvents() {
		if (!window.__SERVER_DATA__) {
			return;
		}

		const events = window.__SERVER_DATA__.events || [];
		const listEl = document.querySelector('.booking-list');
		events.map((v) => v)
			.sort((a,b) => {
				if (new Date(a.start) < new Date(b.start)) return -1;
				if (new Date(a.start) > new Date(b.start)) return 1;
				return 0;
			})
			.filter((event) => new Date(event.start) > new Date())
			.map((event) => {
				const el = document.createElement('li');
				// const date = new Date(event.start);
				// let hour = date.getHours();
				// let ampm = 'am';
				// if (hour > 12) {
				// 	hour -= 12;
				// 	ampm = 'pm';
				// }
				// const dateString = date.toLocaleDateString();

				el.innerHTML = `<span>${event.startHuman}</span><i class="next-arrow next-arrow-right"></i>`;
				return el;
			})
			.forEach((eventEl) => listEl.appendChild(eventEl));
	}
	function addListeners() {
		document.querySelector('.booking-list').onclick = function() {
			window.location = '/purchase';
		}
	}

	window.onload = function() {
		loadAndRenderEvents();
		addListeners();
	}
}())
