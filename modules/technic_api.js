'use strict';
/**
 * Created by Berwyn on 1/30/2016.
 */
var http = require('http');
var https = require('https');

//http://api.technicpack.net/modpack/tekkit?build=347
function solderEnabled(modpack, versionNum, callback) {
    console.log("SSSSOLDER: " + "http://api.technicpack.net/modpack/" + encodeURIComponent(modpack) + "?build=999");
    var request = http.get("http://api.technicpack.net/modpack/" + encodeURIComponent(modpack) + "?build=999", function (response) {
        var jsonModpack = '';
        console.log(response.statusCode);
        switch (response.statusCode) {
            case 200:
                response.on('data', function (chunk) {
                    jsonModpack += chunk;
                    console.log("IN DATA");
                });
                response.on('end', function () {
                    console.log("ON END");
                    var modpack = JSON.parse(jsonModpack);
                    console.log(modpack);
                    if(modpack.solder == null) {
                        callback("Modpack not found. Solder enabled packs only.", null);
                    } else {
                        console.log(modpack);
                        console.log(modpack.recommended);
                        console.log(versionNum);
                        if (versionNum == null){
                            console.log("1");
                            callback(null, modpack, modpack.recommended);
                        } else {
                            console.log("2");
                            callback(null, modpack, versionNum);
                        }
                    }
                });
                break;
            case 404:
                callback("Modpack not found. Solder enabled packs only.", null);
                break;
            default:
                callback(response.statusCode, null);
        }

    });

    request.on('error', function (err) {
        console.log("Request Error: " + err);
        callback(err, null);
    });

}

function packVersion (callback) {

}

exports.modpack = function(modpack, versionNum, callback){
    var varsion = versionNum;

    solderEnabled(modpack, varsion, function(error, apiInfo, version) {
        if (error) {
            console.log(error);
            callback(error,null);
            return;
        }
        var solder = apiInfo.solder;

        if (solder.startsWith("https")) {
            console.log(solder);
            console.log(solder + "modpack/" + encodeURIComponent(modpack) + "/" + encodeURIComponent(version));
            var request = https.get(solder + "modpack/" + encodeURIComponent(modpack) + "/" + encodeURIComponent(version), function (response) {
                var jsonModpack = '';
                console.log(response.statusCode);
                switch (response.statusCode) {
                    case 200:
                        response.on('data', function (chunk) {
                            jsonModpack += chunk;
                            console.log("IN DATA");
                        });
                        response.on('end', function () {
                            console.log("ON END");
                            var modpack = JSON.parse(jsonModpack);
                            console.log(modpack);
                            callback(null, modpack);
                        });
                        break;
                    case 404:
                        callback("Modpack not found. Solder enabled packs only.", null);
                        break;
                    default:
                        callback(response.statusCode, null);
                }

            });

            request.on('error', function (err) {
                console.log("Request Error: " + err);
                callback(err, null);
            });
        } else {
            console.log(solder);
            console.log(solder + "modpack/" + encodeURIComponent(modpack) + "/" + encodeURIComponent(version));
            var request = http.get(solder + "modpack/" + encodeURIComponent(modpack) + "/" + encodeURIComponent(version), function (response) {
                var jsonModpack = '';
                console.log(response.statusCode);
                switch (response.statusCode) {
                    case 200:
                        response.on('data', function (chunk) {
                            jsonModpack += chunk;
                            console.log("IN DATA");
                        });
                        response.on('end', function () {
                            console.log("ON END");
                            var modpack = JSON.parse(jsonModpack);
                            console.log(modpack);
                            callback(null, modpack);
                        });
                        break;
                    case 404:
                        callback("Modpack not found. Solder enabled packs only.", null);
                        break;
                    default:
                        callback(response.statusCode, null);
                }

            });

            request.on('error', function (err) {
                console.log("Request Error: " + err);
                callback(err, null);
            });
        }
    });
};