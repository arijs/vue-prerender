
export function nodeTree(list, elAdapter) {
	var frag = elAdapter.initRoot();
	var lc = list.length;
	for (var i = 0; i < lc; i++) {
		elAdapter.childElement(frag, list[i]);
	}
	return elAdapter.childrenGet(frag);
}

export function nodeAttrSet(node, aName, aValue, elAdapter) {
	elAdapter.attrsEach(node, function(name) {
		if (aName === name) return this._remove;
	});
	elAdapter.attrsAdd(node, { name: aName, value: aValue });
	return node;
}

export function treeMetaDesc(node, desc, elAdapter) {
	return nodeTree([nodeAttrSet(node, 'content', desc, elAdapter)], elAdapter);
}
