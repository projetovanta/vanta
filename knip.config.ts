import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['App.tsx'],
  project: ['**/*.{ts,tsx}'],
  ignore: ['supabase/**'],
};

export default config;
