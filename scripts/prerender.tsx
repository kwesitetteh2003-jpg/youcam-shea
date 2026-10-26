// Renders the first paint to static HTML so the hero photo and headline arrive
// with the document instead of after the JS bundle boots. The client hydrates it.
import { readFileSync, writeFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import App from "../src/App";

const file = new URL("../dist/index.html", import.meta.url);
const html = readFileSync(file, "utf8");
const body = renderToString(<App />);
if (!html.includes('<div id="root"></div>')) throw new Error("root div not found");
writeFileSync(file, html.replace('<div id="root"></div>', `<div id="root">${body}</div>`));
console.log(`prerendered ${(body.length / 1024).toFixed(1)} KB of HTML`);
