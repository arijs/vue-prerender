const { forEach } = require('./utils/function');
const loadScriptQueue = require('./loaders/script-queue');

module.exports = initScripts;
function initScripts(jsCtx, queue) {
	return new Promise(function(resolve, reject) {
		forEach(queue, function(item, i) {
			queue[i] = {
				url: item,
				ctx: jsCtx
			};
		});
		loadScriptQueue(queue, function(err) {
			return err ? reject(err) : resolve();
		});
	});
}
