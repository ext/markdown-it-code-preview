import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import markdownIt from "markdown-it";
import nunjucks, { type LoaderSource, type ILoader, type Callback } from "nunjucks";
import { type FileInfo, type Document } from "../document";
import { codePreview } from "../code-preview";
import { type NavigationNode } from "../navigation";

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

class Loader {
	public async = true;

	public async getSource(name: string, callback: Callback<Error, LoaderSource>): Promise<void> {
		const filePath = path.join("templates", name);
		try {
			const content = await fs.readFile(filePath, "utf-8");
			callback(null, {
				src: content,
				path: filePath,
				noCache: false,
			});
		} catch (err: unknown) {
			if (err instanceof Error) {
				callback(err, null);
			} else {
				callback(new Error(String(err)), null);
			}
		}
	}
}

const md = markdownIt("commonmark");
md.use(codePreview);
md.use(headingLevel(2));

const loader = new Loader() as unknown as ILoader;
const njk = new nunjucks.Environment(loader, {
	autoescape: false,
});
njk.addFilter("marked", (content: string) => {
	return md.render(content);
});
njk.addFilter("dump", (value: unknown) => {
	return `<pre>${JSON.stringify(value, null, 2)}</pre>`;
});
njk.addFilter("relative", (url: string, { fileInfo }: { fileInfo: FileInfo }) => {
	const outputFile = `./${path.join(fileInfo.path)}`;
	return path.relative(outputFile, url);
});

/* eslint-disable-next-line @typescript-eslint/unbound-method */
const renderTemplate = promisify<string, object, string>(njk.render).bind(njk);

export async function render(
	outputFolder: string,
	doc: Document,
	nav: NavigationNode
): Promise<void> {
	const { fileInfo } = doc;
	const dst = path.join(outputFolder, fileInfo.path, `${fileInfo.name}.html`);
	const category = fileInfo.path.split("/")[1];
	const topnav = nav;
	const sidenav = category ? nav.children.find((it) => it.name === category) : undefined;

	const context = {
		doc,
		topnav,
		sidenav,
		versions: {
			hljs: hljsVersion,
			vue: vueVersion,
		},
	};

	const template = `${doc.template}.template.html`;
	const content = await renderTemplate(template, context);

	await fs.mkdir(path.dirname(dst), { recursive: true });
	await fs.writeFile(dst, content ?? "null", "utf-8");
}
