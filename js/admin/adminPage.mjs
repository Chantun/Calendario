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

	const addOption = document.getElementById('add-options');
	const addContent = document.getElementById('add-content');

	addOption.addEventListener('change', (e) => {
		addContent.innerHTML = '';
		if (e.target.value == 'materia') {
			addSection.addMateria(user);
		} else if (e.target.value == 'horario') {
			addSection.addHorario(user, materias);
		} else if (e.target.value == 'event') {
			const response = addSection.addEvent(user, materias, types);
			addContent.append(response[0], response[1]);
		} else if (e.target.value == 'period') {
			const response = addSection.addPeriod(user, types);
			addContent.append(response[0], response[1]);
		} else if (e.target.value == 'holiday') {
			const response = addSection.addHoliday(user, types);
			addContent.append(response[0], response[1]);
		} else if (e.target.value == 'backup') {
			const response = addSection.addBackup(user, types);
			addContent.append(response[0], response[1]);
		}
	});

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
