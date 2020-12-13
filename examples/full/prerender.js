const Vue = require('vue');
const VueRouter = require('vue-router');
const { compile } = require('@vue/compiler-dom');
const { renderToString } = require('@vue/server-renderer');
const { minify } = require('terser');
const {
	initContext,
	initVueLoaders,
	initScripts,
	routerPush,
	renderApp,
	parseHtml,
	printHtml,
	buildCssLinks,
	buildCompScripts,
	nodeUtils: { treeMetaDesc },
	routeToOutput,
	writeFile,
	utils: {
		fn: { forEach },
		inspect: { inspectObj }
	}
} = require('@arijs/vue-prerender');
const appPath = require('./app-path');
const services = require('./services');

function rightPad(str, num, chr = ' ') {
	var len = str.length;
	var clen = chr.length;
	if (len >= num) return str;
	while (len < num) {
		str += chr;
		len += clen;
	}
	return str.substr(0, num);
}

function pgProdServ(path) {
	return { route: '/produtos-e-servicos/' + path };
}

var reCaseName = /^[\w-]+$/;
function pgCases(path) {
	if (!reCaseName.test(path)) {
		throw new Error('Invalid case name: '+JSON.stringify(path));
	}
	return { route: '/cases/' + path };
}

var pages = [
	{ route: '/' },
	{ route: '/sobre-nos' },
	{ route: '/produtos-e-servicos' },
	pgProdServ('tech-and-development'),
	pgProdServ('bi-and-analytics'),
	pgProdServ('ux-ui'),
	pgProdServ('app-para-eventos'),
	pgProdServ('autoetl'),
	{ route: '/cases' },
	{ route: '/contato' }
];
var pgSuccess = [];
var pgError = [];

var oRC = Vue.resolveComponent.bind(Vue);
var oRDC = Vue.resolveDynamicComponent.bind(Vue);
var customRC;
var customRDC;

Vue.resolveComponent = function() {
	return (customRC || oRC).apply(this, arguments);
};
Vue.resolveDynamicComponent = function() {
	return (customRDC || oRDC).apply(this, arguments);
};

services.getCasesLista({
	cb: function({ error, data }) {
		if (error) {
			console.error('Error when retrieving the cases', error);
			return;
		}
		console.log('/** Cases loaded **/');
		forEach(data.data, function(item) {
			pages.push(pgCases(item.name));
		});
		// console.log(pages);
		console.log('/** :: START :: **/');
		runNext();
	}
});

function runOrNot(next) {
	return true;
	// this is a helper function to filter the pages to render
	// when you need to troubleshoot some specific pages.
	// return false
	// 	|| ('/' === next.route)
	// 	|| ('/sobre-nos' === next.route)
	// 	|| ('/produtos-e-servicos' === next.route);
	// 	|| ('/cases/apas-show' === next.route)
	// 	|| ('/cases/raizen' === next.route)
	// 	|| ('/cases/clube-bravecto' === next.route);
}

function runNext() {
	var next = pages.shift();
	if (next) {
		if (!runOrNot(next)) {
			return setTimeout(runNext, 0);
		}
		ssr(next).then(function(){
			pgSuccess.push(next);
			console.log('ok!');
			setTimeout(runNext, 50);
		}).catch(function(err) {
			pgError.push({
				pg: next,
				err
			});
			console.log('FAIL');
			console.error(err);
			// stop processing in case of error
			// setTimeout(runNext, 50);
		});
	} else {
		var ec = pgError.length;
		if (ec) {
			console.error(ec + ( 1 == ec
				? ' page'
				: ' pages' ) +
				' had errors during rendering'
			);
			console.error(pgError);
		}
		var sc = pgSuccess.length;
		console.log(sc + ( 1 == sc
			? ' page'
			: ' pages') +
			' rendered successfully'
		);
		// another way to print the rendered files below
		// forEach(pgSuccess, function(pg) {
		// 	console.log(`${rightPad(pg.route, 40)} → ${pg.outputPath}`);
		// });
	}
}

