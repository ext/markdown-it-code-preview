export interface DocumentAttributes {
	title?: string;
	layout?: string;
}

export interface FileInfo {
	/* path relative to configured base */
	path: string;
	/* filename without extension */
	name: string;
	/* path relative to project root */
	fullPath: string;
}

export interface Document {
	attributes: DocumentAttributes;
	body: string;
	tag: "markdown";
	template: string;
	fileInfo: FileInfo;
}
