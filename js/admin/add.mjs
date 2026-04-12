import { simplePost } from '../fetch.mjs';
const modal = document.getElementById('inputModal');
const container = document.getElementById('inputModal--content');
const submit = document.getElementById('addSubmit');

export function addMateria(user) {
	const nameInput = document.createElement('input');
	nameInput.classList.add('input-modal', 'input-modal--text');
	nameInput.placeholder = 'Matematicas';
	const colorInput = document.createElement('input');
	colorInput.classList.add('input-modal', 'input-modal--color');
	colorInput.type = 'color';

	const nameLabel = document.createElement('label');
	nameLabel.classList.add('input-modal__label');
	nameLabel.textContent = 'Nombre:';
	nameLabel.append(nameInput);
	const colorLabel = document.createElement('label');
	colorLabel.classList.add('input-modal__label');
	colorLabel.textContent = 'Color:';
	colorLabel.append(colorInput);

	container.append(nameLabel, colorLabel);
	modal.style.display = 'block';

	submit.onclick = async () => {
		if (nameInput.value && colorInput.value) {
			await simplePost('http://localhost:3000/addMateria', user, {
				name: nameInput.value,
				color: colorInput.value.slice(1).toUpperCase(),
			});
			modal.style.display = 'none';
		} else {
			modal.querySelector('.error').textContent =
				'Se deben ingresar todos los datos solicitados';
		}
	};
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
	const virtual = document.createElement('input');
	virtual.type = 'checkbox';

	const dayLabel = document.createElement('label');
	dayLabel.classList.add('input-modal__label');
	dayLabel.textContent = 'Dia:';
	dayLabel.append(selectDay);
	const materiaLabel = document.createElement('label');
	materiaLabel.classList.add('input-modal__label');
	materiaLabel.textContent = 'materia:';
	materiaLabel.append(selectMateria);
	const startLabel = document.createElement('label');
	startLabel.classList.add('input-modal__label');
	startLabel.textContent = 'Inicio:';
	startLabel.append(start);
	const finishLabel = document.createElement('label');
	finishLabel.classList.add('input-modal__label');
	finishLabel.textContent = 'Final:';
	finishLabel.append(finish);
	const virtualLabel = document.createElement('label');
	virtualLabel.classList.add('input-modal__label');
	virtualLabel.textContent = 'Virtual:';
	virtualLabel.append(virtual);

	container.append(
		dayLabel,
		materiaLabel,
		startLabel,
		finishLabel,
		virtualLabel,
	);
	modal.style.display = 'block';

	submit.onclick = async () => {
		if (
			selectMateria.value &&
			selectDay.value &&
			start.value &&
			finish.value &&
			virtual.checked != null
		) {
			await simplePost('http://localhost:3000/addHorario', user, {
				materia: selectMateria.value,
				day: selectDay.value,
				start: start.value,
				finish: finish.value,
				virtual: virtual.checked,
			});
			modal.style.display = 'none';
		} else {
			modal.querySelector('.error').textContent =
				'Se deben ingresar todos los datos solicitados';
		}
	};
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

	const details = document.createElement('input');

	const rowContainer = document.createElement('div');
	rowContainer.classList.add('flex-row');

	rowContainer.append(selectMateria, selectType, date, details);

	submit.removeEventListener();
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/addEvent', user, {
			materia: selectMateria.value,
			type: selectType.value,
			date: date.value,
			details: details.value,
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

	submit.removeEventListener();
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

	submit.removeEventListener();
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/addHoliday', user, {
			type: type.value,
			date: date.value,
			details: details.value,
		});
	});

	return [rowContainer, submit];
}

export function addBackup(user) {
	const name = document.createElement('input');
	name.placeholder = 'name';

	submit.removeEventListener();
	submit.addEventListener('click', async () => {
		await simplePost('http://localhost:3000/createBackup', user, {
			name: name.value,
		});
	});

	return [name, submit];
}
