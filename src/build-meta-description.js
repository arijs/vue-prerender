
module.exports = function buildMetaDescription(desc, elAdapter) {
	var meta = elAdapter.initName('meta');
	elAdapter.attrsAdd(meta, {name: 'name', value: 'description'});
	elAdapter.attrsAdd(meta, {name: 'content', value: desc });
	var frag = elAdapter.initRoot();
	elAdapter.childElement(frag, meta);
	return elAdapter.childrenGet(frag);
};
