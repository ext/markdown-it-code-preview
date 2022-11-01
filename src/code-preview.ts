import fs from "node:fs";
import path from "node:path";
import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token";
import hljs from "highlight.js";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import esbuild from "esbuild";

function compile(code: string, language: string, filename: string): string {
	switch (language) {
		case "vue": {
			const { descriptor } = parse(code, { filename });

			const styleContent = descriptor.styles
				.map((stylePart) => {
					const css = compileStyle({
						filename,
						source: stylePart.content,
						id: `data-v-${filename}`,
					});
					return css.code;
				})
				.join("\n");

			let sourcecode = "";
			if (descriptor.script) {
				sourcecode += descriptor.script.content.replace(`export default`, "const defaultExport =");
			}

			if (descriptor.template) {
				const js = compileTemplate({
					id: filename,
					filename,
					source: descriptor.template.content,
					preprocessLang: descriptor.template.lang,
				});
				sourcecode += js.code;
				sourcecode += `\n\ndefaultExport.render = render`;
			}

			sourcecode += `\nVue.createApp(defaultExport).mount('#app');\n`;

			fs.mkdirSync("temp", { recursive: true });
			fs.writeFileSync("temp/input.js", sourcecode, "utf-8");
			esbuild.buildSync({
				entryPoints: ["temp/input.js"],
				outfile: "temp/output.js",
				bundle: true,
				format: "esm",
				external: [],
			});
			const scriptContent = fs.readFileSync("temp/output.js", "utf-8");

			return /* HTML */ `
				<div id="app"></div>
				<style>
					${styleContent}
				</style>
				<script type="module">
					${scriptContent};
				</script>
			`;
		}

		default:
			return code;
	}
}

export function codePreview(md: MarkdownIt): void {
	md.renderer.rules.fence = fence;
	return;

	function fence(tokens: Token[], idx: number): string {
		let { content } = tokens[idx];
		const { info } = tokens[idx];
		const [language2, ...tags] = info.split(/\s+/);
		let language = language2;

		if (language === "" || language === "plaintext") {
			return `<pre><code>${md.utils.escapeHtml(content)}</code></pre>`;
		}

		let filename = ":inline:";
		if (language === "import") {
			filename = content.trim();
			const parsed = path.parse(filename);
			content = fs.readFileSync(path.join("examples", filename), "utf-8");
			language = parsed.ext.slice(1);
		}

		const noPreview = tags.includes("nopreview");
		const noMarkup = tags.includes("nomarkup");

		const preview = compile(content, language, filename);
		const markup = hljs.highlight(content, {
			language: language === "vue" ? "html" : language,
		}).value;

		if (noPreview) {
			return /* HTML */ `
				<div class="code-preview">
					<pre
						class="code-preview__markup"
					><code class="hljs lang-${language}">${markup}</code></pre>
				</div>
			`;
		}

		if (noMarkup) {
			return /* HTML */ `
				<div class="code-preview">
					<div class="code-preview__preview">${preview}</div>
				</div>
			`;
		}

		return /* HTML */ `
			<div class="code-preview">
				<div class="code-preview__preview">${preview}</div>
				<pre class="code-preview__markup"><code class="hljs lang-${language}">${markup}</code></pre>
			</div>
		`;
	}
}
