var fs = require('fs');
var path = require('path');

function testaDir(dir, cb) {
	fs.stat(dir, function(err, stat) {
		if (err) {
			if ( 'ENOENT' === err.code ) {
				return cb(null, false);
			} else {
				return cb(err);
			}
		} else if (stat.isDirectory()) {
			return cb(null, true);
		} else {
			err = new Error('path exists but is not a directory: '+dir);
			err.code = err.errno = 'ENOTDIR';
			return cb(err);
		}
	});
}

function openDir(dir, cb) {
	testaDir(dir, function(err, exists) {
		if (err) {
			return cb(err);
		} else if (exists) {
			return cb();
		} else {
			fs.mkdir(dir, function(err) {
				if (err) {
					if ( 'EEXIST' === err.code ) {
						// mas eu acabei de verificar...
						return openDir(dir, cb);
					} else {
						return cb(err);
					}
				} else {
					return cb();
				}
			});
		}
	});
}

function openDirSub(base, sub, cb) {
	return openDir(path.join(base, sub), cb);
}

function openDirArray(base, arr, cb) {
	if ( arr.length ) {
		var dir = arr.shift();
		base = base
			? path.join(base, dir)
			: dir;
		return openDir(base, function(err) {
			if (err) {
				return cb(err);
			} else {
				openDirArray(base, arr, cb);
			}
		});
	} else {
		return cb();
	}
}

function testaFile(file, cb) {
	fs.open(file, 'r', function(err, fd) {
		if (err) {
			if ( 'ENOENT' === err.code ) {
				return cb(null, false);
			} else {
				return cb(err);
			}
		} else {
			fs.close(fd, function(err) {
				if (err) {
					return cb(err);
				} else {
					return cb(null, true);
				}
			});
		}
	});
}

openDir.sub = openDirSub;
openDir.array = openDirArray;
openDir.test = testaDir;
openDir.testFile = testaFile;

module.exports = openDir;
