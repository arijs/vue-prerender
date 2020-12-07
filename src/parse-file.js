var fs = require('fs');

module.exports = parseFile;
function parseFile(fpath, parser, cb) {
	var rs = fs.createReadStream(fpath, {
		encoding: 'utf8',
		highWaterMark: 1024
	});
	rs.on('end', function() {
		parser.end();
		cb(parser.getResult());
	});
	rs.on('data', function(data) {
		// console.log('readFile data:', data);
		parser.write(data);
	});
	rs.on('error', function(err) {
		cb({error: [err]});
	});
}
