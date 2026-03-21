const mysql = require('mysql2/promise');

const conn = mysql.createPool({
	host: '127.0.0.1',
	user: 'santiago',
	password: '953741',
	database: 'calendar',
});

async function getter(query) {
	try {
		const [results] = await conn.query(query);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function execQuery(query, array = []) {
	try {
		await conn.query(query, array);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function getTypes() {
	return await getter(`SELECT * FROM events_types`);
}

async function getMaterias() {
	return await getter(`SELECT * FROM materias`);
}

async function getHorarios() {
	return await getter(`SELECT H.id AS horario_id, H.materia_id, M.name, M.color, H.day, H.start, H.finish, H.active FROM horarios H
    JOIN materias M ON H.materia_id = M.id
		WHERE H.active IS TRUE
		ORDER BY H.start`);
}

async function getHorariosPure() {
	return await getter('SELECT * FROM horarios');
}

async function getHolidays() {
	return await getter(`SELECT * FROM feriados WHERE active IS TRUE`);
}

async function getAllHolidays() {
	return await getter(`SELECT * FROM feriados`);
}

async function getEvents() {
	return await getter(`SELECT M.name, E.type, E.date FROM events E
		JOIN materias M ON E.materia_id = M.id
		WHERE E.active IS TRUE`);
}

async function getEventsPure() {
	return await getter('SELECT * FROM events');
}

async function getPeriods() {
	return await getter(
		`SELECT type, start, end, details, suspension FROM periods WHERE active IS TRUE`,
	);
}

async function getAllPeriods() {
	return await getter(`SELECT * FROM periods`);
}

async function addPeriod(data) {
	return await execQuery(
		`INSERT INTO periods
			(type, start, end, details, suspension, active)
			VALUES
			(?, ?, ?, ?, ?, TRUE)`,
		[data.type, data.start, data.end, data.details, data.suspension],
	);
}

async function addEvent(data) {
	return await execQuery(
		`INSERT INTO events
			(materia_id, type, date, active)
			VALUES
			(?, ?, ?, TRUE)`,
		[data.materia, data.type, data.date],
	);
}

async function addHoliday(data) {
	return await execQuery(
		`INSERT INTO feriados
			(details, type, date, active)
			VALUES
			(?, ?, ?, TRUE)`,
		[data.details, data.type, data.date],
	);
}

async function addMateria(data) {
	return await execQuery(
		`INSERT INTO materias
			(name, color, active)
			VALUES
			(?, ?, TRUE)`,
		[data.name, data.color],
	);
}

async function addHorario(data) {
	return await execQuery(
		`INSERT INTO horarios
			(day, start, finish, materia_id, active)
			VALUES
			(?, ?, ?, ?, TRUE)`,
		[data.day, data.start, data.finish, data.materia],
	);
}

async function setMateria(data) {
	return await execQuery(
		`UPDATE materias
			SET name = ?, color = ?
			WHERE id = ?`,
		[data.name, data.color, data.id],
	);
}

async function setHorario(data) {
	return await execQuery(
		`UPDATE horarios
			SET materia_id = ?, day = ?, start = ?, finish = ?
			WHERE id = ?`,
		[data.materia, data.day, data.start, data.finish, data.id],
	);
}

async function setEvent(data) {
	return await execQuery(
		`UPDATE events
			SET materia_id = ?, type = ?, date = ?
			WHERE id = ?`,
		[data.materia, data.type, data.date, data.id],
	);
}

async function setHoliday(data) {
	return await execQuery(
		`UPDATE feriados
			SET date = ?, type = ?, details = ?
			WHERE id = ?`,
		[data.date, data.type, data.details, data.id],
	);
}

async function setPeriod(data) {
	return await execQuery(
		`UPDATE periods
			SET type = ?, details = ?, start = ?, end = ?, suspension = ?
			WHERE id = ?`,
		[data.type, data.details, data.start, data.end, data.suspension, data.id],
	);
}

async function toggleActive(table, id) {
	const query = `UPDATE ${table}
	SET active = NOT active
	WHERE id = ?`;
	try {
		await conn.query(query, [id]);
		if (table == 'materias') {
			await conn.query(
				`UPDATE horarios H
				JOIN materias M ON M.id = H.materia_id
				SET H.active = M.active
				WHERE H.materia_id = ?`,
				[id],
			);
			await conn.query(
				`UPDATE events E
				JOIN materias M ON M.id = E.materia_id
				SET E.active = M.active
				WHERE E.materia_id = ?`,
				[id],
			);
		}
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function addAdmin(name, pass) {
	try {
		await conn.query(
			`INSERT INTO admin
			(name, password, active) 
			VALUES (?, ?, FALSE)`,
			[name, pass],
		);
		return {
			response: 'Ok',
			name: name,
			password: pass,
		};
	} catch (err) {
		console.error(err);
		return { response: 'Error', err: err };
	}
}

async function getAdmin(id) {
	try {
		const [results] = await conn.query(
			`SELECT * FROM admin
				WHERE (id = ? OR name = ?) AND active IS TRUE
				LIMIT 1`,
			[id, id],
		);
		return results;
	} catch (err) {
		console.error(err);
		return { response: 'Error', err: err };
	}
}

async function getAdmins() {
	return await getter(`SELECT id, name, active FROM admin`);
}

module.exports = {
	getTypes,
	getMaterias,
	getHorarios,
	getHorariosPure,
	getHolidays,
	getAllHolidays,
	getEvents,
	getEventsPure,
	getPeriods,
	getAllPeriods,
	addEvent,
	addHoliday,
	addPeriod,
	addHorario,
	addMateria,
	setMateria,
	setHorario,
	setEvent,
	setHoliday,
	setPeriod,
	toggleActive,
	addAdmin,
	getAdmin,
	getAdmins,
};
