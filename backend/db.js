const mysql = require('mysql2/promise');

const conn = mysql.createPool({
	host: '127.0.0.1',
	user: 'santiago',
	password: '953741',
	database: 'calendar',
});

async function getHorarios() {
	try {
		const [results] =
			await conn.query(`SELECT H.id AS horario_id, H.materia_id, M.name, M.color, H.day, H.start, H.finish FROM horarios H
      JOIN materias M ON H.materia_id = M.id ORDER BY H.start;`);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function addHolidayScrap(data) {
	try {
		await conn.query(
			`INSERT INTO feriados (date, type, details) VALUES
		(?, ?, ?)`,
			[data.date, data.type, data.details],
		);
		console.log(`INSERT ${data.date} - ${data.type} - ${data.details}`);
	} catch (err) {
		console.error(err);
	}
}

module.exports = { getHorarios, addHolidayScrap };
