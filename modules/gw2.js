'use strict';
var https = require('https');

var version = "/v2";
var gw = "https://api.guildwars2.com" + version;



exports.price = function (itemid, callback) {
    var request = https.get(gw + "/commerce/prices/" + encodeURIComponent(itemid), function (response) {
        var itemPrice = '';
        switch (response.statusCode) {
            case 200:
                response.on('data', function (chunk) {
                    itemPrice += chunk;
                });
                response.on('end', function () {
                    var item = JSON.parse(itemPrice);
                    console.log(item);
                    callback(null, item);
                });
                break;
            case 204:
                callback("204 received!", null);
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

exports.exchange = function (currency, amount, callback) {
    var request = https.get(gw + "/commerce/exchange/" + encodeURIComponent(currency + "?quantity=" + amount), function (response) {
        var exchangeRate = '';
        switch (response.statusCode) {
            case 200:
                response.on('data', function (chunk) {
                    exchangeRate += chunk;
                });
                response.on('end', function () {
                    var rate = JSON.parse(exchangeRate);
                    console.log(rate);
                    callback(null, rate);
                });
                break;
            case 204:
                callback("204 received!", null);
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