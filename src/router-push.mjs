
export default function routerPush({ router, route }) {
	router.push(route || '/');
	return router.isReady();
}
