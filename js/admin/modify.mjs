import { simpleFetch, simplePost } from '../fetch.mjs';

const modal = document.getElementById('inputModal');
const container = document.getElementById('inputModal--content');
const submit = document.getElementById('addSubmit');
const cancel = document.getElementById('cancelModal');
const errorText = modal.querySelector('.error');

let submitHandler = null;
cancel.addEventListener('click', () => closeModal());

const API_BASE = 'http://localhost:3000';

function convertTo12Hour(time24) {
	if (!time24) return '';
	const [hours, minutes] = time24.split(':');
	let hour = parseInt(hours);
	const ampm = hour >= 12 ? 'PM' : 'AM';
	hour = hour % 12 || 12;
	return `${hour}:${minutes} ${ampm}`;
}

function convertTo24Hour(time12) {
	if (!time12) return '';
	const match = time12.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/i);
	if (!match) return time12;
	let [, hour, minutes, ampm] = match;
	hour = parseInt(hour);
	if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
	if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
	return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

function numberToDay(num) {
	const days = [
		'Domingo',
		'Lunes',
		'Martes',
		'Miercoles',
		'Jueves',
		'Viernes',
		'Sabado',
	];
	return days[num];
}

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

function createLabel(text, element) {
	const label = document.createElement('label');
	label.classList.add('input-modal__label');
	label.textContent = text;
	label.append(element);
	return label;
}

function clearTables() {
	const modifyTable = document.getElementById('modify-table');
	if (modifyTable) modifyTable.innerHTML = '';
}

function createInput({
	type = 'text',
	placeholder = '',
	value = '',
	checked = false,
	min,
	max,
	step,
}) {
	const input = document.createElement('input');
	input.classList.add('input-modal');

	if (type === 'text' || type === 'date' || type === 'time')
		input.classList.add('input-modal--text');
	else if (type === 'color') input.classList.add('input-modal--color');
	else if (type === 'checkbox') input.classList.add('input-modal--checkbox');

	if (type === 'time') {
		input.type = 'text';
		input.placeholder = 'HH:MM AM/PM';
		input.value = convertTo12Hour(value);
	} else {
		input.type = type;
		if (placeholder) input.placeholder = placeholder;
		if (type === 'checkbox') input.checked = checked;
		else input.value = value;
	}

	if (min !== undefined) input.min = min;
	if (max !== undefined) input.max = max;
	if (step !== undefined) input.step = step;

	return input;
}

function createSelect(options, selected = 0) {
	const select = document.createElement('select');
	select.classList.add('input-modal', 'input-modal--select');
	options.forEach((n) => {
		const option = document.createElement('option');
		option.value = n.id;
		option.textContent = n.value;
		select.append(option);
	});
	select.value = selected;
	return select;
}

async function updateActiveState(
	user,
	originalActive,
	currentActive,
	id,
	table,
) {
	if (originalActive == currentActive) return;
	await simplePost(`${API_BASE}/toggleActive`, user, { id, table });
}

async function renderEditForm(user, fields, onSubmit) {
	container.innerHTML = '';

	submit.onclick = async () => {
		await onSubmit();
		closeModal();
	};

	fields.forEach((field) => container.append(field));
	openModal();
}

function createRow(cells, onClick) {
	const row = document.createElement('tr');
	row.classList.add('row');
	row.innerHTML = cells.map((cell) => `<td class="cell">${cell}</td>`).join('');
	row.addEventListener('click', () => {
		document.querySelector('.row--select')?.classList.remove('row--select');
		row.classList.add('row--select');
		onClick();
	});
	return row;
}

function createHeader(columns) {
	const header = document.createElement('tr');
	header.classList.add('row', 'row--header');
	header.innerHTML = columns
		.map((title) => `<th class="cell">${title}</th>`)
		.join('');
	return header;
}

