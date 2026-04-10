import * as parser from './dataParser.mjs';

export default function displayDay(data, d, month, currentYear) {
	const container = document.getElementById('dayInfo__section');
	container.innerHTML = '';
	const date = new Date(currentYear, month, d);
	const days = data.horarios.filter((n) => n.day === date.getUTCDay());

	const title = document.createElement('h2');
	title.classList.add('title', 'dayInfo__title');
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
			const ul = document.createElement('ul');
			ul.classList.add('dayInfo__list');
			ul.style.borderLeft = `solid 5px #${n.color}`;
			const first = document.createElement('li');
			first.classList.add('dayInfo');
			first.innerHTML = `<span class='dayInfo__name'> ${n.name}</span><span class='title dayInfo__hour'>${n.start.split(':', 2).join(':')} - ${n.finish.split(':', 2).join(':')}</span>`;
			ul.append(first);
			events.forEach((m) => {
				if (n.name == m.name) {
					const iconSpan = document.createElement('span');
					iconSpan.classList.add('icon_before', 'icon_before--big');
					iconSpan.classList.add(parser.eventToClass(m.type));
					const li = document.createElement('li');
					li.classList.add('day-event');
					li.textContent = m.details;
					li.prepend(iconSpan);
					ul.append(li);
				}
			});
			container.append(ul);
		});
	} else if (holiday) {
		const div = document.createElement('div');
		div.classList.add('dayInfo__list', 'dayInfo', 'dayInfo--padding');
		div.style.borderLeft = `solid 5px #A4A4A4`;
		div.innerHTML = `<span class="icon_before icon_before--big icon_holiday"></span><span class='dayInfo__name'> ${holiday.details}</span><span class="title dayInfo__hour">${holiday.type}</span>`;
		container.append(div);
	}
	if (periods) {
		periods.forEach((p) => {
			const div = document.createElement('div');
			div.classList.add('dayInfo__list', 'dayInfo', 'dayInfo--padding');
			div.style.borderLeft = `solid 5px ${!p.suspension ? '#d2a87d' : '#A4A4A4'}`;
			div.innerHTML = `<span class="icon_before icon_before--big ${parser.eventToClass(p.type)}"></span><span class='dayInfo__name'> ${p.details}</span>`;
			container.append(div);
		});
	}
}
