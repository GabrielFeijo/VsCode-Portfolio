import { parseEnv } from '@/config/env';
import { createApiClient } from './create-api-client';

const { apiUrl } = parseEnv(import.meta.env);
const apiFetch = createApiClient(apiUrl);

export default apiFetch;
