import path from "node:path";
import { Document } from "../document";
import { generateNavtree } from "./generate-navtree";

function createDocument(filePath: string, title: string): Document {
	const parsed = path.parse(filePath);
	return {
		attributes: {
			title,
		},
		body: "",
		tag: "markdown",
		template: "mock",
		fileInfo: {
			path: parsed.dir !== "" ? `./${parsed.dir}` : ".",
			name: parsed.name,
			fullPath: filePath,
		},
	};
}

it("should create root node", () => {
	const nav = generateNavtree([]);
	expect(nav).toMatchInlineSnapshot(`
		{
		  "children": [],
		  "name": ".",
		  "path": ".",
		  "title": "",
		}
	`);
});

it("should merge root index.md to root node", () => {
	const nav = generateNavtree([createDocument("index.md", "Frontpage")]);
	expect(nav).toMatchInlineSnapshot(`
		{
		  "children": [],
		  "name": ".",
		  "path": "./index.html",
		  "title": "Frontpage",
		}
	`);
});

it("should create children for each folder", () => {
	const nav = generateNavtree([
		createDocument("index.md", "Frontpage"),
		createDocument("usage/index.md", "Usage guide"),
		createDocument("components/index.md", "Components"),
	]);
	expect(nav).toMatchInlineSnapshot(`
		{
		  "children": [
		    {
		      "children": [],
		      "name": "usage",
		      "path": "./usage/index.html",
		      "title": "Usage guide",
		    },
		    {
		      "children": [],
		      "name": "components",
		      "path": "./components/index.html",
		      "title": "Components",
		    },
		  ],
		  "name": ".",
		  "path": "./index.html",
		  "title": "Frontpage",
		}
	`);
});

it("should create children for subpages", () => {
	const nav = generateNavtree([
		createDocument("index.md", "Frontpage"),
		createDocument("a/index.md", "A"),
		createDocument("a/foo.md", "A > Foo"),
		createDocument("a/bar.md", "A > Bar"),
		createDocument("b/index.md", "B"),
		createDocument("b/foo.md", "B > Foo"),
		createDocument("b/bar.md", "B > Bar"),
	]);
	expect(nav).toMatchInlineSnapshot(`
		{
		  "children": [
		    {
		      "children": [
		        {
		          "children": [],
		          "name": "foo",
		          "path": "./a/foo.html",
		          "title": "A > Foo",
		        },
		        {
		          "children": [],
		          "name": "bar",
		          "path": "./a/bar.html",
		          "title": "A > Bar",
		        },
		      ],
		      "name": "a",
		      "path": "./a/index.html",
		      "title": "A",
		    },
		    {
		      "children": [
		        {
		          "children": [],
		          "name": "foo",
		          "path": "./b/foo.html",
		          "title": "B > Foo",
		        },
		        {
		          "children": [],
		          "name": "bar",
		          "path": "./b/bar.html",
		          "title": "B > Bar",
		        },
		      ],
		      "name": "b",
		      "path": "./b/index.html",
		      "title": "B",
		    },
		  ],
		  "name": ".",
		  "path": "./index.html",
		  "title": "Frontpage",
		}
	`);
});
