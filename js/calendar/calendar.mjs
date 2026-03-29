import { simpleFetch } from '../fetch.mjs';
import * as parser from './dataParser.mjs';
import displayDay from './displayDay.mjs';
import setList from './eventList.mjs';

const date = getHoraArgentina();
let month = date.getUTCMonth();
const currentMonth = month;
const currentYear = date.getFullYear();

const monthSpan = document.getElementById('month__name');

function setCalendar(data, thisMonth) {
	const calendar = document.getElementById('calendar');

	const newDate = thisMonth ? date : new Date(currentYear, month);
	const daysInfo = {
		currentDay: thisMonth ? newDate.getUTCDate() : 0,
		firstDay: new Date(
			newDate.getFullYear(),
			newDate.getUTCMonth(),
			1,
		).getDay(),
		lastDay: new Date(
			newDate.getFullYear(),
			newDate.getUTCMonth() + 1,
			0,
		).getUTCDate(),
	};

	const days = [];

	const specialDays = {
		holidays: parser.getHolidaysByMonth(month, data.holidays),
		events: parser.getEventsByMonth(month, data.events),
		periods: parser.getPeriodsByMonth(month, data.periods),
	};

	// LLena el array con los 'dias' antes del 1ro (si el mes no emieza un domingo)
	for (let i = 0; i < daysInfo.firstDay; i++) {
		days.push(createDiv('calendar__day not_a_day'));
	}

	for (let i = 1; i <= daysInfo.lastDay; i++) {
		const day = Object.assign(
			createDiv(
				i == daysInfo.currentDay
					? 'calendar__day calendar__day--current'
					: i < daysInfo.currentDay
						? 'calendar__day'
						: 'calendar__day calendar__day--upcoming',
				i < daysInfo.currentDay
					? `<div class="calendar__day--past"></div><span class="calendar__day--num">${i}</span><div class="icon__container"></div>`
					: `<span class="calendar__day--num">${i}</span><div class="icon__container"></div>`,
			),
		);

		const container = day.querySelector('.icon__container');
		if (specialDays.holidays.some((h) => h.day === i)) {
			container.innerHTML += `<span class="icon_before icon_holiday"></span>`;
			day.classList.add('no_classes');
		}
		if (specialDays.events.some((n) => n.day === i)) {
			const eventDay = specialDays.events.filter((n) => n.day === i);
			eventDay.forEach((n) => {
				container.innerHTML += `<span class="icon_before ${parser.eventToClass(n.type)}"></span>`;
			});
		}

		day.addEventListener('click', () => {
			displayDay(data, i, month, currentYear);
		});

		days.push(day);
	}

	specialDays.periods.forEach((p) => {
		const setPeriod = (i, firstday) => {
			days[firstday + i].querySelector('.icon__container').innerHTML +=
				`<span class="icon_before ${parser.eventToClass(p.type)}"></span>`;
			if (p.suspension) {
				days[firstday + i].classList.add('no_classes');
			}
		};
		if (p.start && p.end) {
			for (let i = p.start - 1; i < p.end; i++) {
				setPeriod(i, daysInfo.firstDay);
			}
		} else if (p.start) {
			for (let i = p.start - 1; i < daysInfo.lastDay; i++) {
				setPeriod(i, daysInfo.firstDay);
			}
		} else if (p.end) {
			for (let i = 0; i < p.end; i++) {
				setPeriod(i, daysInfo.firstDay);
			}
		}
	});

	while (days.length < 42) {
		days.push(createDiv('calendar__day not_a_day')); // Rellena el resto del calendario
	}

	alignCalendar(data.horarios, days);

	calendar.innerHTML = `<div class="calendar__day calendar__day--header">Domingo</div>
				<div class="calendar__day calendar__day--header">Lunes</div>
				<div class="calendar__day calendar__day--header">Martes</div>
				<div class="calendar__day calendar__day--header">Miercoles</div>
				<div class="calendar__day calendar__day--header">Jueves</div>
				<div class="calendar__day calendar__day--header">Viernes</div>
				<div class="calendar__day calendar__day--header">Sabado</div>`; // Genera la primer linea del calendario
	calendar.append(...days); // Envia los dias al html
	monthSpan.textContent = newDate.toLocaleString('es-ES', {
		month: 'long',
	});
}

