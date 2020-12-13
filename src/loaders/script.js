var loadAjax = require('./ajax');

module.exports = loadScript;
function loadScript(opt) {
	var {url, cb, ctx, processData} = opt;
	ctx = ctx || {};
	var ctxKeys = [];
	var ctxValues = [];
	var hop = Object.prototype.hasOwnProperty;
	for (var k in ctx) {
		if (hop.call(ctx, k)) {
			ctxKeys.push(k);
			ctxValues.push(ctx[k]);
		}
	}
	loadAjax({
		url,
		cb: function(resp) {
			var {error, data} = resp;
			if (error) return cb.call(resp, error, data);
			try {
				if (processData instanceof Function) {
					data = processData(data, opt);
				}
				ctxKeys.push(data);
				var fn = Function.apply(undefined, ctxKeys);
				resp.execCtx = ctx;
				resp.execResult = fn.apply(ctx, ctxValues);
			} catch (e) {
				error = e;
				resp.error = e;
				console.error('Error loading script '+url);
				console.error(e);
			}
			cb.call(resp, error, data);
		}
	});
}
