module.exports = {
	root: true,
	extends: ['eslint:recommended', 'plugin:svelte/recommended'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2022,
		extraFileExtensions: ['.svelte']
	},
	env: { browser: true, es2022: true, node: true, serviceworker: true },
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: { parser: '@typescript-eslint/parser' }
		},
		{
			files: ['*.ts'],
			parser: '@typescript-eslint/parser'
		}
	],
	ignorePatterns: ['*.cjs', '.svelte-kit', 'build', 'node_modules', 'static']
};
