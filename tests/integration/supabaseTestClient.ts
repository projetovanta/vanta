/**
 * Cliente Supabase para testes de integracao.
 * Le credenciais de .env.local via dotenv (nao depende de import.meta.env).
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env.local') });

const url = process.env.VITE_SUPABASE_URL!;
const key = process.env.VITE_SUPABASE_ANON_KEY!;

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar em .env.local');
}

export const supabase = createClient(url, key);
