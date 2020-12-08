
module.exports = renderApp;
function renderApp(context, vueLoaders, compName) {
	return Promise.resolve({context, vueLoaders, compName})
	.then(getAppComponent)
	// .then(routerPush)
	.then(createApp)
	.then(renderAppString);
}

renderApp.getAppComponent = getAppComponent;
function getAppComponent({context, vueLoaders, compName}) {
	const { resolveUserComponents } = vueLoaders;
	const App = resolveUserComponents(compName);
	if (!App) throw new Error('App Component not found '+JSON.stringify(compName));
	return {context, App};
}

// renderApp.routerPush = routerPush;
// function routerPush({ context, App, route }) {
// 	const { jsGlobal: { router } } = context;
// 	router.push(route || '/');
// 	return router.isReady().then(function() {
// 		return {context, App};
// 	});
// }

renderApp.createApp = createApp;
function createApp({ context, App }) {
	const { jsGlobal: { router }, Vue } = context;
	const app = Vue.createSSRApp(App);
	app.use(router);
	return {context, app};
}

renderApp.renderAppString = renderAppString;
function renderAppString({context, app}) {
	return context.renderToString(app);
}
