import * as parser from './dataParser.mjs';

export default function displayDay(data, d, month, currentYear) {
	const container = document.getElementById('dayInfo__section');
	container.innerHTML = '';
	const date = new Date(currentYear, month, d);
	const days = data.horarios.filter((n) => n.day === date.getUTCDay());

	const title = document.createElement('h2');
	title.classList.add('dayInfo__title');
	title.textContent = `${d}-${month + 1}-${currentYear}`;
	container.append(title);

	const holiday = data.holidays.find(
		(h) =>
			new Date(h.date).toUTCString().slice(0, 16) ==
			date.toUTCString().slice(0, 16),
	);
	const events = data.events.filter(
		(n) =>
			new Date(n.date).toUTCString().slice(0, 16) ==
			date.toUTCString().slice(0, 16),
	);
	const periods = data.periods.filter(
		(p) =>
			new Date(p.start.replace('Z', '')) <= date &&
			new Date(p.end.replace('Z', '')) >= date,
	);

	if (!holiday && !periods?.some((p) => p.suspension)) {
		days.forEach((n) => {
			const div = document.createElement('div');
			div.style.backgroundColor = `#${n.color}`;
			div.classList.add('dayInfo__line');
			div.innerHTML = `<span class='dayInfo__name'> ${n.name}</span><span class='dayInfo__hour'>${n.start.split(':', 2).join(':')} - ${n.finish.split(':', 2).join(':')}</span>`;
			events.forEach((m) => {
				if (n.name == m.name) {
					const iconSpan = document.createElement('span');
					iconSpan.classList.add('icon_before', 'icon_before--big');
					iconSpan.classList.add(parser.eventToClass(m.type));
					div.querySelector('.dayInfo__name').prepend(iconSpan);
				}
			});
			container.append(div);
		});
	} else if (holiday) {
		const div = document.createElement('div');
		div.style.backgroundColor = `#D4D4D4`;
		div.classList.add('dayInfo__line');
		div.innerHTML = `<span class='dayInfo__name'><span class="icon_before icon_before--big icon_holiday"></span> ${holiday.details}</span><span class='dayInfo__hour'>${holiday.type}</span>`;
		container.append(div);
	}
	if (periods) {
		periods.forEach((p) => {
			const div = document.createElement('div');
			div.classList.add('dayInfo__line');
			!p.suspension
				? (div.style.backgroundColor = '#FAD7C8')
				: (div.style.backgroundColor = '#D4D4D4');
			div.innerHTML = `<span class='dayInfo__name'><span class="icon_before icon_before--big ${parser.eventToClass(p.type)}"></span> ${p.details}</span>`;
			container.append(div);
		});
	}
}
