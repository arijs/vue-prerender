const path = require('path');
const extend = require('./utils/extend');
const { forEach } = require('./utils/function');
const loadScriptQueue = require('./loaders/script-queue');
// const {
// 	renderToString,
// } = require('@vue/server-renderer');

function defaultErrorScriptQueue(err) {
	return console.error('/** error loading script queue **/', err);
}
function defaultErrorRouter() {
	return console.error('/** vue router instance not found **/');
}

exports.loadScriptsRouter = loadScriptsRouter;
function loadScriptsRouter(opt) {
	const {
		jsGlobal,
		jsCtx,
		scripts,
	} = opt;
	forEach(scripts, function(item, i) {
		scripts[i] = extend({}, item, {
			url: path.resolve(opt.pathRoot, item.url),
			ctx: item.ctx instanceof Function
				? item.ctx(opt)
				: item.ctx || jsCtx
		});
	});
	loadScriptQueue(scripts, function(err) {
		console.log('/** loadScriptQueue **/');
		if (err) {
			return opt.callback(err);
		} else if (!(jsGlobal.initRouter instanceof Function)) {
			return opt.callback(new Error('jsGlobal.initRouter not found'));
		}
		try {
			jsGlobal.initRouter();
		} catch (e) {
			return opt.callback(e);
		}
		if (!jsGlobal.router) {
			return opt.callback(new Error('Vue router instance not found'));
		} else {
			// jsGlobal.logRouteWithModal('ssr/router.1', jsGlobal.router.currentRoute);
			return opt.callback();
		}
	}, ctx);
}

exports.routerCreate = routerCreate;
function routerCreate(opt) {
	return new Promise(function(resolve, reject) {
		const {
			jsGlobal,
			VueRouter,
		} = opt;
		try {
			jsGlobal.initRouter(VueRouter.createMemoryHistory());
		} catch (e) {
			return reject(e);
		}
		if (!jsGlobal.router) {
			return reject(new Error('Vue router instance not found on routerCreate()'));
		} else {
			resolve();
		}
	});
}

exports.routerRender = routerRender;
function routerRender(opt) {
	const { jsGlobal: { router } } = opt;
	router.push(opt.route);
	return router.isReady();
}

exports.renderRouter = renderRouter;
function renderRouter(opt) {
	const {
		Vue,
		resolveUserComponent,
		jsGlobal,
	} = opt;

	return (opt.onGetApp || defaultGetApp)(opt.rootCompName, function(err, App) {
		if (err) {
			(opt.onErrorGetApp || defaultGetAppError)(err);
		} else {
			(opt.renderApp || defaultRenderApp)(App, jsGlobal.router, opt.route, function(err, app) {
				if (err) {
					(opt.onErrorRouterReady || defaultErrorRouterReady)(err);
				} else {
					(opt.renderAppToString || defaultRenderAppToString)(opt, app);
				}
			})
		}
	});

	function defaultGetApp(name, cb) {
		var App = resolveUserComponent(name);
		if (App) {
			cb(undefined, App);
		} else {
			cb(new Error('! Component not found '+JSON.stringify(name)));
		}
	}
	function defaultRenderApp(App, router, route, cb) {
		console.log('/** App root loaded **/')
	
		router.push(route || '/');
		console.log('/** vue router push called **/');
		// jsGlobal.logRouteWithModal('ssr/router.2', router.currentRoute);
	
		router.isReady().then(function() {

			const app = Vue.createSSRApp(App);
			app.use(router);
			console.log('/** app created **/');

			// jsGlobal.logRouteWithModal('ssr/router:ready.1', router.currentRoute);
			cb(undefined, app);
		}).catch(function(err) {
			cb(err);
		});
	}
}
function defaultGetAppError(err) {
	return console.error('/** vue get root app error **/', err);
}
function defaultErrorRouterReady(err) {
	return console.error('/** vue router isready error **/', err);
}

function defaultRenderAppToString(opt, app) {
	opt.renderToString(app)
		.then(renderAppToStringSuccess)
		.catch(opt.onRenderStringError || defaultRenderAppToStringError);
	function renderAppToStringSuccess(html) {
		var fn = opt.onRenderString || defaultRenderAppToStringSuccess
		fn(html);
	}
}
function defaultRenderAppToStringSuccess(html) {
	console.log('/** vue app HTML rendered **/');
	console.log(html);
}
function defaultRenderAppToStringError(err) {
	console.error('/** vue app renderToString error **/', err);
}
