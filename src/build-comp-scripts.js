var { forEach } = require('./utils/function');
// var { reTrimEnd, reSlashStart } = require('./utils/regexes');
var { printTreeAsync } = require('@arijs/stream-xml-parser').printerTransform;
// var { compile } = require('@vue/compiler-dom');
// var { minify } = require('terser');
var reTrimEnd = /\s+$/;
var reSlashStart = /^\/*/;

function buildScriptComp(item, elAdapter) {
	var script = elAdapter.initName('script');
	var path = String(item.match.pathJsRel).replace(reSlashStart,'/');
	elAdapter.attrsAdd(script, {name: 'src', value: path });
	return script;
}

function buildScriptRender(item, compile) {
	var compiled = compile(item.load.html.data).code;
	var script = `
	assembleComponent(${JSON.stringify(item.comp)}, ${JSON.stringify(item.match.path)}, function() {${compiled};});
`
	return script;
}

function buildScriptInitialState(state) {
	var script = `
	global.services.initialState = ${JSON.stringify(state)};
`;
	return script;
}

module.exports = function buildCompScripts({
	list,
	elAdapter,
	globalVar,
	jsInitialState,
	compile,
	formatJs,
	callback: cbTree
}) {
	var scripts = elAdapter.initRoot();
	var render = '';
	forEach(list, function(item) {
		elAdapter.childElement(scripts, buildScriptComp(item, elAdapter));
		render += buildScriptRender(item, compile);
	});
	render += buildScriptInitialState(jsInitialState);
	scripts = elAdapter.childrenGet(scripts);
	return printTreeAsync({
		tree: scripts,
		elAdapter: elAdapter,
		path: [],
		level: 1,
		callback: withPrinted
	});
	function withPrinted(printErr, scripts) {
		if (printErr) return cbTree(printErr);
		scripts = scripts.replace(reTrimEnd, '');
		render = `
!function(global) {
function assembleComponent(croot, cpath, getRender) {
	const cdef = deferredPromise([croot, cpath].join('::'));
	const gc = global[croot];
	const comp = gc.map[cpath];
	comp.render = getRender();
	gc.mapCache[cpath] = cdef.promise;
	cdef.resolve(comp);
}
${render}
}(${globalVar});
`
		formatJs(render).then(function({code}) {
			code = `${scripts}
<script>
${code}
</script>
`;
			cbTree(printErr, code);
		}).catch(function(err) {
			cbTree(err || printErr);
		});
	}
};
