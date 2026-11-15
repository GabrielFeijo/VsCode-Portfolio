import { parseEnv } from '@/config/env';
import { createApiClient } from './createApiClient';

const { apiUrl } = parseEnv(import.meta.env);
const apiFetch = createApiClient(apiUrl);

export default apiFetch;
