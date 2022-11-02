import path from "node:path";
import { type Document } from "../document";

export interface NavigationNode {
	path: string;
	name: string;
	title: string;
	children: NavigationNode[];
}

function pathFromDoc({ fileInfo }: Document): string {
	if (fileInfo.name === "index") {
		return fileInfo.path;
	} else {
		return `./${path.join(fileInfo.path, fileInfo.name)}`;
	}
}

function getNode(name: string, tree: NavigationNode): NavigationNode {
	if (name === ".") {
		return tree;
	}
	const parts = name.split("/").slice(1);
	let path = ".";
	let node = tree;
	while (parts.length > 0) {
		const cur = parts.shift() as string;
		path = `${path}/${cur}`;
		const found = tree.children.find((it) => it.name === cur);
		if (found) {
			node = found;
		} else {
			const created: NavigationNode = {
				path,
				name: cur,
				title: "",
				children: [],
			};
			node.children.push(created);
			node = created;
		}
	}
	return node;
}

export function generateNavtree(docs: Document[]): NavigationNode {
	const root: NavigationNode = {
		path: ".",
		name: ".",
		title: "",
		children: [],
	};
	for (const doc of docs) {
		const name = pathFromDoc(doc);
		const node = getNode(name, root);
		node.title = doc.attributes.title ?? doc.fileInfo.name;
		if (doc.fileInfo.name === "index") {
			node.path += "/index.html";
		} else {
			node.path += ".html";
		}
	}
	return root;
}
