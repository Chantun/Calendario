const puppeteer = require('puppeteer');
const db = require('./db');

const date = new Date();
const year = date.getFullYear();

function formatData(data) {
	return data.map((holiday) => {
		const cleaned = holiday.details
			.replace(/^\d+\.\s*/, '')
			.replace(/\n/g, '')
			.trim(); // Limpia el resultado de holiday.details
		const [type, details] = cleaned.split('—').map((s) => s.trim()); // Divide el type del details propiamente dicho\
		const [day, month] = holiday.date.split('-').slice(1);
		const obj = {
			date: new Date(`${year}-${month}-${day}`), // Limpia el id para quedarce con la fecha y le agrega el anio
			type: type,
			details: details,
		};
		return obj;
	});
}

async function scrap() {
	const URL = `https://www.argentina.gob.ar/jefatura/feriados-nacionales-${year}`;

	const browser = await puppeteer.launch(); // Genera un browse visible, para que no sea visible se elimina el headless: false

	const page = await browser.newPage(); // Genera una pagina

	await page.goto(URL, { waitUntil: 'networkidle2' }); // Le doy la url y el waitUntil para que espere unos segundos a que cargue

	const holiDays = [];

	const pageHolidays = await page.evaluate(() => {
		const holidays = [];
		const response = Array.from(document.querySelectorAll('.holidays'));

		response.forEach((group) => {
			// Busca en la pagina los elementos con las caracteristicas especificas:
			const lists = group.querySelectorAll('li');
			lists.forEach((n) => {
				holidays.push({
					date: n.querySelector('[id^="feriado-"]')?.id,
					details: n.innerText,
				});
			});
		});

		return holidays;
	});

	holiDays.push(...pageHolidays);

	return formatData(holiDays);
}

(async () => {
	const holiDays = await scrap();
	holiDays.forEach(async (n) => {
		await db.addHolidayScrap(n);
	});
})();
