import axios from 'axios';

const apiFetch = axios.create({
	baseURL: 'https://portfolio.gabrielfeijo.repl.co',
	headers: {
		'Content-Type': 'application/json',
	},
});

export default apiFetch;
