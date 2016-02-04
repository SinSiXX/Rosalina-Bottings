var fs = require('fs');

function readDetections(callback) {
    fs.readFile("./config/techniclog.json", "utf8", function (err, data) {
        if (err) {
            console.error("Problem with techniclog.json. Is it populated?");
            console.error(err);
            return;
        }
        var stringData = data.toString();
        try {
            //console.log(JSON.parse(stringData));
            var logDetections = JSON.parse(stringData);
            callback(null, logDetections);

        }catch(e) {
            callback(new Error(e));
        }
    });
}
function parseLogFile(callback) {
    readDetections(function (err, logDetections) {
        if (err) {
            console.log(err);
            return;
        }
        fs.readFile("./data/technic.log", function (err, data) {
            if (err) {
                callback(new Error(err));
                return;
            }
            var rawLogFile = data.toString();
            return callback(null, rawLogFile, logDetections);

        });

    });
}

function verifyAccount (callback) {

}
//Broken fix at somepoint...or not >:)
function systemInfo(log, callback) {
    var systemCheck = log.split("\n");
    var systemInfo = {};
    for (var i=0; i < systemCheck.length; i++){
        var match = systemCheck[i].split(" ");
        if (match.indexOf("OS:") > -1) {
            var userOS = match.indexOf("OS:") + 1;
            systemInfo[os] = match[userOS];
        }
    }
    callback(null, systemInfo);
}


    exports.detectProblems = function (pathToFile, callback) {
        var pathToLogs = pathToFile;
    parseLogFile(function (err, rawLogFile, detections){
        if (err) {
            console.log("parseLogFile " + err);
            return;
        }
        var usersSystemInfo;
        var errorCheck = rawLogFile.split("Forge Mod Loader version");
        //console.log(detections);
        var detectionList = detections.detections;
        //console.log(errorCheck);
        var errorCheckLength = errorCheck.length -1;
        var logErrorCheck = errorCheck[errorCheckLength].split("\n");
        var problemsFound = [];
        var solutions = [];
//TODO: Something is broken causing a false detection with Pixel Format 10. See false detection 1/28/2016
//TODO: You suck, rewrite it
        for (var i=0; i < logErrorCheck.length; i++){
            //var match = logErrorCheck[i];
            for (var x=0; x < detectionList.length; x++) {
                for (var y=0; y < detectionList[x].matches.length; y++) {
                    var testingAr = [];
                    if (logErrorCheck[i].includes(detectionList[x].matches[y])) {
                        if (problemsFound.indexOf(detectionList[x].name) === -1) {
                            console.log("TESGSSDG: " + testingAr.length <= detectionList[x].matches.length);
                            if (testingAr.length <= detectionList[x].matches.length) {
                                /*
                                for (var d=0; d < detectionList[x];d++){
                                    for (var r=0; r < problemsFound.length;r++) {
                                        if(problemsFound[r] === detectionList[d]) {
                                            problemsFound[r].pop
                                        }
                                    }
                                }
                                */
                                    testingAr.push(detectionList[x].matches[y]);
                                    console.log(testingAr);
                                    console.log("Cororororect? " + problemsFound.indexOf(detectionList[x].name) === -1);
                                    //console.log(solutions);
                                    var solLength = solutions.length + 1;
                                    solutions.push("**Problem #**" + solLength + detectionList[x].solution + "\n");
                                    //console.log(solutions);
                                    console.log(problemsFound);
                                    problemsFound.push(detectionList[x].name);
                                    console.log(problemsFound);
                                if (problemsFound.indexOf("Pixel Format W10")  > -1 && problemsFound.indexOf("Pixel Format") > -1) {
                                    solutions.splice(problemsFound.indexOf("Pixel Format"),1);
                                    problemsFound.splice(problemsFound.indexOf("Pixel Format"),1);
                                }
                                if (problemsFound.indexOf("Java Options")  > -1 && problemsFound.indexOf("Insufficient Memory") > -1) {
                                    solutions.splice(problemsFound.indexOf("Insufficient Memory"),1);
                                    problemsFound.splice(problemsFound.indexOf("Insufficient Memory"),1);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (problemsFound.length > 0) {
            callback(null, solutions);
        } else {
            callback("No solution found.",null);

        }
    });
};