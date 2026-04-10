function simpleMonthFilter(month, data) {
	return data.filter((n) => {
		const date = new Date(n.date);
		return date.getUTCMonth() == month;
	});
}

export function getHolidaysByMonth(month, data) {
	const aux = simpleMonthFilter(month, data);
	const mappedData = aux.map((n) => {
		return {
			day: new Date(n.date).getUTCDate(),
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
			day: new Date(n.date).getUTCDate(),
			type: n.type,
			name: n.name,
			details: n.details,
		};
	});
	return mappedData;
}

export function getPeriodsByMonth(month, data) {
	const aux = data.filter((n) => {
		const start = new Date(n.start);
		const end = new Date(n.end);
		return (start.getUTCMonth() == month) | (end.getUTCMonth() == month);
	});
	const mappedData = aux.map((n) => {
		return {
			...n,
			start:
				new Date(n.start).getUTCMonth() == month
					? new Date(n.start).getUTCDate()
					: null,
			end:
				new Date(n.end).getUTCMonth() == month
					? new Date(n.end).getUTCDate()
					: null,
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
		case 8:
			return 'icon_homework';
		default:
			return 'icon_others';
	}
}
