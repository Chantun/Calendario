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
      JOIN materias M ON H.materia_id = M.id
			WHERE H.active IS TRUE
			ORDER BY H.start;`);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function getHolidays() {
	try {
		const [results] = await conn.query(
			`SELECT * FROM feriados WHERE active IS TRUE;`,
		);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function getEvents() {
	try {
		const [results] =
			await conn.query(`SELECT M.name, E.type, E.date FROM events E
			JOIN materias M ON E.materia_id = M.id
			WHERE E.active IS TRUE;`);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function getPeriods() {
	try {
		const [results] = await conn.query(
			`SELECT type, start, end, details, suspension FROM periods WHERE active IS TRUE;`,
		);
		return results;
	} catch (err) {
		console.error(err);
	}
}

async function addPeriod(data) {
	try {
		await conn.query(
			`INSERT INTO periods
			(type, start, end, details, suspension)
			VALUES
			(?, ?, ?, ?, ?)`,
			[data.type, data.start, data.end, data.details, data.suspension],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function addEvent(data) {
	try {
		await conn.query(
			`INSERT INTO events
			(materia_id, type, date)
			VALUES
			(?, ?, ?)`,
			[data.materia, data.type, data.date],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function addHoliday(data) {
	try {
		await conn.query(
			`INSERT INTO feriados
			(details, type, date)
			VALUES
			(?, ?, ?)`,
			[data.details, data.type, data.date],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function addMateria(data) {
	try {
		await conn.query(
			`INSERT INTO materias
			(name, color)
			VALUES
			(?, ?)`,
			[data.name, data.color],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function addHorario(data) {
	try {
		await conn.query(
			`INSERT INTO horarios
			(day, start, finish, materia_id)
			VALUES
			(?, ?, ?, ?)`,
			[data.day, data.start, data.finish, data.materia],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function setMateria(data) {
	try {
		await conn.query(
			`UPDATE materias
			SET name = ?, color = ?
			WHERE id = ?`,
			[data.name, data.color, data.id],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function setHorario(data) {
	try {
		await conn.query(
			`UPDATE horarios
			SET materia_id = ?, day = ?, start = ?, finish = ?
			WHERE id = ?`,
			[data.materia, data.day, data.start, data.finish, data.id],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function setEvent(data) {
	try {
		await conn.query(
			`UPDATE events
			SET materia_id = ?, type = ?, date = ?
			WHERE id = ?`,
			[data.materia, data.type, data.date, data.id],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function setHoliday(data) {
	try {
		await conn.query(
			`UPDATE feriados
			SET date = ?, type = ?, details = ?
			WHERE id = ?`,
			[data.date, data.type, data.details, data.id],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
}

async function setPeriod(data) {
	try {
		await conn.query(
			`UPDATE periods
			SET type = ?, details = ?, start = ?, end = ?, suspension = ?
			WHERE id = ?`,
			[data.type, data.details, data.start, data.end, data.suspension, data.id],
		);
	} catch (err) {
		console.error(err);
		return err;
	}
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

module.exports = {
	getHorarios,
	addHolidayScrap,
	getHolidays,
	getEvents,
	getPeriods,
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
};
