import { simplePost } from '../fetch.mjs';
import mainPage from './adminPage.mjs';
const errorContainer = document.getElementById('error_section');
const API_BASE = '/api';

function openAuth() {
	document.getElementById('authModal').style.display = 'block';
}

async function sendLogin() {
	const user = document.getElementById('user').value;
	const pass = document.getElementById('pass').value;

	const basic = btoa(user + ':' + pass);

	const res = await simplePost(`${API_BASE}/login`, basic);
	document.getElementById('authModal').style.display = 'none';
	if (!res) {
		errorContainer.textContent = 'Error de inicio de sesion.';
		return;
	}
	return basic;
}

async function sendRegister() {
	const user = document.getElementById('user').value;
	const pass = document.getElementById('pass').value;
	const pass2 = document.getElementById('pass2').value;
	const error = document.querySelector('.error_text');

	if (pass != pass2) {
		error.textContent = 'Las contrasenas no coinciden.';
		error.style.color = '#f00';
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
		error.textContent = 'Ya existe un admin con ese nombre.';
		error.style.color = '#f00';
		return;
	}

	error.textContent = 'Peticion de registro enviada.';
	error.style.color = '#0f0';
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
