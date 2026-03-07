import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['index.tsx', 'App.tsx'],
  project: ['**/*.{ts,tsx}'],
  ignore: ['PREVANTABACKUP/**', 'supabase/**', 'dist/**', 'node_modules/**'],
};

export default config;
