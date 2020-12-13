const appPath = require('./app-path');
const { loaders: { ajax } } = require('@arijs/vue-prerender');

// This file is an example of how you could implement a cacheable
// "services" backend library that would be used to prerender your
// pages with some external data, _AND_ make that data be printed
// in your prerendered HTML files so Vue can use that data
// immediately to correctly hydrate your app.

var host = appPath('api/');

var cacheBack = {};
var cacheFront = {};

function injectService(name, key, cb, load) {
	var cacheVal = cacheFront[name] || cacheBack[name];
	if (cacheVal) {
		cbInject(cacheVal);
	} else {
		load(cbInject);
	}
	return;
	function cbInject(resp) {
		var cache =
			'b' === key ? cacheBack :
			'f' === key ? cacheFront :
			null;
		if (cache) {
			cache[name] = resp;
		}
		cb(resp);
	};
}

var services = module.exports = {
	host,
	keyInitial: 'f',
	cacheBack,
	cacheFront,

	getUsers: function(params) {
		var name = 'users';
		var key = services.keyInitial;
		injectService(name, key, params.cb, function(cb) {
			ajax({
				url: host+'users.json',
				json: true,
				cb
			});
		});
	},

	getCasesLista: function (params) {
		var name = 'cases';
		var key = services.keyInitial;
		injectService(name, key, params.cb, function(cb) {
			ajax({
				url: host+'cases.json',
				json: true,
				cb
			});
		});
	}
};