function ssr(next, oldVars) {
	let context, vueLoaders, rootHtml;
	// The "isDebug" variable below can be used to print useful
	// information when you have to debug the render process.
	let isDebug = false;//'/cases/raizen' === next.route;
	return Promise.resolve().then(function() {
		console.log('\n  --- init --- '+next.route);
		return initContext({
			jsGlobalVar: '_app$',
			jsGlobal: {
				originRoute: next.route,
				services,
				defineAsyncComponent: Vue.defineAsyncComponent,
				createSSRApp: Vue.createSSRApp,
				originalResolveComponent: function() {
					return oRC.apply(this, arguments);
				},
				originalResolveDynamicComponent: function() {
					return oRDC.apply(this, arguments);
				},
				scopeResolveComponent: function() {
					return customRC.apply(this, arguments);
				},
				scopeResolveDynamicComponent: function() {
					return customRDC.apply(this, arguments);
				},
				log: function() {
					console.log(inspectObj(arguments, 2));
				}
			},
			jsCtx: {
				forEach
			},
			storeLoads: true,
			Vue,
			VueRouter,
			compile,
			renderToString
		});
	}).then(function(ctx) {
		context = ctx;
		return initVueLoaders(ctx, [
			{
				name: 'Comp',
				prefix: 'app--',
				basePath: appPath('comp/'),
				relPath: '/comp/'
			},
			{
				name: 'Page',
				prefix: 'page--',
				basePath: appPath('page/'),
				relPath: '/page/'
			},
			{
				name: 'Block',
				prefix: 'block--',
				basePath: appPath('block/'),
				relPath: '/block/'
			}
		], isDebug && {
			onResolveDefined(match, name) {
				var r = JSON.stringify(next.route);
				console.log('/** user component predefined from '+r+' **/', match.name, name);
			},
			onResolveFound(match, name) {
				var r = JSON.stringify(next.route);
				console.log('/** user component found from '+r+' **/', match.name, name);
			},
			onResolveNotFound(name) {
				var r = JSON.stringify(next.route);
				console.log('/** user component NOT found from '+r+' **/', name);
			}
		});
	}).then(function(vload) {
		vueLoaders = vload;
		{
			({
				resolveComponent: customRC,
				resolveDynamicComponent: customRDC,
			} = vload);
		}
		return initScripts(context.jsCtx, [
			appPath('js/isomorphic/router.js'),
			appPath('js/isomorphic/use.js'),
			appPath('js/prerender/use.js')
		]);
	}).then(function() {
		context.jsGlobal.initRouter();
		return routerPush(context, next.route);
	}).then(function() {
		return Promise.all([
			renderApp(context, vueLoaders, 'app--root')
		]);
	}).then(function([renderedRootHtml]) {
		rootHtml = renderedRootHtml;
		return parseHtml(appPath('template.html'));
	}).then(function(htmlParsed) {
		const { elAdapter } = htmlParsed;
		return printHtml(htmlParsed, {}, [
			{
				name: 'comp html',
				matcher: {
					name: 'div',
					attrs: [['id', 'root'], [null, null, '<0>']],
					path: ['html', 'body']
				},
				callback: function(opt) {
					return opt.callback(null, {
						name: 'comp html',
						noFormat: true,
						children: {text: rootHtml, noFormat: true}
					});
				}
			},
			{
				name: 'comp css',
				matcher: {
					name: 'head',
					path: ['html']
				},
				callback: function(opt) {
					return opt.callback(null, {
						name: 'comp css',
						append: {tree: buildCssLinks(vueLoaders.getCompsCss(), elAdapter)}
					});
				}
			},
			{
				name: 'comp scripts',
				matcher: {
					name: 'script',
					attrs: [['src', '/js/browser/index.js'], [null, null, '<0>']],
					path: ['html', 'body']
				},
				callback: function(opt) {
					return buildCompScripts({
						list: vueLoaders.getCompsLoad(),
						elAdapter,
						globalVar: context.jsGlobalVar,
						jsInitialState: context.jsGlobal.services.cacheFront,
						compile: context.compile,
						formatJs: minify,
						callback: function(err, text) {
							return opt.callback(err, {
								name: 'comp scripts',
								after: {text: text, noFormat: true}
							});
						}
					}), true;
				}
			},
			{
				name: 'doc title',
				matcher: {
					name: 'title',
					attrs: [[null, null, '<0>']],
					path: ['html', 'head']
				},
				callback: function(opt) {
					var meta = context.jsGlobal.getDocMeta();
					if (!(meta && meta.title)) {
						return opt.callback();
					}
					return opt.callback(null, {
						name: 'doc title',
						noFormat: true,
						children: {text: meta.title, noFormat: true}
					});
				}
			},
			{
				name: 'doc desc',
				matcher: {
					name: 'meta',
					attrs: [['name', 'description'], ['content', null], [null, null, '<0>']],
					path: ['html', 'head']
				},
				callback: function(opt) {
					var meta = context.jsGlobal.getDocMeta();
					if (!(meta && meta.description)) {
						return opt.callback();
					}
					return opt.callback(null, {
						name: 'doc desc',
						full: {tree: treeMetaDesc(opt.node, meta.description, elAdapter)}
					});
				}
			}
		]);
	}).then(function({page, nodesRep}) {
		vueLoaders.destroy();
		nodesRep = forEach(nodesRep, [], function(nr) {
			this.result.push(nr.replaced);
		});
		console.log('  --- rep --- ' + nodesRep.join(' - '));
		const outputPath = next.outputPath = routeToOutput(next.route);
		return writeFile(appPath('.'), outputPath, page);
	}).then(function() {
		console.log('  --- out --- '+next.outputPath);
	});
}
