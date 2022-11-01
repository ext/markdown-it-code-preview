import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token";
import type Renderer from "markdown-it/lib/renderer";
import hljs from "highlight.js";

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
		const { content, info } = tokens[idx];
		const [language, ...tags] = info.split(/\s+/);

		if (language === "" || language === "plaintext") {
			return `<pre><code>${md.utils.escapeHtml(content)}</code></pre>`;
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
