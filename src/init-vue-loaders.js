const initCompLoaders = require('./loaders/init-comp-loaders');

module.exports = initVueLoaders;
function initVueLoaders(context, comps, commonOpt) {

let Vue;
let originalResolveComponent;
let originalResolveDynamicComponent;
let defineAsyncComponent;

let {
	forEachComp,
	jsCtxReplace,
	getCompsCss,
	getCompsLoad,
	mapClear,
	destroy: fnDestroy,
	resolveUserCompLoader,
	resolveUserComponents,
} = initCompLoaders(context, comps, commonOpt);

let destroy = function() {
	fnDestroy();
	Vue =
	forEachComp =
	jsCtxReplace =
	getCompsCss =
	getCompsLoad =
	mapClear =
	resolveUserCompLoader =
	resolveUserComponents =
	wrapLoaderPromise =
	compAsyncLoad =
	resolveUserComponent =
	fnResolveUserComponents =
	defineAsyncComponent =
	resolveComponent =
	resolveDynamicComponent =
		undefined;
};

let wrapLoaderPromise = function (loader, name) {
	return function() {
		return new Promise(function(resolve, reject) {
			loader().then(resolve).catch(reject);
		});
	};
};

let compAsyncLoad = function (loader, name) {
	return defineAsyncComponent({
		loader: wrapLoaderPromise(loader, name),
		name: 'loader--'+name
	});
};

let resolveUserComponent = function (name) {
	var loader = resolveUserCompLoader(name);
	return loader && compAsyncLoad(loader, name);
};

let fnResolveUserComponents = function (name) {
	return resolveUserComponents(name, compAsyncLoad);
};

let resolveComponent = function (name) {
	return resolveUserComponents(name, compAsyncLoad)
		|| originalResolveComponent(name);
};

let resolveDynamicComponent = function (name) {
	return resolveUserComponents(name, compAsyncLoad)
		|| originalResolveDynamicComponent(name);
};

// ctxInit();

({
	defineAsyncComponent,
	originalResolveComponent,
	originalResolveDynamicComponent,
} = context.jsGlobal);

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
	destroy,
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
	// ({ Vue } = context);
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
		getCompsCss,
		getCompsLoad,
		mapClear,
		resolveComponent,
		resolveDynamicComponent
	} = newVueLoaders);
}

}
