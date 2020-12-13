const { array: openDirArray } = require('./utils/open-dir');
const fs = require('fs');
const path = require('path');
const reSep = /[\\\/]+/g
const reDots = /^[.]*$/;

module.exports = writeFile;
function writeFile(basePath, subPath, fileData) {
	return new Promise(function(resolve, reject) {
		const subDirs = subPath.split(reSep).filter(function(x) {
			return x && !reDots.test(x);
		});
		const fileName = subDirs.pop();
		openDirArray(basePath, subDirs.slice(), function(err) {
			if (err) {
				return reject(err);
			}
			const outputPath = [basePath].concat(subDirs, [fileName]).join(path.sep);
			fs.writeFile(outputPath, fileData, function(err) {
				return err ? reject(err) : resolve();
			});
		});
	});
}
