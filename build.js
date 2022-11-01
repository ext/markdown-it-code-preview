import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import esbuild from "esbuild";
import markdownIt from "markdown-it";
import globCb from "glob";

const glob = promisify(globCb);

function renderMarkdown(md, src, dst) {
	const markdown = fs.readFileSync(src, "utf-8");
	const html = md.render(markdown);
	fs.mkdirSync(path.dirname(dst), { recursive: true });
	fs.writeFileSync(dst, html, "utf-8");
}

async function build() {
	await esbuild.build({
		entryPoints: ["src/index.ts"],
		bundle: true,
		format: "esm",
		platform: "node",
		target: ["node16"],
		outdir: "dist",
	});

	const { codePreview } = await import("./dist/index.js");
	const md = markdownIt("commonmark");
	md.use(codePreview);

	const filenames = await glob("**/*.md", { cwd: "examples" });
	for (const filename of filenames) {
		const parsed = path.parse(filename);
		const src = path.join("examples", filename);
		const dst = path.join("public", parsed.dir, `${parsed.name}.html`);
		renderMarkdown(md, src, dst);
	}
	console.log(`${filenames.length} file(s) rendered to "public/"`);
}

build().catch((err) => {
	/* eslint-disable-next-line no-console */
	console.error(err);
	process.exitCode = 1;
});
