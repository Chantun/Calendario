import { simplePost } from '../fetch.mjs';

export function addMateria(user) {
	const nameInput = document.createElement('input');
	nameInput.type = 'text';
	nameInput.style.flex = '1';
	const colorInput = document.createElement('input');
	colorInput.type = 'color';

	const rowContainer = document.createElement('div');
	rowContainer.classList.add('flex-row');

	rowContainer.append(nameInput, colorInput);

	const submit = document.createElement('button');
	submit.textContent = 'Enviar';
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/addMateria', user, {
			name: nameInput.value,
			color: colorInput.value.slice(1).toUpperCase(),
		});
	});

	return [rowContainer, submit];
}

export function addHorario(user, materias) {
	const selectDay = document.createElement('select');
	selectDay.innerHTML = `<option value="0">Domingo</option>
	<option value="1">Lunes</option>
	<option value="2">Martes</option>
	<option value="3">Miercoles</option>
	<option value="4">Jueves</option>
	<option value="5">Viernes</option>
	<option value="6">Sabado</option>`;

	const selectMateria = document.createElement('select');
	materias.forEach((m) => {
		selectMateria.innerHTML += `<option value="${m.id}">${m.name}</option>`;
	});

	const start = document.createElement('input');
	start.type = 'time';
	const finish = document.createElement('input');
	finish.type = 'time';

	const rowContainer = document.createElement('div');
	rowContainer.classList.add('flex-row');

	rowContainer.append(selectDay, selectMateria, start, finish);

	const submit = document.createElement('button');
	submit.textContent = 'Enviar';
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/addHorario', user, {
			materia: selectMateria.value,
			day: selectDay.value,
			start: start.value,
			finish: finish.value,
		});
	});

	return [rowContainer, submit];
}

export function addEvent(user, materias, types) {
	const selectMateria = document.createElement('select');
	materias.forEach((m) => {
		selectMateria.innerHTML += `<option value="${m.id}">${m.name}</option>`;
	});

	const selectType = document.createElement('select');
	types.forEach((t) => {
		selectType.innerHTML += `<option value="${t.id}">${t.name}</option>`;
	});

	const date = document.createElement('input');
	date.type = 'date';

	const rowContainer = document.createElement('div');
	rowContainer.classList.add('flex-row');

	rowContainer.append(selectMateria, selectType, date);

	const submit = document.createElement('button');
	submit.textContent = 'Enviar';
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/addEvent', user, {
			materia: selectMateria.value,
			type: selectType.value,
			date: date.value,
		});
	});

	return [rowContainer, submit];
}

export function addPeriod(user, types) {
	const selectType = document.createElement('select');
	types.forEach((t) => {
		selectType.innerHTML += `<option value="${t.id}">${t.name}</option>`;
	});

	const start = document.createElement('input');
	start.type = 'date';
	const end = document.createElement('input');
	end.type = 'date';

	const details = document.createElement('input');
	details.type = 'text';

	const suspension = document.createElement('input');
	suspension.type = 'checkbox';

	const rowContainer = document.createElement('div');
	rowContainer.classList.add('flex-row');

	rowContainer.append(selectType, start, end, details, suspension);

	const submit = document.createElement('button');
	submit.textContent = 'Enviar';
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/addPeriod', user, {
			type: selectType.value,
			start: start.value,
			end: end.value,
			details: details.value,
			suspension: suspension.checked,
		});
	});

	return [rowContainer, submit];
}

export function addHoliday(user) {
	const date = document.createElement('input');
	date.type = 'date';

	const type = document.createElement('input');
	type.type = 'text';
	type.placeholder = 'type';

	const details = document.createElement('input');
	details.type = 'text';
	details.placeholder = 'details';

	const rowContainer = document.createElement('div');
	rowContainer.classList.add('flex-row');

	rowContainer.append(date, type, details);

	const submit = document.createElement('button');
	submit.textContent = 'Enviar';
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/addHoliday', user, {
			type: type.value,
			date: date.value,
			details: details.value,
		});
	});

	return [rowContainer, submit];
}
