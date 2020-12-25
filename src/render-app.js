
module.exports = renderApp;
function renderApp(context, compName) {
	return Promise.resolve({context, compName})
	.then(getAppComponent)
	.then(createApp)
	.then(renderAppString);
}

renderApp.getAppComponent = getAppComponent;
function getAppComponent({context, compName}) {
	const App = context.jsGlobal.scopeResolveComponent(compName);
	if (!App) throw new Error('App Component not found '+JSON.stringify(compName));
	return {context, App};
}

renderApp.createApp = createApp;
function createApp({ context, App }) {
	const { jsGlobal: { router, createSSRApp } } = context;
	const app = createSSRApp(App);
	app.use(router);
	return {context, app};
}

renderApp.renderAppString = renderAppString;
function renderAppString({context, app}) {
	// console.log('renderAppString', app, app.config);
	return context.renderToString(app);
}
