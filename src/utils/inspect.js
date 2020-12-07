
exports.inspectVal = inspectVal;
function inspectVal(obj) {
	var toStr = Object.prototype.toString;
	return obj instanceof Object ? toStr.call(obj) :
		'object' === typeof obj ? '[manual Object]' :
		String(obj);
}

exports.inspectObj = inspectObj;
function inspectObj(obj, level) {
	level = +level || 0;
	if ('object' === typeof obj && level > 0) {
		var map = {};
		// var hop = Object.prototype.hasOwnProperty;
		for (var k in obj) {//if (hop.call(obj, k)) {
			map[k] = inspectObj(obj[k], level - 1);
		}
		return map;
	} else {
		return inspectVal(obj);
	}
}
