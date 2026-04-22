import { simpleFetch } from '../fetch.mjs';
import * as addSection from './add.mjs';
import * as modifySection from './modify.mjs';
import { adminTable } from './admins.mjs';
import { backupTable } from './backup.mjs';

export default async function mainPage(user) {
	const materias = await simpleFetch('http://localhost:3000/getMaterias');
	const types = await simpleFetch('http://localhost:3000/getTypes');

	const main = document.getElementById('main');
	main.style.display = 'block';

	document
		.getElementById('addMateria')
		.addEventListener('click', () => addSection.addMateria(user));
	document
		.getElementById('addHorario')
		.addEventListener('click', () => addSection.addHorario(user, materias));
	document
		.getElementById('addEvent')
		.addEventListener('click', () =>
			addSection.addEvent(user, materias, types),
		);
	document
		.getElementById('addPeriod')
		.addEventListener('click', () => addSection.addPeriod(user, types));
	document
		.getElementById('addHoliday')
		.addEventListener('click', () => addSection.addHoliday(user));
	document
		.getElementById('addBackup')
		.addEventListener('click', () => addSection.addBackup(user));

	const modifyOption = document.getElementById('modify-options');

	modifyOption.addEventListener('change', (e) => {
		if (e.target.value == 'materia') {
			modifySection.modifyMateria(user, materias);
		} else if (e.target.value == 'horario') {
			modifySection.modifyHorario(user, materias);
		} else if (e.target.value == 'event') {
			modifySection.modifyEvent(user, materias, types);
		} else if (e.target.value == 'holiday') {
			modifySection.modifyHoliday(user);
		} else if (e.target.value == 'period') {
			modifySection.modifyPeriod(user, types);
		}
	});

	adminTable(user);
	backupTable(user);
}
