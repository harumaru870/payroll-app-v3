import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url && process.env.NODE_ENV === 'production') {
    console.warn('TURSO_DATABASE_URL is not defined');
}

const client = createClient({
    url: url || 'libsql://dummy.turso.io',
    authToken: authToken,
});

export const db = drizzle(client, { schema });
