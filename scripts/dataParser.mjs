function simpleMonthFilter(month, data) {
	return data.filter((n) => {
		const date = new Date(n.date);
		return date.getMonth() == month;
	});
}

export function getHolidaysByMonth(month, data) {
	const aux = simpleMonthFilter(month, data);
	const mappedData = aux.map((n) => {
		return {
			day: new Date(n.date).getDate(),
			type: n.type,
			details: n.details,
		};
	});
	return mappedData;
}

export function getEventsByMonth(month, data) {
	const aux = simpleMonthFilter(month, data);
	const mappedData = aux.map((n) => {
		return {
			day: new Date(n.date).getDate(),
			type: n.type,
			name: n.name,
		};
	});
	return mappedData;
}

export function getPeriodsByMonth(month, data) {
	const aux = data.filter((n) => {
		const start = new Date(n.start);
		const end = new Date(n.end);
		return (start.getMonth() == month) | (end.getMonth() == month);
	});
	const mappedData = aux.map((n) => {
		return {
			...n,
			start:
				new Date(n.start).getMonth() == month
					? new Date(n.start).getDate()
					: null,
			end:
				new Date(n.end).getMonth() == month ? new Date(n.end).getDate() : null,
		};
	});
	return mappedData;
}

export function eventToClass(num) {
	switch (num) {
		case 1:
			return 'icon_paro';
		case 2:
			return 'icon_expo';
		case 3:
			return 'icon_exam';
		case 4:
			return 'icon_recu';
		case 5:
			return 'icon_vacation';
		case 6:
			return 'icon_mesa';
		default:
			return 'icon_others';
	}
}

export function verifyMonth() {
	// Disable the buttons when required
	if (month == currentMonth) {
		previousButton.classList += ' disabled';
		previousButton.disabled = true;
	} else if (month == 11) {
		nextButton.classList += ' disabled';
		nextButton.disabled = true;
	}
	if (month < 11) {
		nextButton.classList -= ' disabled';
		nextButton.disabled = false;
	}
	if (month > currentMonth) {
		previousButton.classList -= ' disabled';
		previousButton.disabled = false;
	}
}