async function editMateria(user, materia) {
	const name = createInput({ placeholder: 'name', value: materia.name });
	const color = createInput({ type: 'color', value: `#${materia.color}` });
	const active = createInput({ type: 'checkbox', checked: materia.active });

	await renderEditForm(
		user,
		[
			createLabel('Nombre:', name),
			createLabel('Color:', color),
			createLabel('Activo:', active),
		],
		async () => {
			await simplePost(`${API_BASE}/setMateria`, user, {
				id: materia.id,
				name: name.value,
				color: color.value.slice(1).toUpperCase(),
			});
			await updateActiveState(
				user,
				materia.active,
				active.checked,
				materia.id,
				'materias',
			);
			const updatedMaterias = await simpleFetch(`${API_BASE}/getMaterias`);
			modifyMateria(user, updatedMaterias);
		},
	);
}

async function editHorario(user, horario, materias) {
	const day = createSelect(
		[
			{ id: 0, value: 'Domingo' },
			{ id: 1, value: 'Lunes' },
			{ id: 2, value: 'Martes' },
			{ id: 3, value: 'Miercoles' },
			{ id: 4, value: 'Jueves' },
			{ id: 5, value: 'Viernes' },
			{ id: 6, value: 'Sabado' },
		],
		horario.day,
	);
	const materia = createSelect(
		materias.map((m) => {
			return { id: m.id, value: m.name };
		}),
		horario.materia_id,
	);
	const start = createInput({ type: 'time', value: horario.start });
	const finish = createInput({ type: 'time', value: horario.finish });
	const virtual = createInput({
		type: 'checkbox',
		checked: horario.is_virtual,
	});
	const active = createInput({ type: 'checkbox', checked: horario.active });

	await renderEditForm(
		user,
		[
			createLabel('Dia:', day),
			createLabel('Materia:', materia),
			createLabel('Entrada:', start),
			createLabel('Salida:', finish),
			createLabel('Virtual:', virtual),
			createLabel('Activo:', active),
		],
		async () => {
			await simplePost(`${API_BASE}/setHorario`, user, {
				id: horario.id,
				materia: materia.value,
				day: day.value,
				start: convertTo24Hour(start.value),
				finish: convertTo24Hour(finish.value),
				virtual: virtual.checked,
			});
			await updateActiveState(
				user,
				horario.active,
				active.checked,
				horario.id,
				'horarios',
			);
			await modifyHorario(user, materias);
		},
	);
}

async function editEvent(user, event, materias, types) {
	const materia = createSelect(
		materias.map((m) => {
			return { id: m.id, value: m.name };
		}),
		event.materia_id,
	);
	const type = createSelect(
		types.map((t) => {
			return { id: t.id, value: t.name };
		}),
		event.type,
	);
	const date = createInput({ type: 'date', value: event.date.slice(0, 10) });
	const details = createInput({ type: 'text', value: event.details });
	const active = createInput({ type: 'checkbox', checked: event.active });

	await renderEditForm(
		user,
		[
			createLabel('Materia:', materia),
			createLabel('Tipo:', type),
			createLabel('Fecha:', date),
			createLabel('Detalles:', details),
			createLabel('Activo:', active),
		],
		async () => {
			await simplePost(`${API_BASE}/setEvent`, user, {
				id: event.id,
				materia: materia.value,
				type: type.value,
				date: date.value,
				details: details.value,
			});
			await updateActiveState(
				user,
				event.active,
				active.checked,
				event.id,
				'events',
			);
			await modifyEvent(user, materias, types);
		},
	);
}

async function editHoliday(user, holiday) {
	const date = createInput({ type: 'date', value: holiday.date.slice(0, 10) });
	const type = createInput({ type: 'text', value: holiday.type });
	const details = createInput({ type: 'text', value: holiday.details });
	const active = createInput({ type: 'checkbox', checked: holiday.active });

	await renderEditForm(
		user,
		[
			createLabel('Fecha:', date),
			createLabel('Tipo:', type),
			createLabel('Detalles:', details),
			createLabel('Activo:', active),
		],
		async () => {
			await simplePost(`${API_BASE}/setHoliday`, user, {
				id: holiday.id,
				date: date.value,
				type: type.value,
				details: details.value,
			});
			await updateActiveState(
				user,
				holiday.active,
				active.checked,
				holiday.id,
				'feriados',
			);
			await modifyHoliday(user);
		},
	);
}

