import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/.astro/**',
    '**/.sanity/**',
    'design-system/**',
    'rosario-site-kit/**',
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  // "essential": só regras de correção. O estilo (quebras de linha, atributos) é do Prettier.
  vue.configs['flat/essential'],
  { files: ['**/*.vue'], rules: { 'vue/no-v-html': 'warn' } },

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // TypeScript dentro dos componentes Vue
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      // nomes como Header.vue ou Menu.vue são aceitáveis aqui
      'vue/multi-word-component-names': 'off',
    },
  },

  // scripts e configs rodam no Node
  {
    files: ['scripts/**', '*.config.{js,mjs,ts}', '**/*.config.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
]);
