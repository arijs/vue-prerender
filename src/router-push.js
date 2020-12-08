// const parseFile = require('./parse-file');
// const { getParser } = require('@arijs/stream-xml-parser');

module.exports = routerPush;
function routerPush({ jsGlobal: { router } }, route) {
	router.push(route || '/');
	return router.isReady();
}
