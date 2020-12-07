const prefixMatcher = require('./comp-prefix');

function fnPathResource(kindName, relPath) {
	return function(match, ext) {
		match[kindName] = relPath + match.path +'/' + match.lastName + ext;
		return match.url + ext;
	};
}

module.exports = createCompLoader;
function createCompLoader({
	name,
	prefix,
	jsGlobal,
	jsCtx,
	basePath,
	relPath,
	setCompHtml,
	storeLoads,
	storeCssData,
	compileHtml,
	onMatch,
	onMatchLoad,
	onLoad,
	waitCss = true
}) {

setCompHtml = setCompHtml || setCompHtmlDefault;
	
var Comp = prefixMatcher({
	map: {},
	mapCss: {},
	mapDefined: {},
	mapLoad: storeLoads ? {} : null,
	name, //: 'Comp',
	prefix, //: 'app--',
	basePath, //: appPath('comp/'),
	jsCtx,
	waitCss, //: true,
	pathHtml: fnPathResource('pathHtmlRel', relPath),
	pathJs  : fnPathResource('pathJsRel',   relPath),
	pathCss : fnPathResource('pathCssRel',  relPath),
	getJsData: function(match) {return Comp.map[match.path];},
	onCssData: function(data, match) {Comp.mapCss[match.path] = {
		match,
		data: storeCssData ? data : null
	};},
	setCompHtml,
	onLoad: function(match, load) {
		if (storeLoads) {
			Comp.mapLoad[match.path] = { match, load };
		}
		if (onLoad instanceof Function) {
			onLoad(match, load);
		}
	},
	onMatch, //: function(name) {
	// 	lconsole.log(': gal/comp-mat', originRoute, name);
	// },
	onMatchLoad, //: function(name) {
	// 	lconsole.log(': gal/comp-load', originRoute, name);
	// }
});

if (jsGlobal) jsGlobal[name] = Comp;

return Comp;

function setCompHtmlDefault(js, html) {
	if (compileHtml instanceof Function) {
		// html = compileHtml(html);
		// html = Function.call(null, 'Vue', html);
		// js.render = html(Vue);
		js.render = compileHtml(html);
	} else {
		js.template = html;
	}
}

}