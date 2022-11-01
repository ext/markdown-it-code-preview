import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import dedent from "dedent";
import esbuild from "esbuild";
import markdownIt from "markdown-it";
import globCb from "glob";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
const glob = promisify(globCb);
const hljsVersion = pkg.devDependencies["highlight.js"];

const layout = (content) =>
	dedent(/* HTML */ `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/styles/default.min.css"
				/>
				<style>
					* {
						box-sizing: border-box;
					}
					html,
					body {
						margin: 0;
						padding: 0;
					}
					body {
						font-family: sans-serif;
						background: #eee;
					}
					header {
						margin-bottom: 1rem;
						padding: 1rem;
						background: #f0a;
					}
					header h1,
					header nav {
						margin: auto;
					}
					header h1 {
						color: #fff;
						text-shadow: 0 0 5px #ccc;
					}
					header nav {
						margin-top: 1rem;
					}
					header nav a {
						display: inline-block;
						color: #fff;
						font-size: 1.5rem;
						margin-right: 1rem;
						text-shadow: 0 0 5px #666;
						text-decoration: none;
					}
					header nav a:hover {
						text-shadow: 0 0 5px #ccc;
						text-decoration: underline;
						transform: scale(1.2) rotate(-5deg);
						transition: transform 300ms ease-in;
					}
					main {
						margin: auto;
						padding: 1rem;
						background: #fff;
						border-left: 1px solid #ccc;
						border-top: 1px solid #ccc;
						border-right: 1px solid #999;
						border-bottom: 1px solid #999;
						border-radius: 4px;
					}
					main h2:first-child {
						margin-top: 0;
					}
					.code-preview {
						border-left: 1px solid #999;
						border-top: 1px solid #999;
						border-right: 1px solid #ccc;
						border-bottom: 1px solid #ccc;
						width: 100%;
					}
					.code-preview__preview {
						border-bottom: 1px solid #999;
						padding: 1rem;
						background: repeating-conic-gradient(#efefef 0% 25%, transparent 0% 50%) 50% / 20px 20px;
					}
					.code-preview__markup {
						margin: 0;
					}
					@media (min-width: 700px) {
						header h1,
						header nav,
						main {
							width: 700px;
						}
					}
				</style>
			</head>
			<body>
				<header>
					<h1>My awesome site!</h1>
					<nav>
						<a href="./index.html">HTML/CSS</a>
						<a href="./import.html">Importing files</a>
					</nav>
				</header>
				<main>${content}</main>
			</body>
		</html>
	`);

function renderMarkdown(md, src, dst) {
	const markdown = fs.readFileSync(src, "utf-8");
	const html = md.render(markdown);
	fs.mkdirSync(path.dirname(dst), { recursive: true });
	fs.writeFileSync(dst, layout(html), "utf-8");
}

function headingLevel(initial) {
	const offset = initial - 1;
	return function (md) {
		md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
			const { tag } = tokens[idx];
			return tag.replace(/h(\d)/, (_, n) => `<h${parseInt(n, 10) + offset}>`);
		};
		md.renderer.rules.heading_close = function (tokens, idx, options, env, self) {
			const { tag } = tokens[idx];
			return tag.replace(/h(\d)/, (_, n) => `</h${parseInt(n, 10) + offset}>`);
		};
	};
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
	md.use(headingLevel(2));
	md.use(codePreview);

	const filenames = await glob("**/*.md", { cwd: "examples" });
	for (const filename of filenames) {
		const parsed = path.parse(filename);
		const src = path.join("examples", filename);
		const dst = path.join("public", parsed.dir, `${parsed.name}.html`);
		renderMarkdown(md, src, dst);
	}
	/* eslint-disable-next-line no-console */
	console.log(`${filenames.length} file(s) rendered to "public/"`);
}

build().catch((err) => {
	/* eslint-disable-next-line no-console */
	console.error(err);
	process.exitCode = 1;
});
