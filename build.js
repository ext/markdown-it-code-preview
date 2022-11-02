const esbuild = require("esbuild");

async function build() {
	await esbuild.build({
		entryPoints: ["src/index.ts"],
		bundle: true,
		format: "cjs",
		platform: "node",
		target: ["node16"],
		outdir: "dist",
		external: ["@vue/compiler-sfc", "esbuild"],
	});

	await esbuild.build({
		entryPoints: ["src/generator.ts"],
		bundle: true,
		format: "cjs",
		platform: "node",
		target: ["node16"],
		outdir: "dist",
		external: ["@vue/compiler-sfc", "esbuild"],
	});
}

build().catch((err) => {
	/* eslint-disable-next-line no-console */
	console.error(err);
	process.exitCode = 1;
});
