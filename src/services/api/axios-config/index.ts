import axios from 'axios';

const apiFetch = axios.create({
	baseURL: `${import.meta.env.VITE_URL}/v2`,
	headers: {
		'Content-Type': 'application/json',
	},
});

export default apiFetch;
