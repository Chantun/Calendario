const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

function verifyData(req, res, next) {
	const { name, password } = req.body || {};

	if (!name)
		return res
			.status(400)
			.send({ result: 'Error', err: 'Nombre de usuario invalido' });
	if (!password)
		return res
			.status(400)
			.send({ result: 'Error', err: 'Contraseña invalida' });

	next();
}

async function basicAuth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).send({ error: 'No authorization header' });
	}

	const [authType, authKey] = authHeader.split(' ');

	if (authType != 'Basic') {
		return res.status(401).send({ error: 'Requires basic auth' });
	}

	const [name, password] = Buffer.from(authKey, 'base64')
		.toString('ascii')
		.split(':');

	try {
		const [user] = await db.getAdmin(name);
		if (!user) {
			return res.status(401).send({ error: 'User not found' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({ error: 'Incorrect password' });
		}
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send({ error: `An error ocurred during authorization ${error}` });
	}

	next();
}

async function adder(bool, func, data) {
	if (bool) {
		return { status: 400, error: 'No data provided.' };
	}
	const response = await func(data);
	if (response) {
		return { status: 500, response: response };
	}
	return { status: 200, response: 'Ok' };
}

async function setter(bool, func, data) {
	if (data.id == null) {
		return { status: 400, error: 'Id is missing.' };
	}
	return await adder(bool, func, data);
}

app.get('/', (req, res) => {
	res
		.status(200)
		.send([
			'API de aplicacion de calendario academico',
			'/getTypes',
			'/getMaterias',
			'/getHorarios',
			'/getHolidays',
			'/getEvents',
			'/getPeriods',
			'/addMateria',
			'/addHorario',
			'/addPeriod',
			'/addEvent',
			'/addHoliday',
			'/setMateria',
			'/setHorario',
			'/setPeriod',
			'/setEvent',
			'/setHoliday',
			'/addAdmin',
			'/login',
		]);
});

app.post('/addAdmin', verifyData, async (req, res) => {
	const body = req.body;
	const psw = await bcrypt.hash(body.password, 12);
	const result = await db.addAdmin(body.name, psw);
	console.log(result);
	res.status(200).send(result);
});

app.post('/login', basicAuth, async (req, res) => {
	const authHeader = req.headers.authorization;
	const [name] = Buffer(authHeader.split(' ')[1], 'base64')
		.toString('ascii')
		.split(':');
	const [user] = await db.getAdmin(name);

	const safeUser = { ...user };
	delete safeUser.password;
	return res.status(200).send({ response: 'Ok', data: safeUser });
});

app.get('/getTypes', async (req, res) => {
	const results = await db.getTypes();
	res.status(200).send(results);
});

app.get('/getMaterias', async (req, res) => {
	const results = await db.getMaterias();
	res.status(200).send(results);
});

app.get('/getHorarios', async (req, res) => {
	const results = await db.getHorarios();
	res.status(200).send(results);
});

app.get('/getHolidays', async (req, res) => {
	const results = await db.getHolidays();
	res.status(200).send(results);
});

app.get('/getEvents', async (req, res) => {
	const results = await db.getEvents();
	res.status(200).send(results);
});

app.get('/getPeriods', async (req, res) => {
	const results = await db.getPeriods();
	res.status(200).send(results);
});

app.post('/addMateria', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await adder(!body.name || !body.color, db.addMateria, body);
	res.status(result.status).send(result);
});

app.post('/addHorario', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await adder(
		body.day == null ||
			body.start == null ||
			body.finish == null ||
			body.materia == null,
		db.addHorario,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/addPeriod', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await adder(
		body.type == null ||
			body.start == null ||
			body.end == null ||
			body.details == null ||
			body.suspension == null,
		db.addPeriod,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/addEvent', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await adder(
		body.materia == null || body.type == null || body.date == null,
		db.addEvent,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/addHoliday', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await adder(
		body.details == null || body.type == null || body.date == null,
		db.addHoliday,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/setMateria', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await setter(
		body.name == null || body.color == null,
		db.setMateria,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/setHorario', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await setter(
		body.materia == null ||
			body.day == null ||
			body.start == null ||
			body.finish == null,
		db.setHorario,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/setEvent', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await setter(
		body.materia == null || body.type == null || body.date == null,
		db.setEvent,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/setPeriod', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await setter(
		body.type == null ||
			body.details == null ||
			body.start == null ||
			body.end == null ||
			body.suspension == null,
		db.setPeriod,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/setHoliday', basicAuth, async (req, res) => {
	const body = req.body;
	const result = await setter(
		body.date == null || body.type == null || body.details == null,
		db.setHoliday,
		body,
	);
	res.status(result.status).send(result);
});

app.post('/toggleActive', basicAuth, async (req, res) => {
	const body = req.body;
	if (body.id == null) {
		return res.status(400).send({ error: 'Id is missing.' });
	}
	if (body.table == null) {
		return res.status(400).send({ error: 'Table is missing.' });
	}
	const response = await db.toggleActive(body.table, body.id);
	if (response) {
		return res.status(500).send({ status: 500, response: response });
	}
	res.status(200).send({ status: 200, response: 'Ok' });
});

app.listen(PORT, () => {
	console.log(`Server escuchando en http://localhost:${PORT}`);
});
