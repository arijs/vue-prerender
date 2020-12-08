var { forEach } = require('./utils/function');
// var { reSlashStart } = require('./utils/regexes');
var reSlashStart = /^\/*/;

function buildLink(item, elAdapter) {
	var link = elAdapter.initName('link');
	var path = String(item.match.pathCssRel).replace(reSlashStart,'/');
	elAdapter.attrsAdd(link, {name: 'rel', value: 'stylesheet'});
	elAdapter.attrsAdd(link, {name: 'href', value: path });
	return link;
}

module.exports = function buildCssLinks(list, elAdapter) {
	var links = elAdapter.initRoot();
	forEach(list, function(item) {
		elAdapter.childElement(links, buildLink(item, elAdapter));
	});
	return elAdapter.childrenGet(links);
};
