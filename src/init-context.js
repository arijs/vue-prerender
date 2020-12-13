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
	renderToString
}) {

extend(jsCtx, {
	[jsGlobalVar]: jsGlobal,
	Vue,
	VueRouter
});

return Promise.resolve({
	jsGlobalVar,
	jsGlobal,
	jsCtx,
	storeLoads,
	Vue,
	VueRouter,
	compile,
	renderToString
});

}
