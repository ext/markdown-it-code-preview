import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import dedent from "dedent";
import markdownIt from "markdown-it";
import { type Document } from "../document";
import { codePreview } from "../code-preview";

const pkg = JSON.parse(readFileSync("package.json", "utf-8")) as {
	devDependencies: Record<string, string>;
};
const hljsVersion = pkg.devDependencies["highlight.js"];
const vueVersion = pkg.devDependencies.vue;

function headingLevel(initial: number): (md: markdownIt) => void {
	const offset = initial - 1;
	return function (md: markdownIt): void {
		/* eslint-disable-next-line camelcase */
		md.renderer.rules.heading_open = function (tokens, idx) {
			const { tag } = tokens[idx];
			return tag.replace(/h(\d)/, (_, n: string) => `<h${parseInt(n, 10) + offset}>`);
		};
		/* eslint-disable-next-line camelcase */
		md.renderer.rules.heading_close = function (tokens, idx) {
			const { tag } = tokens[idx];
			return tag.replace(/h(\d)/, (_, n: string) => `</h${parseInt(n, 10) + offset}>`);
		};
	};
}

const layout = (content: string): string =>
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
				<script
					src="https://cdnjs.cloudflare.com/ajax/libs/vue/${vueVersion}/vue.global.min.js"
					integrity="sha512-lgbnN1gNswbc8DPmFF2F9n951EGPK0p9PmPkzECHyjC4bmv6Be6ezWQB7mIjPJ5pAdYehSj+Nm0brW0NjCoFmQ=="
					crossorigin="anonymous"
					referrerpolicy="no-referrer"
				></script>
			</head>
			<body>
				<header>
					<h1>My awesome site!</h1>
					<nav>
						<a href="./index.html">HTML/CSS</a>
						<a href="./import.html">Importing files</a>
						<a href="./vue.html">Vue</a>
					</nav>
				</header>
				<main>${content}</main>
			</body>
		</html>
	`);

const md = markdownIt("commonmark");
md.use(codePreview);
md.use(headingLevel(2));

export async function render(outputFolder: string, doc: Document): Promise<void> {
	const { fileInfo } = doc;
	const dst = path.join(outputFolder, fileInfo.path, `${fileInfo.name}.html`);
	await fs.mkdir(path.dirname(dst), { recursive: true });
	const html = md.render(doc.body);
	await fs.writeFile(dst, layout(html), "utf-8");
}
