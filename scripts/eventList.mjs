import {
	getHolidaysByMonth,
	getEventsByMonth,
	eventToClass,
} from './dataParser.mjs';

const container = document.getElementById('event-list__section');

// Debe mostrar todos los proximos eventos del mes
// Se le suman los eventos del proximo mes cuyas fechas estan a dos semanas o menos de distancia
export default function setList(data) {
	const date = new Date();
	const month = date.getMonth();
	const year = date.getFullYear();
	const newData = sortAllEvents(data, month);
	const nextMonthData = getEventsNextMonth(data, month);

	container.innerHTML += `<h2>Proximos eventos de ${date.toLocaleString(
		'es-ES',
		{
			month: 'long',
		},
	)}</h2>`;

	const monthList = document.createElement('ul');
	const nextMonthList = document.createElement('ul');

	monthList.classList.add('event__list');
	nextMonthList.classList.add('event__list');

	newData.forEach((n) => {
		const li = document.createElement('li');
		li.innerHTML = `
		<span class="icon_before icon_before--big ${n.eventType == 'holiday' ? 'icon_holiday' : eventToClass(n.type)}"></span>
		<span class="event-list__text">${n.details ? n.details : null}</span>
		<span class="event-list__text--date">${n.sortKey >= 10 ? n.sortKey : '0' + n.sortKey}-${month + 1 >= 10 ? month + 1 : '0' + (month + 1)}-${year}</span>
    `;

		if (n.eventType == 'holiday' || (n.eventType == 'period' && n.suspension)) {
			li.style.backgroundColor = '#D4D4D4';
		} else if (n.eventType == 'period') {
			li.style.backgroundColor = '#FAD7C8';
		}
		if (n.eventType == 'event') {
			li.style.backgroundColor = `#${data.horarios.find((h) => h.name == n.name).color}`;
		}
		monthList.append(li);
	});
	container.append(monthList);

	if (nextMonthData.length == 0) {
		return;
	}

	container.innerHTML += `<h2>Proximos eventos de las siguienes semanas</h2>`;

	nextMonthData.forEach((n) => {
		const li = document.createElement('li');
		li.innerHTML = `
		<span class="icon_before icon_before--big ${eventToClass(n.type)}"></span>
		<span class="event-list__text">${n.details ? n.details : null}</span>
    <span class="event-list__text--date">${n.sortKey >= 10 ? n.sortKey : '0' + n.sortKey}-${(month + 1 >= 10 ? month + 1 : '0', month + 1)}-${year}</span>
    `;

		if (n.eventType == 'holiday' || (n.eventType == 'period' && n.suspension)) {
			li.style.backgroundColor = '#D4D4D4';
		} else if (n.eventType == 'period') {
			li.style.backgroundColor = '#FAD7C8';
		}
		if (n.eventType == 'event') {
			li.style.backgroundColor = `#${data.horarios.find((h) => h.name == n.name).color}`;
		}
		nextMonthList.append(li);
	});
	container.append(nextMonthList);
}

function getEventsNextMonth(data, month) {
	const date = new Date();
	const daysLeft =
		new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() -
		date.getDate();
	const holidays = getHolidaysByMonth(month + 1, data.holidays)
		.filter((n) => n.day + daysLeft <= 14)
		.map((h) => ({ ...h, eventType: 'holiday', sortKey: h.day }));
	const events = getEventsByMonth(month + 1, data.events)
		.filter((n) => n.day + daysLeft <= 14)
		.map((e) => ({
			...e,
			eventType: 'event',
			sortKey: e.day,
			details: `${typeToText(e.type)} en ${e.name}`,
		}));
	const periods = getPeriodsStartByMonth(month + 1, data.periods)
		.filter((n) => n.start + daysLeft <= 14)
		.map((p) => ({ ...p, eventType: 'period', sortKey: p.start }));

	const all = [...holidays, ...events, ...periods];
	return all.sort((a, b) => a.sortKey - b.sortKey);
}

function sortAllEvents(data, month) {
	const today = new Date().getDate();
	const holidays = getHolidaysByMonth(month, data.holidays)
		.filter((n) => n.day > today)
		.map((h) => ({ ...h, eventType: 'holiday', sortKey: h.day }));
	const events = getEventsByMonth(month, data.events)
		.filter((n) => n.day > today)
		.map((e) => ({
			...e,
			eventType: 'event',
			sortKey: e.day,
			details: `${typeToText(e.type)} en ${e.name}`,
		}));
	const periods = getPeriodsStartByMonth(month, data.periods)
		.filter((n) => n.start > today)
		.map((p) => ({ ...p, eventType: 'period', sortKey: p.start }));

	const all = [...holidays, ...events, ...periods];
	return all.sort((a, b) => a.sortKey - b.sortKey);
}

function getPeriodsStartByMonth(month, data) {
	const aux = data.filter((n) => {
		const start = new Date(n.start);
		return start.getMonth() == month;
	});
	const mappedData = aux.map((n) => {
		return {
			...n,
			start:
				new Date(n.start).getMonth() == month
					? new Date(n.start).getDate()
					: null,
		};
	});
	return mappedData;
}

function typeToText(num) {
	switch (num) {
		case 1:
			return 'Paro docente';
		case 2:
			return 'Exposicion';
		case 3:
			return 'Parcial';
		case 4:
			return 'Recuperatorio';
	}
}
