const date = new Date();
let month = date.getMonth();
const currentMonth = month;
const currentYear = date.getFullYear();

const calendar = document.getElementById('calendar');
const monthSpan = document.getElementById('month__name');
let horariosData = []; // Variable global para almacenar los horarios

// Sincronize the calendar with horariosData
function alignCalendar(days) {
	const daysArray = [];
	for (i = 0; i < 7; i++) {
		daysArray.push(horariosData.filter((n) => n.day == i));
	} // Divide the days in smaller groups

	let dayNum = 0; // 0-6 cont, trac the curren day, 0 to monday, 1 to tuesday, etc

	for (i = 0; i < days.length; i++) {
		if (!days[i].classList.contains('not_a_day')) {
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
		days.push(
			Object.assign(document.createElement('div'), {
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
			}),
		);
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
	// The samme, but it executets when the month changes
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

		setCalendar();
		setMateriaInfo();
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
