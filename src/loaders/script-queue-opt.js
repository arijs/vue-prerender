const loadScriptQueue = require('./loaders/script-queue');

module.exports = loadScriptQueueOpt;
function loadScriptQueueOpt(scripts, opt) {
	return new Promise(function(resolve, reject) {
		return loadScriptQueue(scripts, cb, processItem);
		function cb(err, items) {
			if (err) reject(err, items);
			else resolve();
		}
	});
	function processItem(item) {
		item = 'string' === typeof item ? { url: item } : item;
		return extend({}, item, {
			url: path.resolve(opt.pathRoot, item.url),
			ctx: item.ctx
				? item.ctx instanceof Function
					? item.ctx(opt)
					: item.ctx
				: opt.jsCtx
		});
	}
}
