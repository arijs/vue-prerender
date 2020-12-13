var {forEach} = require('../utils/function');
var extend = require('../utils/extend');
var loadAjax = require('./ajax');
var loadScript = require('./script');
var loadStylesheet = require('./style');

module.exports = function loadComponent(opt) {
	var load = {
		optMatch: opt,
		comp: {
			name: 'comp',
			error: null,
			data: null,
			done: !opt.setResult
		},
		html: {
			name: 'html',
			path: opt.pathHtml,
			error: null,
			data: null,
			resp: null,
			done: !opt.pathHtml,
		},
		js: {
			name: 'js',
			path: opt.pathJs,
			error: null,
			data: null,
			done: !opt.pathJs,
		},
		css: {
			name: 'css',
			path: opt.pathCss,
			error: null,
			done: !opt.pathCss,
		},
		error: null,
		done: false,
		order: []
	};
	var html = load.html;
	var js = load.js;
	var css = load.css;
	var comp = load.comp;
	var order = load.order;
	function anyError() {
		var list = [];
		forEach([comp, html, js, css], function(item) {
			if (item.error) {
				list.push(
					'('+item.name+': '+
					String(item.error.message || item.error)+')'
				);
			}
		});
		if (list.length) {
			load.error = new Error(
				'Component '+opt.name+': '+opt.id+': '+
				list.join(', ')
			);
		}
	}
	function itemLoad() {
		if (load.done) {
			// done already called
		} else if (html.done && js.done && (css.done || !opt.waitCss)) {
			if (comp.done) {
				anyError();
				load.done = true;
				opt.onLoad(load);
			} else {
				opt.setResult(load, function(compResult) {
					compResult && extend(comp, compResult);
					comp.done = true;
					order.push(comp);
					itemLoad();
				});
			}
		}
	}
	loadAjax({
		url: html.path,
		cb(resp) {
			html.done = true;
			html.error = resp.error;
			html.data = resp.data;
			html.resp = resp;
			order.push(html);
			itemLoad();
		}
	});
	loadScript({
		url: js.path,
		cb(error) {
			js.done = true;
			js.error = error;
			if (!error && opt.getJsData) {
				try {
					js.data = opt.getJsData(opt);
				} catch (e) {
					js.error = e;
				}
			}
			order.push(js);
			itemLoad();
		},
		ctx: opt.jsCtx,
		processData: opt.jsProcessData
	});
	loadStylesheet(css.path, function(error, data) {
		css.done = true;
		css.error = error;
		if (!error && opt.onCssData) {
			try {
				opt.onCssData(data, opt);
			} catch (e) {
				js.error = e;
			}
		}
		order.push(css);
		itemLoad();
	});
}
