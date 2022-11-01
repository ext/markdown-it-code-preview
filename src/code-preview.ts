import fs from "node:fs";
import path from "node:path";
import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token";
import type Renderer from "markdown-it/lib/renderer";
import hljs from "highlight.js";
import { fstat } from "fs";

export function codePreview(md: MarkdownIt): void {
	md.renderer.rules.fence = fence;
	return;

	function fence(
		tokens: Token[],
		idx: number,
		_options: MarkdownIt.Options,
		_env: any,
		_self: Renderer
	): string {
		let { content } = tokens[idx];
		const { info } = tokens[idx];
		let [language, ...tags] = info.split(/\s+/);

		if (language === "" || language === "plaintext") {
			return `<pre><code>${md.utils.escapeHtml(content)}</code></pre>`;
		}

		if (language === "import") {
			const filename = content.trim();
			const parsed = path.parse(filename);
			console.log(filename);
			content = fs.readFileSync(path.join("examples", filename), "utf-8");
			language = parsed.ext.slice(1);
		}

		const noPreview = tags.includes("nopreview");
		const noMarkup = tags.includes("nomarkup");

		const preview = content;
		const markup = hljs.highlight(content, { language }).value;

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
					<div class="code-preview__preview">${content}</div>
				</div>
			`;
		}

		return /* HTML */ `
			<div class="code-preview">
				<div class="code-preview__preview">${content}</div>
				<pre class="code-preview__markup"><code class="hljs lang-${language}">${markup}</code></pre>
			</div>
		`;
	}
}
