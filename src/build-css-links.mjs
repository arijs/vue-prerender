import forEach from '@arijs/frontend/isomorphic/utils/for-each';

var reSlashStart = /^\/*/;

export function buildCssLink(item, elAdapter) {
	var link = elAdapter.initName('link');
	var path = String(item.opt.cssRel).replace(reSlashStart,'/');
	elAdapter.attrsAdd(link, {name: 'rel', value: 'stylesheet'});
	elAdapter.attrsAdd(link, {name: 'href', value: path });
	return link;
}

export default function buildCssLinks(list, elAdapter) {
	var links = elAdapter.initRoot();
	forEach(list, function(item) {
		elAdapter.childElement(links, buildCssLink(item, elAdapter));
	});
	return elAdapter.childrenGet(links);
}
