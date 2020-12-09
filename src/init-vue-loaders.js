const initCompLoaders = require('./loaders/init-comp-loaders');

module.exports = initVueLoaders;
function initVueLoaders(context, comps) {

let Vue;
let originalResolveComponent;
let originalResolveDynamicComponent;

let {
	forEachComp,
	jsCtxReplace,
	getCompsCss,
	getCompsLoad,
	mapClear,
	resolveUserCompLoader,
	resolveUserComponents,
} = initCompLoaders(context, comps);

let wrapLoaderPromise = function (loader, name) {
	// lconsole.log(': gal/wlp', originRoute, name);
	return function() {
		// lconsole.log(': gal/wlp-load', originRoute, name);
		return new Promise(function(resolve, reject) {
			// console.log('## load comp loader: '+name);
			loader().then(resolve).catch(reject);
		});
	};
}

let compAsyncLoad = function (loader, name) {
	// lconsole.log(': gal/cal', originRoute, name);
	return Vue.defineAsyncComponent({
		loader: wrapLoaderPromise(loader, name),
		name: 'loader--'+name
	});
}

let resolveUserComponent = function (name) {
	// lconsole.log(': gal/ruc', originRoute, name);
	var loader = resolveUserCompLoader(name);
	return loader && compAsyncLoad(loader, name);
}

let fnResolveUserComponents = function (name) {
	return resolveUserComponents(name, compAsyncLoad);
}

let resolveComponent = function (name) {
	console.log(
		'  - resolveComp '+JSON.stringify(name)+
		' from '+JSON.stringify(context.jsGlobal.originRoute)
	);
	return resolveUserComponents(name, compAsyncLoad)
		|| originalResolveComponent(name);
}

let resolveDynamicComponent = function (name) {
	console.log(
		'  - resolveDynComp '+JSON.stringify(name)+
		' from '+JSON.stringify(context.jsGlobal.originRoute)
	);
	return resolveUserComponents(name, compAsyncLoad)
		|| originalResolveDynamicComponent(name);
}

ctxInit();

return Promise.resolve({
	wrapLoaderPromise,
	compAsyncLoad,
	resolveUserCompLoader,
	resolveUserComponent,
	resolveUserComponents: fnResolveUserComponents,
	forEachComp,
	ctxReplace,
	ctxFin,
	getCompsCss,
	getCompsLoad,
	mapClear,
	resolveComponent,
	resolveDynamicComponent,
	getOriginalRC: function() {
		return originalResolveComponent;
	},
	getOriginalRDC: function() {
		return originalResolveDynamicComponent;
	}
});

function ctxInit() {

	({ Vue } = context);
	originalResolveComponent = Vue.resolveComponent;
	originalResolveDynamicComponent = Vue.resolveDynamicComponent;

	Vue.resolveComponent = resolveComponent;
	Vue.resolveDynamicComponent = resolveDynamicComponent;

}

function ctxFin() {
	Vue.resolveComponent = originalResolveComponent;
	Vue.resolveDynamicComponent = originalResolveDynamicComponent;
}

function ctxReplace(ctx, newVueLoaders) {
	ctxFin();
	context = ctx;
	if (newVueLoaders) loadersReplace(newVueLoaders);
	ctxInit();
	jsCtxReplace(ctx.jsCtx);
}

function loadersReplace(newVueLoaders) {
	({
		wrapLoaderPromise,
		compAsyncLoad,
		resolveUserCompLoader,
		resolveUserComponent,
		resolveUserComponents,
		forEachComp,
		// ctxReplace,
		// ctxFin,
		getCompsCss,
		getCompsLoad,
		mapClear,
		resolveComponent,
		resolveDynamicComponent
	} = newVueLoaders);
}

}
