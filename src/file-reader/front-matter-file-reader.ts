import fs from "node:fs/promises";
import path from "node:path";
import fm from "front-matter";
import { type Document, type DocumentAttributes } from "../document";

export async function frontMatterFileReader(
	filePath: string,
	basePath?: string
): Promise<Document[]> {
	const relative = basePath ? path.relative(basePath, filePath) : filePath;
	const parsed = path.parse(relative);
	const content = await fs.readFile(filePath, "utf-8");
	const blocks = fm<DocumentAttributes>(content);
	const doc: Document = {
		attributes: blocks.attributes,
		body: blocks.body,
		tag: "markdown",
		template: blocks.attributes.layout ?? "default",
		fileInfo: {
			path: parsed.dir !== "" ? parsed.dir : ".",
			name: parsed.name,
			fullPath: filePath,
		},
	};
	return [doc];
}
