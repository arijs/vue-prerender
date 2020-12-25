// import inspect from '@arijs/frontend/src/isomorphic/utils/inspect.mjs';

export default function routerPush({ router, route }) {
	// console.log('  - router.push', JSON.stringify(route), inspect(router, 1, 32));
	router.push(route || '/');
	// console.log('  - after router.push');
	return router.isReady();
}
