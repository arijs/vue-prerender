var loadScript = require('./script');

function defaultProcessItem(x) {
	return x;
}

module.exports = function loadScriptQueue(queue, cb, processItem) {
	var next;
	processItem = processItem instanceof Function
		? processItem
		: defaultProcessItem;
	while (queue.length && !next) {
		next = queue.shift();
	}
	if (next) {
		next = processItem(next);
		loadScript(next.url, function(err) {
			var item = this;
			if (next.cb instanceof Function) err = next.cb(err);
			if (err) {
				cb(err, [item]);
			} else {
				loadScriptQueue(queue, function(err, subItems) {
					if (subItems) subItems.unshift(item);
					else subItems = [item];
					cb(err, subItems);
				});
			}
		}, next.ctx, next.before, next.after);
	} else {
		cb();
	}
}
