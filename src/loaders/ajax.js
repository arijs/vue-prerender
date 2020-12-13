var fs = require('fs');

module.exports = function loadAjax(opt) {
	fs.readFile(
		opt.url,
		{ encoding: opt.encoding || 'utf8' },
		function(err, data) {
			if (opt.json && !err) {
				try {
					data = JSON.parse(data);
				} catch (e) {
					err = e;
				}
			}
			opt.cb({
				error: err,
				data: data
			});
		}
	)
}
