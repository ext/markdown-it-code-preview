const { generator, frontMatterFileReader } = require("./dist/generator");

async function build() {
	await generator({
		outputFolder: "public",
		sourceFiles: [
			{
				include: "examples/**/*.md",
				basePath: "examples",
				fileReader: frontMatterFileReader,
			},
		],
	});
}

build().catch((err) => {
	/* eslint-disable-next-line no-console */
	console.error(err);
	process.exitCode = 1;
});
