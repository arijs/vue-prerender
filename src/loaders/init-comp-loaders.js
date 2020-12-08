const { forEach, forEachProperty } = require('../utils/function');
// const { inspectObj } = require('../utils/inspect');
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
function initCompLoaders(compOpt, comps) {

forEach(comps, function(comp, i) {
	comps[i] = createCompLoader(extendCustom(propertyUnfilled, compOptDefault, comp, compOpt));
});

return {
	getCompsCss,
	getCompsLoad,
	resolveUserCompLoader,
	resolveUserComponents,
};

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
	// var tries = [ Comp, Page, Block ];
	var list = [];
	forEach(comps, function(comp) {
		forEachProperty(comp.mapCss, function(item) {
			item.comp = comp.name;
			list.push(item);
		});
	});
	return list;
}

function getCompsLoad() {
	// var tries = [ Comp, Page, Block ];
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
	// var tries = [ Comp, Page, Block ];
	var defined;
	var loader, match;
	// console.log(
	// 	'/** user component loaders '+
	// 	JSON.stringify(inspectObj(comps, 1))+' for '+
	// 	JSON.stringify(name)+' **/'
	// );
	forEach(comps, function(comp) {
		var test = comp.testName(name);
		// console.log(
		// 	'/** user component test '+
		// 	JSON.stringify(comp.name)+'/'+
		// 	JSON.stringify(comp.prefix)+' for '+
		// 	JSON.stringify(name)+' = '+
		// 	JSON.stringify(test)+' **/'
		// );
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
		console.log('/** user component predefined **/', match.name, name);
		return defined;
	} else if (loader) {
		console.log('/** user component found **/', match.name, name);
		defined = match.mapDefined[name] = compAsyncLoad(loader, name);
		return defined;
	} else {
		// console.log('/** user component NOT found **/', name);
	}
}

}
