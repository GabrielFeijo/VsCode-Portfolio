import axios from 'axios';

const apiFetch = axios.create({
	baseURL: `${process.env.REACT_APP_URL}/v2`,
	headers: {
		'Content-Type': 'application/json',
	},
});

export default apiFetch;
