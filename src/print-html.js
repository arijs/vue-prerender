const { forEach } = require('./utils/function');
const { printerTransform } = require('@arijs/stream-xml-parser');

module.exports = printHtml;
function printHtml({tree, elAdapter}, { level = -1 }, rules) {
	return new Promise(function(resolve, reject) {
		const am = printerTransform.asyncMatcher(elAdapter);
		var nodesRep = [];
		forEach(rules, function({name, matcher, callback}) {
			am.addRule({
				matcher,
				callback: function(opt) {
					nodesRep.push({
						replaced: name,
						path: opt.path.concat(opt.node)
					});
					return callback(opt);
				}
			})
		});
		return printerTransform.async({
			tree,
			elAdapter,
			transform: am.transform,
			level,
			callback: function cbTransformed(err, page) {
				return err ? reject(err) : resolve({page, nodesRep});
			}
		});
	});
}
