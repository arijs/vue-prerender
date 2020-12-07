const parseFile = require('./parse-file');
const { getParser } = require('@arijs/stream-xml-parser');

module.exports = parseHtml;
function parseHtml(filePath) {
	return new Promise(function(resolve, reject) {
		var parser = getParser();
		parseFile(filePath, parser, function(parsed) {
			var error = parsed ? parsed.error : new Error('Parsed input file object is empty');
			return error ? reject(error) : resolve(parsed);
		});
	});
}
