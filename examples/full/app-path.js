const nodePath = require('path');

var reLastSlash = /\/*$/;
module.exports = function appPath(path) {
	var lastSlash = String(path).match(reLastSlash);
	// This is an example, the "public" folder doesn't exist here
	// but your project will need a function like this that
	// resolve a path to your web server public root directory
	return nodePath.resolve(__dirname, '../public/', path) +
		(lastSlash ? lastSlash[0] : '');
};
