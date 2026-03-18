import { simplePost } from '../fetch.mjs';
import mainPage from './adminPage.mjs';
const errorContainer = document.getElementById('error_section');

function openAuth() {
	document.getElementById('authModal').style.display = 'block';
}

async function enviar() {
	const user = document.getElementById('user').value;
	const pass = document.getElementById('pass').value;

	const basic = btoa(user + ':' + pass);

	const res = await simplePost('http://localhost:3000/login', basic);
	document.getElementById('authModal').style.display = 'none';
	if (!res) {
		errorContainer.textContent = 'Error de inicio de sesion.';
		return;
	}
	return basic;
}

const send = document.getElementById('send_button');
let user;

send.addEventListener('click', async () => {
	user = await enviar();
	user ? mainPage(user) : undefined;
});

openAuth();
