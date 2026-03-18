import { simpleFetch } from '../fetch.mjs';
import * as addSection from './add.mjs';

export default async function mainPage(user) {
	const materias = await simpleFetch('http://localhost:3000/getMaterias');
	const types = await simpleFetch('http://localhost:3000/getTypes');

	const main = document.getElementById('main');
	main.style.display = 'block';

	const select = document.getElementById('add-options');
	const addContent = document.getElementById('add-content');

	select.addEventListener('change', (e) => {
		addContent.innerHTML = '';
		if (e.target.value == 'materia') {
			const response = addSection.addMateria(user);
			addContent.append(response[0], response[1]);
		} else if (e.target.value == 'horario') {
			const response = addSection.addHorario(user, materias);
			addContent.append(response[0], response[1]);
		} else if (e.target.value == 'event') {
			const response = addSection.addEvent(user, materias, types);
			addContent.append(response[0], response[1]);
		} else if (e.target.value == 'period') {
			const response = addSection.addPeriod(user, types);
			addContent.append(response[0], response[1]);
		} else if (e.target.value == 'holiday') {
			const response = addSection.addHoliday(user, types);
			addContent.append(response[0], response[1]);
		}
	});
}
