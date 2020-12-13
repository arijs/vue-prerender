const { forEach, forEachProperty } = require('../utils/function');
const {
	custom: extendCustom,
	propertyUnfilled,
} = require('../utils/extend');
const createCompLoader = require('./create-comp-loader');

const compOptDefault = {
	name: null,
	prefix: null,
	jsGlobal: null,
	jsCtx: null,
	basePath: null,
	relPath: null,
	setCompHtml: null,
	storeLoads: null,
	storeCssData: null,
	waitCss: null,
	onMatch: null,
	onMatchLoad: null,
	onLoad: null,
};

module.exports = initCompLoaders;
function initCompLoaders(compOpt, comps, commonOpt) {

const codCopy = extendCustom(null, null, {}, compOptDefault);
const {
	onResolveDefined,
	onResolveFound,
	onResolveNotFound,
} = commonOpt;

forEach(comps, function(comp, i) {
	comps[i] = createCompLoader(extendCustom(propertyUnfilled, codCopy, comp, compOpt));
});

return {
	forEachComp,
	jsCtxReplace,
	getCompsCss,
	getCompsLoad,
	mapClear,
	destroy,
	resolveUserCompLoader,
	resolveUserComponents,
};

function forEachComp(callback, result) {
	return forEach(comps, callback, result);
}

function jsCtxReplace(ctx) {
	return forEach(comps, function(comp) {
		comp.jsCtxReplace(ctx);
	});
}

function mapClear() {
	return forEach(comps, function(comp) {
		comp.mapClear();
	});
}

function destroy() {
	return forEach(comps, function(comp) {
		comp.destroy();
	});
}

function resolveUserCompLoader(name) {
	return forEach(comps, function(comp) {
		const loader = comp.loader(name);
		if (loader) {
			this.result = loader;
			return this._break;
		}
	});
}

function getCompsCss() {
	var list = [];
	forEach(comps, function(comp) {
		forEachProperty(comp.mapCss, function(item, k) {
			if (!item) {
				console.error(
					'  <!> Empty mapCss val in '+JSON.stringify(comp.name)+
					' key '+JSON.stringify(k)+
					' origin '+JSON.stringify(comp.getOpt().jsGlobal.originRoute)
				);
			}
			item.comp = comp.name;
			list.push(item);
		});
	});
	return list;
}

function getCompsLoad() {
	var list = [];
	forEach(comps, function(comp) {
		forEachProperty(comp.mapLoad, function(item) {
			item.comp = comp.name;
			list.push(item);
		});
	});
	return list;
}

function resolveUserComponents(name, compAsyncLoad) {
	var defined;
	var loader, match;
	forEach(comps, function(comp) {
		var test = comp.testName(name);
		if (!test) return;
		defined = comp.mapDefined[name];
		if (defined) {
			match = comp;
			return this._break;
		}
		loader = comp.loader(name);
		if (loader) {
			match = comp;
			return this._break;
		}
	});
	if (defined) {
		// console.log('/** user component predefined **/', match.name, name);
		if (onResolveDefined instanceof Function) {
			onResolveDefined(match, name);
		}
		return defined;
	} else if (loader) {
		// console.log('/** user component found **/', match.name, name);
		defined = match.mapDefined[name] = compAsyncLoad(loader, name);
		if (onResolveFound instanceof Function) {
			onResolveFound(match, name);
		}
		return defined;
	} else {
		// console.log('/** user component NOT found **/', name);
		if (onResolveNotFound instanceof Function) {
			onResolveNotFound(name);
		}
	}
}

}
