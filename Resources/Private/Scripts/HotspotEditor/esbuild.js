const esbuild = require("esbuild");
const extensibilityMap = require("@neos-project/neos-ui-extensibility/extensibilityMap.json");
const isWatch = process.argv.includes("--watch");

/** @type {import("esbuild").BuildOptions} */
const options = {
	logLevel: "info",
	bundle: true,
	target: "es2022",
	entryPoints: { Plugin: "src/index.js" },
	loader: { ".js": "jsx", ".ts": "tsx", ".tsx": "tsx" },
	outdir: "../../../Public/HotspotEditor",
	alias: extensibilityMap,
	jsx: "transform",
	minify: process.env.NODE_ENV === 'production'
};

if (isWatch) {
	esbuild.context({ ...options, sourcemap: true }).then((ctx) => ctx.watch());
} else {
	esbuild.build(options);
}
