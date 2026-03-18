export async function simpleFetch(URL) {
	try {
		const response = await fetch(URL);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		const text = await response.text();
		if (!text.trim()) {
			return null; // Handle empty response
		}
		const result = JSON.parse(text);
		return result;
	} catch (err) {
		console.error(err.message);
	}
}
