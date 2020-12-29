import appPath from './app-path.mjs';
import { loaders } from '@arijs/vue-prerender';
import inspect from '@arijs/frontend/isomorphic/utils/inspect';

var { ajax } = loaders;

var isDebug = false;
var host = appPath('api/');

var cacheBack = {};
var cacheFront = {};

function injectService(name, key, cb, load) {
	var cacheVal = cacheFront[name] || cacheBack[name];
	if (cacheVal) {
		cbInject(cacheVal);
	} else {
		if (isDebug) console.log('  ~ svc loading:', name);
		load().then(function(data) {
			cbInject({data});
		}).catch(function (error) {
			cbInject({error});
		});
	}
	return;
	function cbInject(resp) {
		var cache =
			'b' === key ? cacheBack :
			'f' === key ? cacheFront :
			null;
		if (cache) {
			if (isDebug) console.log('  ~ svc inject: save', name, 'into cache', key, inspect(resp, 1, 16));
			cache[name] = resp;
		} else {
			if (isDebug) console.log('  ~ svc inject: no cache', key, 'to save', name, inspect(resp, 1, 16));
		}
		cb(resp);
	};
}

function injectPromise(name, key, load) {
	return new Promise(function(resolve, reject) {
		injectService(name, key, function({data, error}) {
			if (error) reject(error);
			else resolve(data);
		}, load);
	})
}

var services = {
	setDebug: function(d) {
		isDebug = d;
	},
	host,
	keyInitial: 'f',
	cacheBack,
	cacheFront,

	getUsers: function() {
		var name = 'users';
		var key = services.keyInitial;
		return injectPromise(name, key, function() {
			return ajax({
				url: host+'users.json',
				json: true,
			});
		});
	},

	getCasesLista: function () {
		var name = 'cases';
		var key = services.keyInitial;
		return injectPromise(name, key, function() {
			return ajax({
				url: host+'cases.json',
				json: true,
			});
		});
	}
};

export default services;
