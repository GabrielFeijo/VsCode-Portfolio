import axios from 'axios';

const apiFetch = axios.create({
	baseURL: 'https://api-vscodeportfolio.vercel.app',
	headers: {
		'Content-Type': 'application/json',
	},
});

export default apiFetch;
