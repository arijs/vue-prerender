var loadScript = require('./script');

function defaultProcessItem(x) {
	return x;
}

module.exports = function loadScriptQueue(queue, cb, processItem) {
	var next, nextCb;
	processItem = processItem instanceof Function
		? processItem
		: defaultProcessItem;
	while (queue.length && !next) {
		next = queue.shift();
	}
	if (next) {
		next = processItem(next);
		nextCb = next.cb;
		next.cb = function(err) {
			var item = this;
			if (nextCb instanceof Function) err = nextCb(err);
			if (err) {
				cb(err, [item]);
			} else {
				loadScriptQueue(queue, function(err, subItems) {
					if (subItems) subItems.unshift(item);
					else subItems = [item];
					cb(err, subItems);
				});
			}
		};
		loadScript(next);
	} else {
		cb();
	}
}
