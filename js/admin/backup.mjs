import { simplePost, simpleFetch } from '../fetch.mjs';

const API_BASE = 'http://localhost:3000';

export async function backupTable(user) {
	const backups = await simpleFetch(`${API_BASE}/getBackups`);
	const table = document.getElementById('backup-table');
	const useBackup = document.getElementById('use-backup');

	table.innerHTML = '';
	useBackup.innerHTML = '';

	const header = document.createElement('tr');
	header.classList.add('row', 'row--header');
	header.innerHTML =
		'<th class="cell">Name</th><th class="cell">Date</th><th class="cell">Time</th><th class="cell">Temp</th>';

	const rows = backups.map((b) => {
		const tr = document.createElement('tr');
		tr.classList.add('row');
		tr.innerHTML = `<td class="cell">${b.name}</td><td class="cell">${b.date}</td><td class="cell">${b.time}</td><td class="cell">${b.temporary}</td>`;

		tr.addEventListener('click', () => {
			useBackup.innerHTML = '';
			const title = document.createElement('h3');
			title.textContent = b.name;

			const recovery = document.createElement('button');
			recovery.textContent = 'Cargar';
			recovery.addEventListener('click', async () => {
				await simplePost(`${API_BASE}/recovery`, user, {
					name: b.name.substring(0, b.name.length - 4),
				});
				backupTable(user);
			});

			useBackup.append(title, recovery);
			if (!b.temporary) {
				const deleteButton = document.createElement('button');
				deleteButton.textContent = 'Borrar';
				deleteButton.addEventListener('click', async () => {
					await simplePost(`${API_BASE}/deleteBackup`, user, { name: b.name });
					backupTable(user);
				});
				useBackup.append(deleteButton);
			}
		});
		return tr;
	});

	table.append(header, ...rows);
}
