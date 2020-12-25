
export function renderApp(opt) {
	return Promise.resolve(opt)
	.then(getAppComponent)
	.then(createApp)
	.then(renderAppString);
}

export function getAppComponent(opt) {
	const cname = opt.componentName;
	const App = opt.resolveComponent(cname);
	if (!App) throw new Error('App Component not found '+JSON.stringify(cname));
	opt.App = App;
	return opt;
}

export function createApp(opt) {
	const { router, createSSRApp, App } = opt;
	const app = createSSRApp(App);
	app.use(router);
	opt.app = app;
	return opt;
}

export function renderAppString(opt) {
	// console.log('renderAppString', app, app.config);
	var promise = opt.renderToString(opt.app);
	return opt.returnObject
		? promise.then(function(appString) {
			opt.appString = appString;
			return opt;
		})
		: promise;
}
