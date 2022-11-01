require("@html-validate/eslint-config/patch/modern-module-resolution");

module.exports = {
	root: true,
	extends: ["@html-validate"],

	overrides: [
		{
			files: "*.ts",
			extends: ["@html-validate/typescript"],
		},
		{
			files: ["src/**/*.ts"],
			excludedFiles: ["src/**/*.spec.ts"],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: ["./tsconfig.json"],
			},
			extends: ["@html-validate/typescript-typeinfo"],
		},
	],
};
