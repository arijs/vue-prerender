import extend from '@arijs/frontend/src/isomorphic/utils/extend.mjs';

export default function initContext({
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
