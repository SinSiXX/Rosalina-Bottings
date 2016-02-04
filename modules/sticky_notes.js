'use strict';
/**
 * Created by Berwyn on 1/30/2016.
 */
var https = require('https');

/*
var opts = {
    host: 'https://paste.lemonmc.com',
    port: 80,
    method: 'POST',
    path: '/api/json/create',
    headers: {
        "Content-Type":"application/json",
        "Content-Length":JSON.stringify(req.data).length
    }
};


var req = https.request(opts, function(response) {
    var res_data = '';
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
        res_data += chunk;
    });
    response.on('end', function() {
        callback(res_data);
    });
});
req.on('error', function(e) {
    console.log("Got error: " + e.message);
});
// write the data
if (opts.method != 'GET') {
    req.write(req.data);
}
req.end();
*/



exports.sticky = function(data, callback) {
    console.log("Inside the function");
    var options = {
        host: 'paste.lemonmc.com',
        port: 443,
        path: '/api/json/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = https.request(options, function(res) {
        console.log('Status: ' + res.statusCode);
        console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        var replyBody = '';
        res.on('data', function (body) {
            replyBody += body;
            console.log('Body: ' + body);
        });
        res.on('end', function() {
            console.log("res.on END");
            try {
                callback(null,JSON.parse(replyBody));
            } catch(e) {
                callback("Error parsing body of reply.", null);
            }
        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.stack);
        callback(e,null);
    });
// write data to request body
    req.write(data);
    req.end();
};