// Sincronize the calendar with horariosData
function alignCalendar(horarios, days) {
	const daysArray = [];
	for (let i = 0; i < 7; i++) {
		daysArray.push(horarios.filter((n) => n.day == i));
	} // Divide the days in smaller groups

	let dayNum = 0; // 0-6 cont, trac the curren day, 0 to monday, 1 to tuesday, etc

	for (let i = 0; i < days.length; i++) {
		if (
			!days[i].classList.contains('not_a_day') &&
			!days[i].classList.contains('no_classes')
		) {
			// Verifies if the day exists
			const colors = daysArray[dayNum].map((d) => `#${d.color}`);
			if (colors.length === 1) {
				days[i].style.background = colors[0];
			} else if (colors.length > 1) {
				// build a horizontal gradient with abrupt transitions
				const segment = 100 / colors.length;
				const stops = colors
					.map(
						(c, idx) => `${c} ${idx * segment}% , ${c} ${(idx + 1) * segment}%`,
					)
					.join(', ');
				days[i].style.background = `linear-gradient(to right, ${stops})`;
			}
		}
		dayNum < 6 ? dayNum++ : (dayNum = 0); // Sunday -> Monday
	}
}

function setMateriaInfo(horarios) {
	// Render the names of the classes and his colors
	const materiasInfo = document.getElementById('materias__info');
	const materias = [];
	horarios.forEach((n) => {
		const obj = { name: n.name, color: n.color };
		const exists = materias.some(
			(m) => m.name === obj.name && m.color === obj.color,
		);
		if (!exists) {
			materias.push(obj); // Contains {class, color}
		}
	});

	materias.forEach((n) => {
		const span = document.createElement('span'); // Creates an span for the name and sets the color in --square-color

		span.classList.add('materia__info--item');
		span.textContent = n.name;
		span.style.setProperty('--square-color', `#${n.color}`);
		materiasInfo.append(span);
	});
}

function createDiv(className, html = '') {
	const el = document.createElement('div');
	el.className = className;
	el.innerHTML = html;
	return el;
}

export function verifyMonth() {
	// Disable the buttons when required
	if (month == currentMonth) {
		previousButton.classList += ' disabled';
		previousButton.disabled = true;
	} else if (month == 11) {
		nextButton.classList += ' disabled';
		nextButton.disabled = true;
	}
	if (month < 11) {
		nextButton.classList -= ' disabled';
		nextButton.disabled = false;
	}
	if (month > currentMonth) {
		previousButton.classList -= ' disabled';
		previousButton.disabled = false;
	}
}

function getHoraArgentina() {
	// 1. Obtener la hora UTC actual
	const ahora = new Date();

	// 2. Aplicar el desfase de -3 horas (en milisegundos)
	// 3 horas * 60 minutos * 60 segundos * 1000 milisegundos
	const offsetArgentina = -3;
	const horaArg = new Date(ahora.getTime() + offsetArgentina * 60 * 60 * 1000);

	return horaArg;
}

// Main

const fetchData = {
	horarios: await simpleFetch('http://localhost:3000/getHorarios'),
	holidays: await simpleFetch('http://localhost:3000/getHolidays'),
	events: await simpleFetch('http://localhost:3000/getEvents'),
	periods: await simpleFetch('http://localhost:3000/getPeriods'),
};

setCalendar(fetchData, true);
setMateriaInfo(fetchData.horarios);
displayDay(fetchData, date.getUTCDate(), month, currentYear);
setList(fetchData);

const nextButton = document.getElementById('month__button--ahead');

nextButton.addEventListener('click', () => {
	if (month < 11) {
		month += 1;
	} else {
		return;
	}
	setCalendar(fetchData, month == currentMonth);
	verifyMonth();
});

const previousButton = document.getElementById('month__button--back');

previousButton.addEventListener('click', () => {
	if (month > currentMonth) {
		month -= 1;
	} else {
		return;
	}
	setCalendar(fetchData, month == currentMonth);
	verifyMonth();
});