async function editPeriod(user, period, types) {
	const type = createSelect(
		types.map((t) => {
			return { id: t.id, value: t.name };
		}),
		period.type,
		1,
	);
	const start = createInput({ type: 'date', value: period.start.slice(0, 10) });
	const end = createInput({ type: 'date', value: period.end.slice(0, 10) });
	const details = createInput({ type: 'text', value: period.details });
	const suspension = createInput({
		type: 'checkbox',
		checked: period.suspension,
	});
	const active = createInput({ type: 'checkbox', checked: period.active });

	await renderEditForm(
		user,
		[
			createLabel('Tipo:', type),
			createLabel('Principio:', start),
			createLabel('Final:', end),
			createLabel('Detalles:', details),
			createLabel('Suspension de clases:', suspension),
			createLabel('Activo:', active),
		],
		async () => {
			await simplePost(`${API_BASE}/setPeriod`, user, {
				id: period.id,
				type: type.value,
				details: details.value,
				start: start.value,
				end: end.value,
				suspension: suspension.checked,
			});
			await updateActiveState(
				user,
				period.active,
				active.checked,
				period.id,
				'periods',
			);
			await modifyPeriod(user, types);
		},
	);
}

export function modifyMateria(user, materias) {
	clearTables();

	const modifyTable = document.getElementById('modify-table');
	if (!modifyTable) return;

	const header = createHeader(['Id', 'Name', 'Color', 'Active']);
	const rows = materias.map((m) =>
		createRow([m.id, m.name, m.color, m.active], () => editMateria(user, m)),
	);
	rows.forEach((r) => {
		const child = r.children[2];
		child.style.backgroundColor = `#${child.textContent}`;
	});

	modifyTable.append(header, ...rows);
}

export async function modifyHorario(user, materias) {
	clearTables();

	const horarios = await simpleFetch(`${API_BASE}/getHorariosPure`);
	const modifyTable = document.getElementById('modify-table');
	if (!modifyTable) return;

	const header = createHeader([
		'Id',
		'Day',
		'Materia',
		'Start',
		'Finish',
		'Virtual',
		'Active',
	]);
	const rows = horarios.map((h) =>
		createRow(
			[
				h.id,
				numberToDay(h.day),
				h.materia,
				h.start,
				h.finish,
				h.is_virtual,
				h.active,
			],
			() => editHorario(user, h, materias),
		),
	);

	modifyTable.append(header, ...rows);
}

export async function modifyEvent(user, materias, types) {
	clearTables();

	const events = await simpleFetch(`${API_BASE}/getEventsPure`);
	const modifyTable = document.getElementById('modify-table');
	if (!modifyTable) return;

	const header = createHeader([
		'Id',
		'Materia',
		'Type',
		'Date',
		'Details',
		'Active',
	]);
	const rows = events.map((e) =>
		createRow(
			[
				e.id,
				e.materia_name,
				e.type_name,
				e.date.slice(0, 10),
				e.details,
				e.active,
			],
			() => editEvent(user, e, materias, types),
		),
	);

	modifyTable.append(header, ...rows);
}

export async function modifyHoliday(user) {
	clearTables();

	const holidays = await simpleFetch(`${API_BASE}/getAllHolidays`);
	const modifyTable = document.getElementById('modify-table');
	if (!modifyTable) return;

	const header = createHeader(['Id', 'Date', 'Type', 'Details', 'Active']);
	const rows = holidays.map((h) =>
		createRow([h.id, h.date.slice(0, 10), h.type, h.details, h.active], () =>
			editHoliday(user, h),
		),
	);

	modifyTable.append(header, ...rows);
}

export async function modifyPeriod(user, types) {
	clearTables();

	const periods = await simpleFetch(`${API_BASE}/getAllPeriods`);
	const modifyTable = document.getElementById('modify-table');
	if (!modifyTable) return;

	const header = createHeader([
		'Id',
		'Start',
		'End',
		'Details',
		'Suspension',
		'Active',
	]);
	const rows = periods.map((p) =>
		createRow(
			[
				p.id,
				p.start.slice(0, 10),
				p.end.slice(0, 10),
				p.details,
				p.suspension,
				p.active,
			],
			() => editPeriod(user, p, types),
		),
	);

	modifyTable.append(header, ...rows);
}
