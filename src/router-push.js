
module.exports = routerPush;
function routerPush({ jsGlobal: { router } }, route) {
	router.push(route || '/');
	return router.isReady();
}
