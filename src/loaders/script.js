var loadAjax = require('./ajax');

var reWindow = /\bwindow\b/;
var reGlobal = /\bglobal\b/g;
var reUrlDebug = /\/header\/header\.js$/;
var activeDebug = false;

module.exports = function loadScript(url, cb, ctx, before, after) {
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
		url: url,
		cb: function(resp) {
			var {error, data} = resp;
			if (error) return cb.call(resp, error);
			try {
				data = data.replace(reGlobal, 'appGlobal');
				if (activeDebug && reUrlDebug.test(url)) {
					console.log('  script '+url);
					console.log(data);
				}
				data = (before || '') + data + (after || '');
				if (reWindow.test(data)) {
					console.error(`Script ${url} has a call to window`);
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
