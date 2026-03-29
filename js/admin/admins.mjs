import { simplePost } from '../fetch.mjs';

const API_BASE = 'http://localhost:3000';

export async function adminTable(user) {
	const admins = await simplePost(`${API_BASE}/getAdmins`, user);
	const adminTable = document.getElementById('admin-table');

	const header = document.createElement('tr');
	header.classList.add('row', 'row--header');
	header.innerHTML =
		'<th class="cell">Id</th><th class="cell">Name</th><th class="cell">Active</th>';

	const rows = admins.map((a) => {
		const tr = document.createElement('tr');
		tr.classList.add('row');
		tr.innerHTML = `<td class="cell">${a.id}</td><td class="cell">${a.name}</td>`;

		let active;
		if (a.id != 1) {
			active = document.createElement('input');
			active.type = 'checkbox';
			active.checked = a.active;
			active.addEventListener('change', async () => {
				await simplePost(`${API_BASE}/toggleActive`, user, {
					id: a.id,
					table: 'admin',
				});
			});
		} else {
			active = document.createElement('span');
			active.classList.add('admin-of-admins');
			active.textContent = 'Active';
		}

		const lastTr = document.createElement('tr');
		lastTr.classList.add('cell');
		lastTr.append(active);
		tr.append(lastTr);

		return tr;
	});
	adminTable.append(header, ...rows);
}
