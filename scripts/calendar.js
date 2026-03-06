const date = new Date();
let month = date.getMonth();
const currentMonth = month;
const currentYear = date.getFullYear();

const calendar = document.getElementById('calendar');
const monthSpan = document.getElementById('month__name');
let horariosData = []; // Variable global para almacenar los horarios
let holidaysData = [];
let eventsData = [];

function getHolidaysByMonth() {
	const aux = holidaysData.filter((n) => {
		const date = new Date(n.date);
		return date.getMonth() == month;
	});
	const aux2 = aux.map((n) => {
		return {
			day: new Date(n.date).getDate(),
			type: n.type,
			details: n.details,
		};
	});
	return aux2;
}

function getEventsByMonth() {
	const aux = eventsData.filter((n) => {
		const date = new Date(n.date);
		return date.getMonth() == month;
	});
	const aux2 = aux.map((n) => {
		return {
			day: new Date(n.date).getDate(),
			type: n.type,
			name: n.name,
		};
	});
	return aux2;
}

function eventToClass(num) {
	switch (num) {
		case 1:
			return 'icon_paro';
		case 2:
			return 'icon_expo';
		case 3:
			return 'icon_exam';
		case 4:
			return 'icon_recu';
	}
}

// Sincronize the calendar with horariosData
function alignCalendar(days) {
	const daysArray = [];
	for (i = 0; i < 7; i++) {
		daysArray.push(horariosData.filter((n) => n.day == i));
	} // Divide the days in smaller groups

	let dayNum = 0; // 0-6 cont, trac the curren day, 0 to monday, 1 to tuesday, etc

	for (i = 0; i < days.length; i++) {
		if (
			!days[i].classList.contains('not_a_day') &
			!days[i].classList.contains('no_classes')
		) {
			// Verifies if the day exists
			const colors = daysArray[dayNum].map((data) => `#${data.color}`);
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

function setMateriaInfo() {
	// Render the names of the classes and his colors
	const materiasInfo = document.getElementById('materias__info');
	const materias = [];
	horariosData.forEach((n) => {
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

function setCalendar() {
	// Get days info
	const info = {
		currentDay: date.getDate(),
		firstDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
		lastDay: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
	};

	// Array to store the day's elements
	const days = [];

	const holidays = getHolidaysByMonth();
	const events = getEventsByMonth();

	// Fill the array with elements
	for (let i = 0; i < info.firstDay; i++) {
		days.push(
			Object.assign(document.createElement('div'), {
				className: 'calendar__day not_a_day',
				textContent: '',
			}),
		); // If the month didn't start at sunday
	}
	for (let i = 1; i <= info.lastDay; i++) {
		const day = Object.assign(document.createElement('div'), {
			className:
				i == info.currentDay
					? 'calendar__day calendar__day--current'
					: i < info.currentDay
						? 'calendar__day'
						: 'calendar__day calendar__day--upcoming',
			innerHTML:
				i < info.currentDay
					? `<div class="calendar__day--past"></div><span class="calendar__day--num">${i}</span>`
					: `<span class="calendar__day--num">${i}</span>`,
		});

		day.innerHTML += `<div class="icon__container"></div>`;

		if (holidays.some((h) => h.day === i)) {
			day.querySelector('.icon__container').innerHTML +=
				`<span class="icon_before icon_holiday"></span>`;
			day.classList.add('no_classes');
		}
		if (events.some((n) => n.day === i)) {
			const eventDay = events.filter((n) => n.day === i);
			const container = day.querySelector('.icon__container');
			eventDay.forEach((n) => {
				container.innerHTML += `<span class="icon_before ${eventToClass(n.type)}">`;
			});
		}

		day.addEventListener('click', () => {
			displayDay(i);
		});

		days.push(day);
	}
	while (days.length < 42) {
		days.push(
			Object.assign(document.createElement('div'), {
				className: 'calendar__day not_a_day',
				textContent: '',
			}),
		); // Fill the rest of the calendar
	}

	alignCalendar(days);

	calendar.innerHTML = `<div class="calendar__day calendar__day--header">Domingo</div>
				<div class="calendar__day calendar__day--header">Lunes</div>
				<div class="calendar__day calendar__day--header">Martes</div>
				<div class="calendar__day calendar__day--header">Miercoles</div>
				<div class="calendar__day calendar__day--header">Jueves</div>
				<div class="calendar__day calendar__day--header">Viernes</div>
				<div class="calendar__day calendar__day--header">Sabado</div>`; // Genera la primer linea del calendario
	calendar.append(...days); // Send the day's elements to the calendar in the html
	monthSpan.textContent = date.toLocaleString('es-ES', {
		month: 'long',
	});
}

function changeMonth(month) {
	// The same, but it executets when the month changes
	if (month == currentMonth) {
		setCalendar();
		return;
	}

	const date = new Date(currentYear, month);
	const info = {
		firstDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
		lastDay: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
	};

	const days = [];

	const holidays = getHolidaysByMonth();
	const events = getEventsByMonth();

	for (let i = 0; i < info.firstDay; i++) {
		days.push(
			Object.assign(document.createElement('div'), {
				className: 'calendar__day not_a_day',
				textContent: '',
			}),
		); // If the month didn't start at sunday
	}
	for (let i = 1; i <= info.lastDay; i++) {
		const day = Object.assign(document.createElement('div'), {
			className: 'calendar__day calendar__day--upcoming',
			innerHTML: `<span class="calendar__day--num">${i}</span>`,
		});

		day.innerHTML += `<div class="icon__container"></div>`;

		if (holidays.some((h) => h.day === i)) {
			day.querySelector('.icon__container').innerHTML +=
				`<span class="icon_before icon_holiday"></span>`;
			day.classList.add('no_classes');
		}
		if (events.some((n) => n.day === i)) {
			const eventDay = events.filter((n) => n.day === i);
			const container = day.querySelector('.icon__container');
			eventDay.forEach((n) => {
				container.innerHTML += `<span class="icon_before ${eventToClass(n.type)}">`;
			});
		}

		day.addEventListener('click', () => {
			displayDay(i);
		});

		days.push(day);
	}
	while (days.length < 42) {
		days.push(
			Object.assign(document.createElement('div'), {
				className: 'calendar__day not_a_day',
				textContent: '',
			}),
		); // Fill the rest of the calendar
	}

	alignCalendar(days);

	calendar.innerHTML = `<div class="calendar__day calendar__day--header">Domingo</div>
				<div class="calendar__day calendar__day--header">Lunes</div>
				<div class="calendar__day calendar__day--header">Martes</div>
				<div class="calendar__day calendar__day--header">Miercoles</div>
				<div class="calendar__day calendar__day--header">Jueves</div>
				<div class="calendar__day calendar__day--header">Viernes</div>
				<div class="calendar__day calendar__day--header">Sabado</div>`; // Genera la primer linea del calendario
	calendar.append(...days);
	monthSpan.textContent = date.toLocaleString('es-ES', {
		month: 'long',
	});
}

function verifyMonth() {
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

function displayDay(d) {
	const container = document.getElementById('dayInfo__section');
	container.innerHTML = '';
	const date = new Date(currentYear, month, d);
	const days = horariosData.filter((n) => n.day === date.getDay());

	const title = document.createElement('h2');
	title.classList.add('dayInfo__title');
	title.textContent = `${d}-${month + 1}-${currentYear}`;
	container.append(title);

	const holiday = holidaysData.find(
		(h) => new Date(h.date).toString() == date.toString(),
	);
	const events = eventsData.filter(
		(n) => new Date(n.date).toString() == date.toString(),
	);

	if (!holiday) {
		days.forEach((n) => {
			const div = document.createElement('div');
			div.style.backgroundColor = `#${n.color}`;
			div.classList.add('dayInfo__line');
			div.innerHTML = `<span class='dayInfo__name'> ${n.name}</span><span class='dayInfo__hour'>${n.start.split(':', 2).join(':')} - ${n.finish.split(':', 2).join(':')}</span>`;
			events.forEach((m) => {
				if (n.name == m.name) {
					const iconSpan = document.createElement('span');
					iconSpan.classList.add('icon_before');
					iconSpan.classList.add(eventToClass(m.type));
					div.querySelector('.dayInfo__name').prepend(iconSpan);
				}
			});
			container.append(div);
		});
	} else {
		const div = document.createElement('div');
		div.style.backgroundColor = `#D4D4D4`;
		div.classList.add('dayInfo__line');
		div.innerHTML = `<span class='icon_before icon_holiday dayInfo__name'> ${holiday.details}</span><span class='dayInfo__hour'>${holiday.type}</span>`;
		container.append(div);
	}
}

// Main

fetch('http://localhost:3000/getHorarios') // Fetch to the server (send all the data in one)
	.then((response) => {
		if (!response.ok) {
			throw new Error('Error en la respuesta de la API');
		}
		return response.json();
	})
	.then((data) => {
		horariosData = data;
		fetch('http://localhost:3000/getHolidays')
			.then((response) => {
				if (!response.ok) {
					throw new Error('Error en la respuesta de la API');
				}
				return response.json();
			})
			.then((data) => {
				holidaysData = data;
				fetch('http://localhost:3000/getEvents')
					.then((response) => {
						if (!response.ok) {
							throw new Error('Error en la respuesta de la API');
						}
						return response.json();
					})
					.then((data) => {
						eventsData = data;
						setCalendar();
						setMateriaInfo();
					})
					.catch((error) => {
						console.error('Error:', error);
					});
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	})
	.catch((error) => {
		console.error('Error:', error);
	});

const nextButton = document.getElementById('month__button--ahead');

nextButton.addEventListener('click', () => {
	if (month < 11) {
		month += 1;
	} else {
		return;
	}

	changeMonth(month);
	verifyMonth();
});

const previousButton = document.getElementById('month__button--back');

previousButton.addEventListener('click', () => {
	if (month > currentMonth) {
		month -= 1;
	} else {
		return;
	}

	changeMonth(month);
	verifyMonth();
});
