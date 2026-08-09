import { createApiClient } from './createApiClient';

const apiFetch = createApiClient(import.meta.env.VITE_URL);

export default apiFetch;
