import fs from 'fs';

export default function parseFile(fpath, parser) {
	return new Promise(function(resolve, reject) {
		var rs = fs.createReadStream(fpath, {
			encoding: 'utf8',
			highWaterMark: 1024
		});
		rs.on('end', function() {
			parser.end();
			var res = parser.getResult();
			if (res.error) {
				reject(res);
			} else {
				resolve(res);
			}
		});
		rs.on('data', function(data) {
			parser.write(data);
		});
		rs.on('error', function(err) {
			reject([err]);
		});
	});
}
