import {defineConfig} from 'vitest/config';
export default defineConfig({test:{environment:'happy-dom',include:['tests/**/*.test.{ts,tsx}'],setupFiles:['tests/setup.ts'],reporters:['default','json'],outputFile:{json:'audit/unit-results.json'}}});
