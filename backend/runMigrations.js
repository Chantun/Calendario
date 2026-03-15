const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const db = await mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'calendar',
});

async function runMigrations() {
	const [rows] = await db.query('SELECT name FROM migrations');
	const executed = rows.map((r) => r.name);

	const files = fs.readdirSync('../migrations').sort();

	for (const file of files) {
		if (!executed.includes(file)) {
			const sql = fs.readFileSync(path.join('./migrations', file), 'utf8');

			console.log('Running migration:', file);
			await db.beginTransaction();
			await db.query(sql);
			await db.query('INSERT INTO migrations (name) VALUES (?)', [file]);
			await db.commit();
		}
	}
}

export default runMigrations;
