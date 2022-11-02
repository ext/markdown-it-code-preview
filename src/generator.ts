import { promisify } from "node:util";
import globCb from "glob";
import { type FileReader } from "./file-reader";
import { render } from "./render";
import { type Document } from "./document";

export { type FileReader, frontMatterFileReader } from "./file-reader";

export interface SourceFiles {
	include: string | string[];
	exclude?: string | string[];
	basePath?: string;
	fileReader: FileReader;
}

export interface GeneratorOptions {
	sourceFiles: SourceFiles[];
	outputFolder: string;
}

const glob = promisify(globCb);

function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
	const _difference = new Set(a);
	for (const elem of b) {
		_difference.delete(elem);
	}
	return _difference;
}

async function globAll(pattern: string | string[] | undefined): Promise<Set<string>> {
	if (!pattern) {
		return new Set();
	}

	if (!Array.isArray(pattern)) {
		return globAll([pattern]);
	}

	const results = await Promise.all(pattern.map((it) => glob(it)));
	return new Set(results.flat());
}

async function getDocumentsForSource(src: SourceFiles): Promise<Document[]> {
	const include = await globAll(src.include);
	const exclude = await globAll(src.exclude);
	const files = Array.from(difference(include, exclude));
	const docs = await Promise.all(files.map((it) => src.fileReader(it, src.basePath)));
	return docs.flat();
}

async function getAllDocuments({ sourceFiles }: GeneratorOptions): Promise<Document[]> {
	const result = await Promise.all(sourceFiles.map(getDocumentsForSource));
	return result.flat();
}

export async function generator(options: GeneratorOptions): Promise<void> {
	/* eslint-disable-next-line tsdoc/syntax */
	/** @TODO async generator? */
	const docs = await getAllDocuments(options);
	await Promise.all(
		docs.map((doc) => {
			return render(options.outputFolder, doc);
		})
	);
}
