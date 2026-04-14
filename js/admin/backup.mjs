import { simplePost, simpleFetch } from '../fetch.mjs';

const API_BASE = 'http://localhost:3000';

const modal = document.getElementById('backupModal');
const container = document.getElementById('backupModal--content');
const table = document.getElementById('backup-table');
const recovery = document.getElementById('useBackup');
const deleteButton = document.getElementById('deleteBackup');
const cancel = document.getElementById('cancel-backup');
const errorText = modal.querySelector('.error');

let submitHandler = null;
cancel.addEventListener('click', () => closeModal());

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
	deleteButton.style.display = 'none';
}

export async function backupTable(user) {
	const backups = await simpleFetch(`${API_BASE}/getBackups`);

	table.innerHTML = '';
	container.innerHTML = '';

	const header = document.createElement('tr');
	header.classList.add('row', 'row--header');
	header.innerHTML =
		'<th class="cell">Name</th><th class="cell">Date</th><th class="cell">Time</th><th class="cell">Temp</th>';

	const rows = backups.map((b) => {
		const tr = document.createElement('tr');
		tr.classList.add('row');
		tr.innerHTML = `<td class="cell">${b.name}</td><td class="cell">${b.date}</td><td class="cell">${b.time}</td><td class="cell">${b.temporary}</td>`;

		tr.addEventListener('click', () => {
			container.innerHTML = '';
			const title = document.createElement('h3');
			title.textContent = b.name;

			recovery.onclick = async () => {
				await simplePost(`${API_BASE}/recovery`, user, {
					name: b.name.substring(0, b.name.length - 4),
				});
				backupTable(user);
				closeModal();
			};

			container.append(title);
			if (!b.temporary) {
				deleteButton.onclick = async () => {
					await simplePost(`${API_BASE}/deleteBackup`, user, { name: b.name });
					backupTable(user);
					closeModal();
				};
				deleteButton.style.display = 'block';
			}

			openModal();
		});
		return tr;
	});

	table.append(header, ...rows);
}
