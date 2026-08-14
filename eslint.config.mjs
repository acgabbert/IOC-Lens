import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelteParser from 'svelte-eslint-parser';

// Obsidian plugins run in an Electron renderer, so browser globals are available.
// Prefer `window`/`activeWindow` over `globalThis` for popout window compatibility.
const browserGlobals = {
    console: 'readonly',
    window: 'readonly',
    activeWindow: 'readonly',
    document: 'readonly',
    activeDocument: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
};

// Runes are compiler globals; svelte-eslint-parser supplies these for *.svelte,
// but *.svelte.ts modules are parsed as plain TypeScript.
const svelteRunes = {
    $state: 'readonly',
    $derived: 'readonly',
    $effect: 'readonly',
    $props: 'readonly',
    $bindable: 'readonly',
    $inspect: 'readonly',
    $host: 'readonly',
};

const typescriptRules = {
    ...tseslint.configs.recommended.rules,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/no-empty-function': 'off',
};

export default [
    {
        ignores: ['main.js', 'node_modules/**'],
    },
    eslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            },
            globals: browserGlobals,
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...typescriptRules,
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
        },
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tsParser,
                sourceType: 'module',
            },
            globals: browserGlobals,
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...typescriptRules,
            'no-inner-declarations': 'off',
        },
    },
    {
        files: ['**/*.svelte.ts'],
        languageOptions: {
            globals: svelteRunes,
        },
    },
];
