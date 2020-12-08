
module.exports = {
	initContext: require('./init-context'),
	initVueLoaders: require('./init-vue-loaders'),
	initScripts: require('./init-scripts'),
	routerPush: require('./router-push'),
	renderApp: require('./render-app'),
	parseHtml: require('./parse-html'),
	printHtml: require('./print-html'),
	buildCssLinks: require('./build-css-links'),
	buildCompScripts: require('./build-comp-scripts'),
	nodeUtils: require('./node-utils'),
	routeToOutput: require('./route-to-output'),
	writeFile: require('./write-file'),
	utils: {
		allCallback: require('./utils/all-callback'),
		deferred: require('./utils/deferred'),
		extend: require('./utils/extend'),
		fn: require('./utils/function'),
		inspect: require('./utils/inspect'),
		openDir: require('./utils/open-dir'),
	},
	loaders: {
		ajax: require('./loaders/ajax'),
		component: require('./loaders/component'),
		compPrefix: require('./loaders/comp-prefix'),
		script: require('./loaders/script'),
		scriptQueue: require('./loaders/script-queue'),
		style: require('./loaders/style'),
	},
	XMLParser: require('@arijs/stream-xml-parser')
};
