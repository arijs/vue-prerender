const initCompLoaders = require('./loaders/init-comp-loaders');

module.exports = initVueLoaders;
function initVueLoaders(context, comps) {

const { Vue } = context;
const originalResolveComponent = Vue.resolveComponent;
const originalResolveDynamicComponent = Vue.resolveDynamicComponent;

const {
	getCompsCss,
	getCompsLoad,
	resolveUserCompLoader,
	resolveUserComponents,
} = initCompLoaders(context, comps);

Vue.resolveComponent = resolveComponent;
Vue.resolveDynamicComponent = resolveDynamicComponent;

return Promise.resolve({
	wrapLoaderPromise,
	compAsyncLoad,
	resolveUserCompLoader,
	resolveUserComponent,
	resolveUserComponents: fnResolveUserComponents,
	getCompsCss,
	getCompsLoad,
	resolveComponent,
	resolveDynamicComponent,
	originalResolveComponent,
	originalResolveDynamicComponent
});

function wrapLoaderPromise(loader, name) {
	// lconsole.log(': gal/wlp', originRoute, name);
	return function() {
		// lconsole.log(': gal/wlp-load', originRoute, name);
		return new Promise(function(resolve, reject) {
			// console.log('## load comp loader: '+name);
			loader().then(resolve).catch(reject);
		});
	};
}

function compAsyncLoad(loader, name) {
	// lconsole.log(': gal/cal', originRoute, name);
	return Vue.defineAsyncComponent({
		loader: wrapLoaderPromise(loader, name),
		name: 'loader--'+name
	});
}

function resolveUserComponent(name) {
	// lconsole.log(': gal/ruc', originRoute, name);
	var loader = resolveUserCompLoader(name);
	return loader && compAsyncLoad(loader, name);
}

function fnResolveUserComponents(name) {
	return resolveUserComponents(name, compAsyncLoad);
}

function resolveComponent(name) {
	return resolveUserComponents(name, compAsyncLoad)
		|| originalResolveComponent(name);
}

function resolveDynamicComponent(name) {
	return resolveUserComponents(name, compAsyncLoad)
		|| originalResolveDynamicComponent(name);
}

}
