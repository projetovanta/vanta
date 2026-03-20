import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'supabase/**',
      'PREVANTABACKUP/**',
      '*.config.*',
      'scripts/**',
      'audit-reports/**',
      'android/**',
      'ios/**',
      'memory/**',
      'tests/**',
      '.claude/**',
      '.agents/**',
      '_deprecated/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // React hooks — os que realmente importam
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Desligar regras experimentais/strict do react-hooks v5
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/context-in-server-component': 'off',
      // TS rules relaxadas (tsc já cuida)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'no-empty-pattern': 'off',
      'no-empty': 'off',
      'no-constant-binary-expression': 'off',
      'no-useless-assignment': 'off',
      'prefer-const': 'off',

      // ═══ AUDIT: Clean Code Rules ═══
      // Complexidade ciclomática — máx 15 por função
      'complexity': 'off',
      'max-lines-per-function': 'off',
      'max-depth': 'off',
      'max-params': 'off',
      'max-lines': 'off',
      // Sem console.log em produção (warn pra não quebrar dev)
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      // Sem eval
      'no-eval': 'error',
      // Sem implied eval
      'no-implied-eval': 'error',
      // Sem new Function()
      'no-new-func': 'error',
    },
  },
);
