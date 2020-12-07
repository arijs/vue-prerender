
exports.renderApp = renderApp;
function renderApp(context, vueLoaders, compName, route) {
	return Promise.resolve({context, vueLoaders, compName, route})
	.then(getAppComponent)
	.then(routerPush)
	.then(createApp)
	.then(renderAppString);
}

exports.getAppComponent = getAppComponent;
function getAppComponent({context, vueLoaders, compName, route}) {
	const { resolveUserComponents } = vueLoaders;
	const App = resolveUserComponents(compName);
	if (!App) throw new Error('App Component not found '+JSON.stringify(compName));
	return {context, App, route};
}

exports.routerPush = routerPush;
function routerPush({ context, App, route }) {
	const { jsGlobal: { router } } = context;
	router.push(route || '/');
	return router.isReady().then(function() {
		return {context, App};
	});
}

exports.createApp = createApp;
function createApp({ context, App }) {
	const { jsGlobal: { router }, Vue } = context;
	const app = Vue.createSSRApp(App);
	app.use(router);
	return {context, app};
}

exports.renderAppString = renderAppString;
function renderAppString({context, app}) {
	return context.renderToString(app);
}
