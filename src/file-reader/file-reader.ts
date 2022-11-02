import { type Document } from "../document";

export interface FileReader {
	(filePath: string, basePath?: string): Promise<Document[]>;
}
