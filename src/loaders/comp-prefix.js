var extend = require('../utils/extend');
var {deferredPromise} = require('../utils/deferred');
var loadComponent = require('./component');

function testNamePrefix(name, prefix) {
	var plen = prefix.length;
	if (name.substr(0, plen) === prefix) {
		return { name, prefix, suffix: name.substr(plen) };
	}
}
function compPathBase(param, match) {
	return param instanceof Function ? param(match) : match.href;
}
function compPathResource(param, match, extension) {
	return param === false ? null :
		param instanceof Function ? param(match, extension) :
		match.url + extension;
}

function defaultSetCompHtml(js, html) {
	js.template = html;
}

function compSetResult(load, cb) {
	var js = load.js.data;
	var html = load.html.data;
	var err = [];
	var setCompHtml = load.optMatch.setCompHtml || defaultSetCompHtml;
	if (!js) err.push('javascript');
	if (!html) err.push('html');
	if (err.length) {
		cb({error: new Error(
			err.join(', ')+' not found'
		)});
	} else {
		js.name = load.optMatch.id;
		setCompHtml(js, html, load);
		cb({data: js});
	}
}

var reDash = /--/g;
function getPrefixPaths(optPrefix, match) {
	var prefix = match.prefix;
	var suffix = match.suffix;
	var basePath = optPrefix.basePath || '';
	var extHtml = optPrefix.extHtml || '.html';
	var extJs = optPrefix.extJs || '.js';
	var extCss = optPrefix.extCss || '.css';
	var pathHtml = optPrefix.pathHtml;
	var pathJs = optPrefix.pathJs;
	var pathCss = optPrefix.pathCss;
	var path = suffix.replace(reDash,'/');
	var lastIndex = path.lastIndexOf('/');
	var lastName = path.substr(lastIndex+1);
	var href = basePath+path+'/'+lastName;
	var id = prefix.replace(reDash,'/')+path;
	extend(match, optPrefix);
	match.id = id;
	match.path = path;
	match.lastName = lastName;
	match.href = href;
	match.url = compPathBase(optPrefix.getUrl, match);
	match.pathHtml = compPathResource(pathHtml, match, extHtml);
	match.pathJs   = compPathResource(pathJs  , match, extJs  );
	match.pathCss  = compPathResource(pathCss , match, extCss );
	match.setResult = optPrefix.setResult || compSetResult;
	return match;
}

function prefixLoader(match) {
	var path = match.path;
	var mapCache = match.mapCache;
	var mapLoading = match.mapLoading;
	var isCached = mapCache[path];
	if (isCached) return isCached;
	var isLoading = mapLoading[path];
	if (isLoading) return isLoading;
	var def = deferredPromise(match);
	var onLoad = match.onLoad;
	mapLoading[path] = def.promise;
	match.onLoad = function(load) {
		mapLoading[path] = undefined;
		if (load.error) {
			def.reject(load.error);
			console.log('/** prefix comp reject **/', load.error);
		} else {
			mapCache[path] = def.promise;
			def.resolve(load.comp.data);
			if (onLoad instanceof Function) {
				onLoad(match, load);
			}
		}
	};
	loadComponent(match);
	return def.promise;
}

module.exports = function prefixMatcher(optPrefix) {
	optPrefix.loader = prefixMatchName;
	optPrefix.testName = testMatchName;
	optPrefix.mapCache = optPrefix.mapCache || {};
	optPrefix.mapLoading = optPrefix.mapLoading || {};
	return optPrefix;
	function testMatchName(name) {
		return testNamePrefix(name, optPrefix.prefix);
	}
	function prefixMatchName(name) {
		var match = testNamePrefix(name, optPrefix.prefix);
		if (match) {
			var { onMatch } = optPrefix;
			match = getPrefixPaths(optPrefix, match);
			if (onMatch instanceof Function) onMatch(name, match);
			return function() {
				var { onMatchLoad } = optPrefix;
				if (onMatchLoad instanceof Function) onMatchLoad(name, match);
				return prefixLoader(match);
			};
		}
	}
};
