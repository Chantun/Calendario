export async function simpleFetch(URL) {
	try {
		const response = await fetch(URL);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		const result = await response.json();
		return result;
	} catch (err) {
		console.error(err.message);
	}
}
