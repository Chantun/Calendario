import { getHolidaysByMonth, getEventsByMonth } from './dataParser.mjs';

const container = document.getElementById('event-list__section');

// Debe mostrar todos los proximos eventos del mes
// Se le suman los eventos del proximo mes cuyas fechas estan a dos semanas o menos de distancia
export default function setList(data) {
	const date = new Date();
	const month = date.getMonth();
	const year = date.getFullYear();
	const newData = sortAllEvents(data, month);

	container.innerHTML += `<h2>Proximos eventos de ${date.toLocaleString(
		'es-ES',
		{
			month: 'long',
		},
	)}</h2>`;

	const monthList = document.createElement('ul');

	newData.forEach((n) => {
		const li = document.createElement('li');
		li.innerHTML = `
    <span class="event-list__text event-list__text--date">${n.sortKey}-${month}-${year}</span>
    <span class="event-list__text">${n.details ? n.details : null}<span>
    `;
		monthList.append(li);
	});

	container.append(monthList);
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
