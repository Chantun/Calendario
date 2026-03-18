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

export async function simplePost(URL, auth, body = {}) {
	try {
		const response = await fetch(URL, {
			method: 'POST', // Specify the method
			headers: {
				'Content-Type': 'application/json', // Inform the server of the content type
				Authorization: `Basic ${auth}`,
			},
			body: JSON.stringify(body), // Convert the JS object to a JSON string
		});
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
