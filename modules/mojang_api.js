'use strict';
var https = require('https');

exports.profile = function (uuid, callback) {
    if (uuid.length <= 16) {

        var request = https.get(" https://api.mojang.com/users/profiles/minecraft/" + encodeURIComponent(uuid) + "?at=" + Date.now(), function (response) {
            var jsonProfile = '';
            switch (response.statusCode) {
                case 200:
                    response.on('data', function (chunk) {
                        jsonProfile += chunk;
                        console.log("IN DATA");
                    });
                    response.on('end', function () {
                        console.log("ON END");
                        var profile = JSON.parse(jsonProfile);
                        console.log(profile);
                        callback(null, profile);
                    });
                    break;
                case 204:
                    callback("204 received! Account not found.", null);
                    break;
                case 429:
                    callback("404 received! Ratelimited! Try again in a few seconds.");
                    break;
                default:
                    callback(response.statusCode, null);
            }

        });
        //callback(null, solutions);

        request.on('error', function (err) {
            console.log("Request Error: " + err);
            callback(err, null);
        });

    } else {
        var request = https.get("https://sessionserver.mojang.com/session/minecraft/profile/" + encodeURIComponent(uuid), function (response) {
            var jsonProfile = '';
            switch (response.statusCode) {
                case 200:
                    response.on('data', function (chunk) {
                        jsonProfile += chunk;
                        console.log("IN DATA");
                    });
                    response.on('end', function () {
                        console.log("ON END");
                        var profile = JSON.parse(jsonProfile);
                        console.log(profile);
                        callback(null, profile);
                    });
                    break;
                case 204:
                    callback("204 received! Account not found.", null);
                    break;
                case 429:
                    callback("404 received! Ratelimited! Try again in a few seconds.");
                    break;
                default:
                    callback(response.statusCode, null);
            }

        });
        //callback(null, solutions);

        request.on('error', function (err) {
            console.log("Request Error: " + err);
            callback(err, null);
        });
    }
};

    exports.status = function (callback) {
        var request = https.get("https://status.mojang.com/check", function (response) {
            var jsonStatus = '';
            switch (response.statusCode) {
                case 200:
                    response.on('data', function (chunk) {
                        jsonStatus += chunk;
                    });
                    response.on('end', function () {
                        var status = JSON.parse(jsonStatus);
                        callback(null, JSON.stringify(status));
                    });
                    break;
                case 204:
                    callback(response, null);
                    break;
                case 429:
                    callback("404 received! Ratelimited! Try again in a few seconds.");
                    break;
                default:
                    callback(response.statusCode, null);
            }

        });

        request.on('error', function (err) {
            console.log("Request Error: " + err);
            callback(err, null);
        });
    };

    exports.history = function (uuid, callback) {
        var request = https.get("https://sessionserver.mojang.com/session/minecraft/profile/" + encodeURIComponent(uuid), function (response) {
            var jsonProfile = '';
            switch (response.statusCode) {
                case 200:
                    response.on('data', function (chunk) {
                        jsonProfile += chunk;
                        console.log("IN DATA");
                    });
                    response.on('end', function () {
                        console.log("ON END");
                        var profile = JSON.parse(jsonProfile);
                        console.log(profile);
                        callback(null, profile);
                    });
                    break;
                case 204:
                    callback("204 received! Account not found.", null);
                    break;
                case 429:
                    callback("404 received! Ratelimited! Try again in a few seconds.");
                    break;
                default:
                    callback(response.statusCode, null);
            }

        });

        request.on('error', function (err) {
            console.log("Request Error: " + err);
            callback(err, null);
        });
    };


