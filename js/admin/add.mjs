import { simplePost } from '../fetch.mjs';
const modal = document.getElementById('inputModal');
const container = document.getElementById('inputModal--content');
const submit = document.getElementById('addSubmit');
const errorText = modal.querySelector('.error');

let submitHandler = null;

function clearModal() {
	container.innerHTML = '';
	errorText.textContent = '';
}

function openModal() {
	modal.style.display = 'block';
}

function closeModal() {
	modal.style.display = 'none';
	clearModal();
	if (submitHandler) {
		submit.removeEventListener('click', submitHandler);
		submitHandler = null;
	}
}

function setSubmitHandler(handler) {
	if (submitHandler) {
		submit.removeEventListener('click', submitHandler);
	}

	submitHandler = async (event) => {
		event.preventDefault();
		await handler();
	};

	submit.addEventListener('click', submitHandler);
}

function createLabel(text, element) {
	const label = document.createElement('label');
	label.classList.add('input-modal__label');
	label.textContent = text;
	label.append(element);
	return label;
}

function createTextInput(placeholder = '') {
	const input = document.createElement('input');
	input.type = 'text';
	input.classList.add('input-modal', 'input-modal--text');
	if (placeholder) input.placeholder = placeholder;
	return input;
}

function createInput(type, placeholder = '') {
	const input = document.createElement('input');
	input.type = type;
	input.classList.add('input-modal');
	if (type === 'text' || type === 'date' || type === 'time') {
		input.classList.add('input-modal--text');
	}
	if (placeholder) input.placeholder = placeholder;
	return input;
}

function createSelect(options) {
	const select = document.createElement('select');
	options.forEach(({ value, label }) => {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = label;
		select.append(option);
	});
	return select;
}

function createOptionsFromList(list) {
	return list.map((item) => ({ value: item.id, label: item.name }));
}

export function addMateria(user) {
	const nameInput = createTextInput('Matematicas');
	const colorInput = createInput('color');
	colorInput.classList.add('input-modal--color');

	container.append(
		createLabel('Nombre:', nameInput),
		createLabel('Color:', colorInput),
	);
	openModal();

	setSubmitHandler(async () => {
		if (!nameInput.value || !colorInput.value) {
			errorText.textContent = 'Se deben ingresar todos los datos solicitados';
			return;
		}

		await simplePost('http://localhost:3000/addMateria', user, {
			name: nameInput.value,
			color: colorInput.value.slice(1).toUpperCase(),
		});
		closeModal();
	});
}

export function addHorario(user, materias) {
	const selectDay = createSelect([
		{ value: '0', label: 'Domingo' },
		{ value: '1', label: 'Lunes' },
		{ value: '2', label: 'Martes' },
		{ value: '3', label: 'Miercoles' },
		{ value: '4', label: 'Jueves' },
		{ value: '5', label: 'Viernes' },
		{ value: '6', label: 'Sabado' },
	]);
	const selectMateria = createSelect(createOptionsFromList(materias));
	const start = createInput('time');
	const finish = createInput('time');
	const virtual = createInput('checkbox');

	container.append(
		createLabel('Dia:', selectDay),
		createLabel('Materia:', selectMateria),
		createLabel('Inicio:', start),
		createLabel('Final:', finish),
		createLabel('Virtual:', virtual),
	);
	openModal();

	setSubmitHandler(async () => {
		if (
			!selectMateria.value ||
			!selectDay.value ||
			!start.value ||
			!finish.value
		) {
			errorText.textContent = 'Se deben ingresar todos los datos solicitados';
			return;
		}

		await simplePost('http://localhost:3000/addHorario', user, {
			materia: selectMateria.value,
			day: selectDay.value,
			start: start.value,
			finish: finish.value,
			virtual: virtual.checked,
		});
		closeModal();
	});
}

export function addEvent(user, materias, types) {
	const selectMateria = createSelect(createOptionsFromList(materias));
	const selectType = createSelect(createOptionsFromList(types));
	const date = createInput('date');
	const details = createTextInput('Detalles');

	container.append(
		createLabel('Materia:', selectMateria),
		createLabel('Tipo:', selectType),
		createLabel('Fecha:', date),
		createLabel('Detalles:', details),
	);
	openModal();

	setSubmitHandler(async () => {
		if (!selectMateria.value || !selectType.value || !date.value) {
			errorText.textContent = 'Se deben ingresar todos los datos solicitados';
			return;
		}

		await simplePost('http://localhost:3000/addEvent', user, {
			materia: selectMateria.value,
			type: selectType.value,
			date: date.value,
			details: details.value,
		});
		closeModal();
	});
}

export function addPeriod(user, types) {
	const selectType = createSelect(createOptionsFromList(types));
	const start = createInput('date');
	const end = createInput('date');
	const details = createTextInput('Detalles');
	const suspension = createInput('checkbox');

	container.append(
		createLabel('Tipo:', selectType),
		createLabel('Inicio:', start),
		createLabel('Fin:', end),
		createLabel('Detalles:', details),
		createLabel('Suspension:', suspension),
	);
	openModal();

	setSubmitHandler(async () => {
		if (!selectType.value || !start.value || !end.value) {
			errorText.textContent = 'Se deben ingresar todos los datos solicitados';
			return;
		}

		await simplePost('http://localhost:3000/addPeriod', user, {
			type: selectType.value,
			start: start.value,
			end: end.value,
			details: details.value,
			suspension: suspension.checked,
		});
		closeModal();
	});
}

export function addHoliday(user) {
	const date = createInput('date');
	const type = createTextInput('Tipo');
	const details = createTextInput('Detalles');

	container.append(
		createLabel('Fecha:', date),
		createLabel('Tipo:', type),
		createLabel('Detalles:', details),
	);
	openModal();

	setSubmitHandler(async () => {
		if (!type.value || !date.value) {
			errorText.textContent = 'Se deben ingresar todos los datos solicitados';
			return;
		}

		await simplePost('http://localhost:3000/addHoliday', user, {
			type: type.value,
			date: date.value,
			details: details.value,
		});
		closeModal();
	});
}

export function addBackup(user) {
	const name = createTextInput('Nombre');

	container.append(createLabel('Nombre:', name));
	openModal();

	setSubmitHandler(async () => {
		if (!name.value) {
			errorText.textContent = 'Se deben ingresar todos los datos solicitados';
			return;
		}

		await simplePost('http://localhost:3000/createBackup', user, {
			name: name.value,
		});
		closeModal();
	});
}
