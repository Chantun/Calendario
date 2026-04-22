import { simplePost } from '../fetch.mjs';
import mainPage from './adminPage.mjs';
const errorContainer = document.querySelector('.error_text');
const API_BASE = 'http://localhost:3000';

function openAuth() {
	document.getElementById('authModal').style.display = 'block';
}

async function sendLogin() {
	const user = document.getElementById('user').value;
	const pass = document.getElementById('pass').value;

	const basic = btoa(user + ':' + pass);

	const res = await simplePost(`${API_BASE}/login`, basic);
	if (!res) {
		errorContainer.textContent = 'Error de inicio de sesion.';
		return;
	}
	document.getElementById('authModal').style.display = 'none';
	return basic;
}

async function sendRegister() {
	const user = document.getElementById('user').value;
	const pass = document.getElementById('pass').value;
	const pass2 = document.getElementById('pass2').value;

	if (pass != pass2) {
		errorContainer.textContent = 'Las contraseñas no coinciden.';
		return;
	}
	const res = await simplePost(`${API_BASE}/addAdmin`, '', {
		password: pass,
		name: user,
	});
	if (!res) {
		errorContainer.textContent = 'Error de inicio de sesion.';
		return;
	}
	if (res.response == 'Error') {
		errorContainer.textContent = 'Ya existe un admin con ese nombre.';
		return;
	}

	errorContainer.textContent = 'Peticion de registro enviada.';
	errorContainer.style.color = 'rgb(27, 136, 27)';

	setTimeout(() => {
		location.reload();
	}, 1500);
}

const login = document.getElementById('login_button');
const register = document.getElementById('send_register');
let user;

login.addEventListener('click', async () => {
	user = await sendLogin();
	user ? mainPage(user) : undefined;
});

register.addEventListener('click', async () => {
	user = await sendRegister();
});

const registerButon = document.getElementById('register_button');
registerButon.addEventListener('click', () => {
	document.getElementById('pass2').style.display = 'block';
	registerButon.style.display = 'none';
	login.style.display = 'none';
	register.style.display = 'block';
});

openAuth();
