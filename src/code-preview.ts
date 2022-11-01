import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
import Renderer from "markdown-it/lib/renderer";

function fence(
	tokens: Token[],
	idx: number,
	options: MarkdownIt.Options,
	env: any,
	self: Renderer
): string {
	return "asdf";
}

export function codePreview(md: MarkdownIt): void {
	md.renderer.rules.fence = fence;
}
