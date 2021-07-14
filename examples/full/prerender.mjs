import Vue, { createSSRApp } from 'vue';
import VueRouter from 'vue-router';
import { compile } from '@vue/compiler-dom';
import { renderToString } from '@vue/server-renderer';
import { minify } from 'terser';

import {
	loaders,
	routerPush,
	renderApp,
	parseHtml,
	printHtml,
	buildCssLinks,
	buildCompScripts,
	nodeUtils,
	routeToOutput,
	writeFile,
	frontend,
} from '@arijs/vue-prerender';
const { treeMetaDesc } = nodeUtils;
const {
	utils: { forEach, numberString: { numberFormat } },
} = frontend;
const { scriptQueue, initVueLoaders } = loaders;

import appPath from './app-path.mjs';
import services from './services.mjs';

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

function nop() {};

var oRC = Vue.resolveComponent;
var oRDC = Vue.resolveDynamicComponent;
var customResolve = nop;

function resolveComponent() {
	return customResolve.apply(this, arguments)
		|| oRC.apply(this, arguments);
}
function resolveDynamicComponent() {
	return customResolve.apply(this, arguments)
		|| oRDC.apply(this, arguments);
}

Vue.resolveComponent = resolveComponent;
Vue.resolveDynamicComponent = resolveDynamicComponent;

console.log('/** Before cases loaded **/');

services.setDebug(false);
services.getCasesLista().then(function(data) {
	console.log('/** Cases loaded **/');
	forEach(data.data, function(item) {
		pages.push(pgCases(item.name));
	});
	// console.log(pages);
	console.log('/** :: START :: **/');
	setTimeout(runNext, 0);
}).catch(function(error) {
	console.error('Erro ao buscar os cases', error);
});

function runOrNot(next) {
	return true;
	// for testing specific pages
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
			// stop in case of error
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
		// console.log(pgSuccess);
		false && forEach(pgSuccess, function(pg) {
			console.log(`${rightPad(pg.route, 40)} → ${pg.outputPath}`);
		});
	}
}

async function ssr(next) {
	const dtStart = new Date();
	// debug flag below
	// it can be global or for specific routes
	// const isDebug = '/debug/specific/route' === next.route;
	const isDebug = false;
	services.setDebug(isDebug);

	console.log('\n  --- init --- '+next.route);

	const jsGlobal = {
		originRoute: next.route,
		services,
	};
	const jsGlobalVar = '_app$';
	const jsContext = {
		[jsGlobalVar]: jsGlobal,
		Vue,
		VueRouter,
		forEach,
	};

	const vueLoaders = await initVueLoaders([
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
	], {
		onResolveDefined: isDebug && function(match, name) {
			var r = JSON.stringify(next.route);
			console.log('/** user component predefined from '+r+' **/', match.name, name);
		},
		onResolveFound: isDebug && function(match, name) {
			var r = JSON.stringify(next.route);
			console.log('/** user component found from '+r+' **/', match.name, name);
		},
		onResolveNotFound: isDebug && function(name) {
			var r = JSON.stringify(next.route);
			console.log('/** user component NOT found from '+r+' **/', name);
		},
		Vue,
		compile,
		jsGlobal,
		jsContext,
		jsOnError: function(error, jsRef) {
			console.error('Script error in', jsRef.url);
		}
	});

	console.log(' +  init vue load');

	({
		resolveAsyncComponent: customResolve,
	} = vueLoaders);

	await scriptQueue({ jsContext, queue: [
		appPath('js/isomorphic/router.js'),
		appPath('js/isomorphic/use.js'),
		appPath('js/prerender/use.js'),
	], processResult: function(req) {
		if (isDebug) console.log(' +  script load', req.url, inspect(jsGlobal, 1, 32));
	} });

	console.log(' +  init scripts');

	jsGlobal.initRouter();
	const { router } = jsGlobal;

	await routerPush({ router, route: next.route });

	console.log(' +  router pushed', next.route);

	const [rootHtml] = await Promise.all([
		renderApp({
			componentName: 'app--root',
			resolveComponent,
			router,
			createSSRApp,
			renderToString,
		})
	]);

	console.log(' +  page root component rendered', String(rootHtml).length, 'bytes');

	const htmlParsed = await parseHtml(appPath('template.html'));
	const { elAdapter } = htmlParsed;

	let {page, nodesRep} = await printHtml(htmlParsed, {}, [
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
					jsGlobalVar,
					jsInitialState: services.cacheFront,
					compile,
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
				var meta = jsGlobal.getDocMeta();
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
				var meta = jsGlobal.getDocMeta();
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

	console.log(' +  page printed', String(page).length, 'bytes');

	vueLoaders.destroy();

	nodesRep = forEach(nodesRep, [], function(nr) {
		this.result.push(nr.replaced);
	});

	console.log('  --- rep --- ' + nodesRep.join(' - '));

	const outputPath = next.outputPath = routeToOutput(next.route);

	await writeFile(appPath('.'), outputPath, page);

	const dtEnd = new Date();
	console.log('  --- out --- '+numberFormat((dtEnd.getTime()-dtStart.getTime())*0.001,1)+'s '+outputPath);
}
