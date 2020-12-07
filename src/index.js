const path = require('path');
const fs = require('fs');
const {
	getParser,
	Printer,
	printerTransform
} = require('@arijs/stream-xml-parser');
const { custom: extendCustom } = require('./utils/extend');
const { forEach } = require('./utils/function');
const allCallback = require('./utils/all-callback');
const { array: openDirArray } = require('./utils/open-dir');
const { reSlashStart, reSlashEnd } = require('./utils/regexes');
const initVueLoaders = require('./init-vue-loaders');
const {
	loadScriptsRouter,
	renderRouter,
} = require('./router');
const parseFile = require('./parse-file');
const { treeMetaDesc } = require('./node-utils');
const buildCssLinks = require('./build-css-links');
const buildCompScripts = require('./build-comp-scripts');

function defaultRouteToOutputPath(route) {
	return route.replace(reSlashEnd, '/index.html');
}

const optDefault = {
	pathRoot: null, //path.resolve(__dirname, '../../public'),
	comps: null,
	compOpt: null,
	jsCtx: {},
	jsGlobal: {},
	jsGlobalVar: '_app$',
	Vue: null,
	VueRouter: null,
	renderToString: null,
	vueLoaders: null,
	renderTasks: [
		['loadScripts', [
			// 		{ url: 'js/lib/function.js', after: `
			// ;this.forEach = forEach;
			// ` },
			'js/router.js',
			// { url: 'js/use.js' },
		]],
		['createRouter'],
		['routerPush', '/'],
		['loadComponent', 'app--root', 'appRoot'],
	],
	renderComponents: {
		appRoot: 'app--root'
	},
	route: '/',
	scripts: [
// 		{ url: 'js/lib/function.js', after: `
// ;this.forEach = forEach;
// ` },
		'js/router.js',
		// { url: 'js/use.js' },
	],
	htmlSourceFile: 'template.html',
	htmlTargetFile: defaultRouteToOutputPath
};
function nop() {}

module.exports = ssr;
function ssr(opt, ssrCallback) {

opt = extendCustom(null, optDefault, opt, opt);

var pathRoot = opt.pathRoot;

const vueLoaders = initVueLoaders({
	comps: opt.comps,
	compOpt: opt.compOpt,
	Vue: opt.Vue,
});
const { resolveUserComponent } = vueLoaders;

const {
	jsCtx,
	jsGlobal,
	jsGlobalVar,
	Vue,
	VueRouter,
	route,
	renderToString,
} = opt;

let {
	htmlTargetFile,
} = opt;

jsGlobal.originRoute = opt.route;
jsCtx[jsGlobalVar] = jsGlobal;
jsCtx.Vue = Vue;
jsCtx.VueRouter = VueRouter;

var historyState = {};
jsGlobal.getHistoryState = function() {
	return historyState;
};
jsGlobal.routerHistory = VueRouter.createMemoryHistory();

function printTagPath(path, printer) {
	var pc = path.length;
	for (var i = 0; i < pc; i++) {
		path[i] = '> '+i+': '+printer.printTagOpen(path[i]);
	}
	console.log(path.join('\n'));
}

loadScriptsRouter({
	jsGlobal,
	jsCtx,
	scripts: opt.scripts,
	callback: function(err) {
		if (err) {
			console.error('/** Error loading initial scripts or router **/');
			console.error(err);
			return;
		}
		const item = allCallback({
			list: [],
			onAdd: function(name) {
				const index = this.list.length;
				const obj = {
					name,
					index,
				};
				this.list.push(obj);
				return obj;
			},
			onDone: function(html) {
				const { _current: ref } = this;
				this.list[ref.index] = html;
			},
			onFinish: function() {
				opt.render = this.list;
				renderPage(opt);
			}
		});
		forEach(opt.render, function(rootCompName) {
			const done = item(rootCompName);
			renderRouter({
				Vue,
				resolveUserComponent,
				jsGlobal,
				rootCompName,
				route,
				renderToString,
				onRenderString: done,
			});
		});
	}
});

function renderPage(opt) {
	const { pathRoot } = opt;
	const parser = getParser();
	const fileSource = path.join(pathRoot, opt.htmlSourceFile);
	parseFile(fileSource, parser, function(parsed) {
		const error = parsed.error;
		if (error) {
			console.error('/** ERROR reading source file **/');
			console.error(': '+fileSource);
			console.error(error);
			return ssrCallback(error);
		}
		const elAdapter = parsed.elAdapter;
		const printer = new Printer();
		printer.elAdapter = elAdapter;
		const am = printerTransform.asyncMatcher(elAdapter);
		opt.addTransforms(am, opt.render, opt);
		return printerTransform.async({
			tree: parsed.tree,
			elAdapter: elAdapter,
			transform: am.transform,
			level: -1,
			callback: cbTransformed
		});
		function cbTransformed(err, page) {
			if (err) {
				console.error('/** ERROR printing Vue app into page **/');
				var efirst = err.shift();
				console.error(efirst);
				if (err.length) console.error(err);
				return ssrCallback(err);
			}
			console.log('/** Replaced nodes: **/');
			forEach(nodesRep, function(nrep) {
				console.log('  replace - '+nrep.replaced);
				// printTagPath(nrep.path, printer);
				// console.log('');
			});

			console.log('/** Fully rendered page **/');
			if (htmlTargetFile instanceof Function) {
				htmlTargetFile = htmlTargetFile(route);
			}
			var targetDir = htmlTargetFile.replace(reSlashStart, '').split('/');
			targetDir.pop();
			
			const fileTarget = path.join(pathRoot, htmlTargetFile);
			openDirArray(pathRoot, targetDir, function(err) {
				if (err) {
					console.error('/** Error creating directory **/');
					console.error(targetDir, err);
					return ssrCallback(err);
				}
				fs.writeFile(fileTarget, page, function(err) {
					if (err) {
						console.error('/** Error saving page to file **/');
						console.error(err);
						return ssrCallback(err);
					} else {
						console.log('/** Page saved to file! **/');
						return ssrCallback();
					}
				});
			});
		}
	});
}

}
