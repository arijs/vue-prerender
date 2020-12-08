const extend = require('./utils/extend');

module.exports = initContext;
function initContext({
	jsGlobalVar = '_app$',
	jsGlobal = {},
	jsCtx = {},
	storeLoads,
	Vue,
	VueRouter,
	compile,
	// compileHtml,
	renderToString
}) {

extend(jsCtx, {
	[jsGlobalVar]: jsGlobal,
	Vue,
	VueRouter
});

// compileHtml = compileHtml || compile instanceof Function && function (html) {
// 	html = compile(html).code;
// 	html = Function.call(null, 'Vue', html);
// 	return html(Vue);
// };

return Promise.resolve({
	jsGlobalVar,
	jsGlobal,
	jsCtx,
	storeLoads,
	Vue,
	VueRouter,
	compile,
	// compileHtml,
	renderToString
});

}
