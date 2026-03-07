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

async function getHolidays() {
	try {
		const [results] = await conn.query(`SELECT * FROM feriados;`);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function getEvents() {
	try {
		const [results] =
			await conn.query(`SELECT M.name, E.type, E.date FROM events E
			JOIN materias M ON E.materia_id = M.id;`);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function getPeriods() {
	try {
		const [results] =
			await conn.query(`SELECT type, start, end, details, suspension FROM periods;`);
		return results;
	} catch(err) {
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

module.exports = { getHorarios, addHolidayScrap, getHolidays, getEvents, getPeriods };
