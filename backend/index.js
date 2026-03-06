const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

app.get(`/getHorarios`, async (req, res) => {
	const results = await db.getHorarios();
	res.status(200).send(results);
});

app.get(`/getHolidays`, async (req, res) => {
	const results = await db.getHolidays();
	res.status(200).send(results);
});

app.listen(PORT, () => {
	console.log(`Server escuchando en http://localhost:${PORT}`);
});
