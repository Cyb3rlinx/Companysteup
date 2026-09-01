import { defineConfig, globalIgnores } from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
import ts from 'eslint-config-next/typescript';
export default defineConfig([...next, ...ts, globalIgnores(['**/.next/**', '**/node_modules/**', '.pnpm-store/**', '.local/**', 'playwright-report/**', 'test-results/**', 'supabase/functions/**']), { settings:{next:{rootDir:'apps/web/'}}, rules: { '@typescript-eslint/no-explicit-any': 'error' } }]);
