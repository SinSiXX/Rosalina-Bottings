var https = require("https");
var fs = require("fs");

var WEBAPP_ENDPOINT = "https://discordapp.com";

download(WEBAPP_ENDPOINT + "/channels/@me", parseApp);

function parseApp(app) {
	var r = /<[\s+]?script[\s+]?src="(\/assets\/.*)"[\s+]?>[\s+]?<[\s+]?\/[\s+]?script[\s+]?>/gmi;
	var js = [];
	while (m = r.exec(app)) {
		js.push(m[1]);
	}

	js.forEach(function(name) {
		download(WEBAPP_ENDPOINT + name, parseJS);
	});
}

function parseJS(js) {
	if (js.indexOf("discordapp") < 0) return;
	eval(js);
}

function webpackJsonp(chunk, modules) {
	var exported = [];
	modules.forEach(function(module) {
		var modExports = {};
		var moduleDefault = {};
		var dummyModule = function() {
			return function(arg) {
				return arg;
			};
		};
		try {
			module(modExports, moduleDefault, dummyModule);
		} catch (e) {}

		if (modExports.exports) {
			onModuleLoaded(modExports.exports);
			exported.push(modExports.exports);
		}
	});
	onAllModulesLoaded(exported);
	process.exit();
}

function onModuleLoaded(module) {
	if (module[0] && typeof module[0].executables != "undefined") {
		dumpModule("games.json", module);
	}
	if (module[0]&& typeof module[0].emoji != "undefined"
		&& typeof module[0].surrogates != "undefined") {
		dumpModule("emojis.json", module);
	}
	if (module[0] && typeof module[0].emoji != "undefined"
		&& typeof module[0].shortcuts != "undefined") {
		dumpModule("emoji-shortcuts.json", module);
	}
	if (module["ActionTypes"]) {
		dumpModule("constants.json", module);
	}
}

function onAllModulesLoaded(modules) {
	dumpModule("dump.json", modules);
}

// =========== internals =========== //

function dumpModule(file, data, force) {
	var v = [];
	function replacer(key, value) {
		if (!value && value === null) return value;
		if (v.indexOf(value) >= 0) return;
		v.push(value);
		return value;
	}

	fs.writeFileSync(file, JSON.stringify(data, replacer, "\t"));
	console.log("wrote " + file);
}

function download(r, cb) {
	https.get(r, function(res) {
		var content = "";
		res.on("data", function(chunk) {
			content += chunk;
		});
		res.on("end", function() {
			cb(content);
		});
	}).on('error', function(e) {
		console.log("Error: " + e.message);
	});
}