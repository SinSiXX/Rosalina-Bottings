'use strict';
/**
 * Created by Berwyn on 12/27/2015.
 */

//Discord.js
var Discord = require('./node_modules/discord.js');
var bot = new Discord.Client();


//node libs
var fs = require('fs');
var http = require('http');
var https = require('https');
var os = require('os');
var child_process = require('child_process');


//Other libs
var ytdl = require('ytdl-core');
var jsondiffpatch = require('jsondiffpatch');
var githubhook = require('githubhook');
var github = githubhook({host:"127.0.0.1",port:80,path:"",secret:"123"});
var clc = require('cli-color');
var logerror = clc.red.bold;
var logwarn = clc.yellow;
var lognotice = clc.blue;
var Pastebin = require('pastebin-js'),
    pastebin = new Pastebin('5cf0a5be5da4bcd891cc4c8c7e6a1181');
var Datastore = require('nedb'), db = {};
db.messages = new Datastore({filename:'./servers/messages.db', timestampData:true, autoload:true});
db.join = new Datastore({filename:'./servers/join.db', timestampData:true, autoload:true});
db.leave = new Datastore({filename:'./servers/leave.db', timestampData:true, autoload:true});
db.banned = new Datastore({filename:'./servers/banned.db', timestampData:true, autoload:true});
db.unbanned = new Datastore({filename:'./servers/unbanned.db', timestampData:true, autoload:true});
db.vcjoin = new Datastore({filename:'./servers/vcjoin.db', timestampData:true, autoload:true});
db.vcleave = new Datastore({filename:'./servers/vcleave.db', timestampData:true, autoload:true});
db.detections = new Datastore({filename:'./servers/detections.db', timestampData:true, autoload:true});
db.errors = new Datastore({filename:'./servers/errors.db', timestampData:true, autoload:true});




//my libs
var logReader = require("./modules/techiclog_reader.js");
var mojang = require("./modules/mojang_api.js");
var gw2 = require("./modules/gw2.js");
var technic = require("./modules/technic_api.js");
var stickyNotes = require("./modules/sticky_notes.js");


//config file
var config = require('./config/config.js');

var dt = new Date();
var timestamp = dt.toUTCString();
function logTime() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var seconds = date.getSeconds();

        return year + '-' + month + '-' + day + '-' + hour + '-' + minute + '-' + seconds;
}



bot.userAgent = {"url":"https://github.com/Lord-Ptolemy/Rosalina-Bottings","version":"0.2.2"};
bot.login(config.email, config.password, function(error, token) {
    if (error) {
        console.log('Problem occurred while logging in! ' + error);
        return;
    }
    console.log('-----------------------------------------------------------------------------');
    console.log('Useragent: ' + bot.userAgent.full);
    console.log('Token: ' + token);
    readWhitelist('channelwhitelist');
    readWhitelist('userwhitelist');
    readWhitelist('projectlist');
    readBlackLists();
    readSongList ();
});

bot.on('ready', function onReady() {
    console.log('Username: ' + bot.user.username);
    console.log('ID: ' + bot.user.id);
    console.log('Servers: ' + bot.servers.length);
    console.log('Channels: ' + bot.channels.length);
    console.log('-----------------------------------------------------------------------------');
});




//used to strip < @ > , from IDs to get only the numbers
function cleanID(idToClean) {
    var regexp = new RegExp("\\d","g");
    var numbers = idToClean.match(regexp);
    if (numbers == null) return;
    return idToClean = numbers.toString().replace(/,/g, "");
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}


var userWhitelist; //JSON object containing keys for whitelisted user IDs
var channelWhitelist; //JSON object containing keys for whitelisted channel IDs
var projectlist; //JSON object containing the entire project list of the Programming Server
var songList; //txt file containing all songs
var logFile; //log file containing technic logs
var badWords; //JSON object containing an array filled with bad words

function readSongList() {
    fs.readFile('./config/songlist.txt', function(err, data) {
        if(err) throw logerror(err);
        return songList = data.toString().split("\n");
    });
}

function readWhitelist(whitelistToRead) {
    fs.readFile('./config/' + whitelistToRead +'.json', 'utf8', function (err, data) {
        if (err) {
            console.error(logerror('Problem with ' + whitelistToRead + ' list. Is it populated?'));
            console.error(logerror(err));
            return;
        }
        var stringData = data.toString();
        try {
            console.log(JSON.parse(stringData));
            if (whitelistToRead === 'userwhitelist') {
                return userWhitelist = JSON.parse(stringData);
            }
            if (whitelistToRead === 'channelwhitelist') {
                return channelWhitelist = JSON.parse(stringData);
            }
            if (whitelistToRead === 'projectlist') {
                return projectlist = JSON.parse(stringData);
            }
            /*
            if (whitelistToRead === 'badwords') {
                return badWords = JSON.parse(stringData);
            }
            */
        }catch(e) {
            console.error(logerror('Problem parsing the json. Is the list populated?'));
        }
    });
}

function addServer(serverID) {

    channelWhitelist.serverinfo[serverID] = {"whitelist":[]};

    fs.writeFile('./config/channelwhitelist.json',  JSON.stringify(channelWhitelist), 'utf8', function (error) {
        if (error) {
            console.log(logerror('ERROR ADDING TO WHITELIST!'));
        }
        readWhitelist('channelwhitelist');
    });
}


function addUserWhitelist(usersID, userName) {
    userWhitelist.userinfo[usersID] = {"username":userName, "whitelisted":true};

    fs.writeFile('./config/userwhitelist.json',  JSON.stringify(userWhitelist), 'utf8', function (error) {
        if (error) {
            console.log(logerror('ERROR ADDING TO WHITELIST!'));
        }
        readWhitelist('userwhitelist');
    });
}

function addChannelWhitelist(channelID, serverID) {
    //var ServerA = message.channel.server.id;
    channelWhitelist.serverinfo[serverID].whitelist.push(channelID);

    //var channelWhitelistNew = channelWhitelist.userinfo[usersID] = {"username":userName, "whitelisted":true};

    fs.writeFile('./config/channelwhitelist.json',  JSON.stringify(channelWhitelist), 'utf8', function (error) {
        if (error) {
            console.log(logerror('ERROR ADDING TO WHITELIST!'));
        }
        readWhitelist('channelwhitelist');
    });
}
var blacklistedWords = [];
function readBlackLists() {
    fs.readdir("./config/blacklist", function(err, files) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(files);
        for (var i=0; i < files.length; i++) {
            console.log("./config/blacklist/" + files[i]);
            fs.readFile("./config/blacklist/" + files[i], "utf8", function(err, data) {
                if (err) {
                    console.log(logerror(err));
                    return;
                }
                var stringData = data.toString();
                var words = JSON.parse(stringData);
                blacklistedWords = blacklistedWords.concat(words.words);
            });
        }
    });
}

function databaseFindAll(database, key, value, callback) {
    console.log("Inside the else m8.");
    console.log("DATABASE: " + database);
    console.log("KEY: " + key);
    console.log("Value: "+ value);
    if (!db.hasOwnProperty(database)) {
        callback("Database does not exist.", null);
        return;
    }
    var toSearch = {};
    toSearch[key] = {$regex:new RegExp(value, 'gi')};
    console.log(toSearch);

    db[database].find(toSearch, function (err, results) {
        if (err) {
                console.log(err);
                callback(err, null);
                return;
            }
            var searchResults = [];
            //console.log(results);
            console.log(results.length);

            for (var i = 0; i < results.length; i++) {
                console.log("The For loop. " + i);
                var serverid = results[i].serverid;
                var servername = results[i].servername;
                var channelid = results[i].channelid;
                var channelname = results[i].channelname;
                var _id = results[i]._id;
                var authorid = results[i].authorid;
                var authorname = results[i].authorname;
                var content = results[i].content;
                var deleted = results[i].deleted;
                var createdAt = results[i].createdAt;
                searchResults.push("**"+createdAt+servername+"["+serverid+"]/"+channelname+"["+channelid+"] "+authorname+"["+authorid+"]**"+": "+content+"\n\n");
                //console.log(searchResults);
            }
            callback(null, searchResults);
            console.log("Callback m8");

        });

}


function blacklistedName(checkName) {
    var lowerName = checkName.toLowerCase();

    for (var i = 0; i < blacklistedWords.length; i++) {
        var currentWord = blacklistedWords[i].replace(/\*/g,"\\*");
        var toTest = new RegExp(currentWord);
        var matched = lowerName.search(toTest);
        if (matched > -1) {
            console.log(logwarn("\nNAME DETECTED: ") + currentWord);
            if (beep) {
                return console.log(logwarn("\n\u0007 WARNING! Blacklisted Name detected! ") + checkName);
            }
            return console.log(logwarn("\n WARNING! Blacklisted Name detected! ") + checkName);
        }
    }
}

function blacklistedWord(checkMessage) {
    var messageContent = checkMessage.content;
    var lowerWord = messageContent.toLowerCase();

    for (var i = 0; i < blacklistedWords.length; i++) {
        var currentWord = blacklistedWords[i].replace(/\*/g,"\\*");
        var toTest = new RegExp(currentWord);
        var matched = lowerWord.search(toTest);
        if (matched > -1) {
            console.log(logwarn("\nWORD DETECTED: ") + currentWord);
            if (beep) {
                return console.log(logwarn("\n\u0007 WARNING! Blacklisted Word detected! ") + checkMessage.channel.server.name + '[' + checkMessage.channel.server.id + ']/' + checkMessage.channel.name + '[' + checkMessage.channel.id + ']/' + checkMessage.author.username + '[' + checkMessage.author.id  + "]: " + checkMessage.content);
            }
            return console.log(logwarn("\n WARNING! Blacklisted Word detected! ") + checkMessage.channel.server.name + '[' + checkMessage.channel.server.id + ']/' + checkMessage.channel.name + '[' + checkMessage.channel.id + ']/' + checkMessage.author.username + '[' + checkMessage.author.id  + "]: " + checkMessage.content);
        }
    }
}

function blacklistedStatus(checkStatus, userObj) {
    var messageContent = checkStatus;
    var lowerWord = messageContent.toLowerCase();

    for (var i = 0; i < blacklistedWords.length; i++) {
        var currentWord = blacklistedWords[i].replace(/\*/g,"\\*");
        var toTest = new RegExp(currentWord);
        var matched = lowerWord.search(toTest);
        if (matched > -1) {
            console.log(logwarn("\nWORD DETECTED: ") + currentWord);
            if (beep) {
                return console.log(logwarn("\n\u0007 WARNING! Blacklisted Status detected! ") + userObj.username + '[' + userObj.id  + "]: " + checkStatus);
            }
            return console.log(logwarn("\n WARNING! Blacklisted Status detected! ") + userObj.username + '[' + userObj.id  + "]: " + checkStatus);
        }
    }
}

function serverFilesExist(serverID) {
    fs.access("./servers/" + serverID, fs.F_OK, function (err) {
        if (err) {
            fs.mkdir("./servers/" + serverID, function(err){
                if (err){
                    throw logerror(err);
                }
                copyFile("./core/servers/_default/logs.json", "./servers/" + serverID + "/logs.json", function(err) {
                    if (err) {
                        throw logerror(err);
                    }
                    copyFile("./core/servers/_default/members.json", "./servers/" + serverID + "/members.json", function(err) {
                        if (err) {
                            throw logerror(err);
                        }
                        copyFile("./core/servers/_default/settings.json", "./servers/" + serverID + "/settings.json", function(err) {
                            if (err) {
                                throw logerror(err);
                            }
                            console.log("Successfully added " + serverID);
                        });
                    });
                });
            });
        }
    });
}

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

function readServer (serverID, fileToRead) {
    fs.readFile("./servers/" + serverID +"/" + fileToRead +'.json', 'utf8', function (err, data) {
        if (err) {
            console.error(logerror('Problem with ' + fileToRead + ' list. Is it populated?'));
            console.error(logerror(err));
            return;
        }
        var stringData = data.toString();
        try {
            if (fileToRead === "members") {
                console.log(JSON.parse(stringData));
                return members = JSON.parse(stringData);
            }
            if (fileToRead === "logs") {
                console.log(JSON.parse(stringData));
                return logs = JSON.parse(stringData);
            }
            if (fileToRead === "settings") {
                console.log(JSON.parse(stringData));
                return settings = JSON.parse(stringData);
            }


        } catch (e) {
            console.error(logerror('Problem parsing the json. Is the list populated?'));
        }
    });
}


var members;
var logs;
var settings;
function addNewMember (userObj) {
    var userID = userObj.id;
    members.serverinfo[userID] = {
        "joined": "",
        "usernames": [],
        "discriminator": "",
        "avatarurl": "",
        "detections": 0,
        "warnings": 0,
        "banned": false,
        "override": false,
        "denied": false
    };
}


function shuffleArray(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}


//var array_channelWhitelist = ['111075786936623104', '114957491716096003', '114957522636374017', '102588320181125120', '112150043858837504', '112150135697358848', '112150249539158016', '112150012649078784', '115593364522401793'];
//var array_userWhitelist = ['102529479179509760'];
var inVoiceChannel = false;
var isvclocked = false;
var response;
var volume = 1;
var beep = true;

bot.on("message", function(message) {


    var prefix = config.prefix;
    var mSplit = message.content.trim().split(" ");

    /*
     var mSplit = message.content.split(" ");

     if (mSplit[0] === prefix) {
     if(mSplit[1].substring(0,10 === '!' {
     var message = mSplitp
     }
     }
     */

    if (message.channel.isPrivate) {
        if (message.author.id !== bot.user.id) {
            if (mSplit[0].startsWith('http://') || mSplit[0].startsWith('https://')) {
                bot.joinServer(mSplit[0], function (err, server) {
                    if (err) {
                        bot.sendMessage(message, err + "\nPlease contact owner.\nContact him here:\nhttps://discord.gg/0hBikJKBJHYqQwoR");
                        consol.err(logerror(err));
                        return;
                    }
                    bot.sendMessage(message, "I've joined, but be warned that I do not respond to anyone, but my owner in un-whitelisted servers. \nContact him here:\nhttps://discord.gg/0hBikJKBJHYqQwoR");
                    console.info(lognotice("I have joined a new server."));
                });
            }
        }
    }

    function readDxDiag() {
        fs.readFile('./dxdiag.txt', function (err, data) {
            if (err) throw err;
            var rawDxDiagFile = data.toString();
            var DxDiagFile = rawDxDiagFile.split("\n").splice(0,154);
            var find = ["Operating System:","System Manufacturer:","System Model:","Processor:","Available OS Memory:","Card name:","Dedicated Memory:","Driver Version:"];
            console.log("DxDiagFile to string called!");
            var response = [];
            var filteredResponse = [];
            var driverNumber = 0;
            for (var i=0; i < DxDiagFile.length; i++) {
                //console.log(i.length);
                for (var x=0; x < find.length; x++) {
                    //console.log(find.length);
                    if (DxDiagFile[i].includes(find[x]) && driverNumber < 2) {
                        //console.log(DxDiagFile[i]);
                        //console.log(find[x]);
                        //console.log("match?: " + DxDiagFile[i].includes(find[x]));
                        response.push("\n" + DxDiagFile[i].trim());
                        if (find[x] === "Driver Version:")
                        driverNumber++;
                        //console.log("1 " + response);
                    }
                }
            }
            //console.log("2 " + response);
            //console.log(filteredResponse.length);
            for (var z=0; z < response.length; z++) {
                if (response[z].includes("Card name:")) {
                    //console.log('sdgsdgewt634634');
                    filteredResponse.push("filler" + z);
                }
            }
            //console.log(filteredResponse);
            //console.log(filteredResponse.length);
            if (filteredResponse.length === 1) {
                //console.log('filtered');
                response.pop();
                bot.reply(message, "**This is an experimental feature.**\n```" + response + "```" + "If driver update is needed:\nIntel: https://downloadmirror.intel.com/24345/a08/Intel%20Driver%20Update%20Utility%20Installer.exe\nAMD/ATI: http://www2.ati.com/drivers/auto/autodetectutility.exe\nNvidia: http://www.nvidia.com/Download/Scan.aspx?lang=en-us");
            } else {
                bot.reply(message, "**This is an experimental feature.**\n```" + response + "```" + "If driver update is needed:\nIntel: https://downloadmirror.intel.com/24345/a08/Intel%20Driver%20Update%20Utility%20Installer.exe\nAMD/ATI: http://www2.ati.com/drivers/auto/autodetectutility.exe\nNvidia: http://www.nvidia.com/Download/Scan.aspx?lang=en-us");
            }
        });
    }

    //https://downloadmirror.intel.com/24345/a08/Intel%20Driver%20Update%20Utility%20Installer.exe
    //http://www2.ati.com/drivers/auto/autodetectutility.exe
    //http://www.nvidia.com/Download/Scan.aspx?lang=en-us

    function readLogFile() {
        fs.readFile('./technic.log', function (err, data) {
            if (err) throw err;
            var rawLogFile = data.toString();
            var splitLogFile = rawLogFile.split("Forge Mod Loader version");
            var length = splitLogFile.length;
            var logFile = splitLogFile[length-1];
            console.log("LogFile to string called!");

            switch (logFile != -1) {
                case (logFile.includes('[java.lang.Throwable$WrappedPrintStream:println:-1]: java.lang.NoSuchMethodError: com.google.common.io.CharSource.readLines(Lcom/google/common/io/LineProcessor;)Ljava/lang/Object;')):
                    bot.sendMessage("120089251865034756", "<@" + message.author.id + ">\n**Automated Response** \nIt seems you're using a cracked launcher. We do not condone or support this.\n\nThis **MAY** be a false-positive as this is an experimental detection. Get someone with experience to verify.\n\n<@102529479179509760> " + message.attachments[0].url);
                    return;
                case (logFile.includes("[Ljava.lang.String;@4eec7777")):
                    bot.sendMessage("120089251865034756", "<@" + message.author.id + ">\n**Automated Response** \nIt seems you're using a cracked launcher. We do not condone or support this.\n\nThis **MAY** be a false-positive as this is an experimental detection. Get someone with experience to verify.\n\n<@102529479179509760> " + message.attachments[0].url);
                    return;
            }

            if (logFile.includes('Forge Mod Loader version') != -1) {
                //console.log("Inside if of logFile!!!!!!!!!!!!!!!!!!!!!!!!!!");
                //var splitLog = logFile.split('Forge Mod Loader version');
                //console.log(splitLog);
                //var splitLength = splitLog.length;
                //console.log('splitLength: ' + splitLength);
                //var parsedLog = splitLog[splitLength-1];
                //console.log('Parse LOG!!: ' + parsedLog);

                switch (logFile != -1) {
                    case (logFile.includes('org.lwjgl.LWJGLException: Pixel format not accelerated') && logFile.includes('OS: windows 10') || logFile.includes('org.lwjgl.LWJGLException: Pixel format not accelerated') && logFile.includes("running on Windows 10")):
                        bot.reply(message, "\n**Automated Response** \nYou appear to be having an issue with an unsupported Intel Graphics device and Windows 10. This issue is common for older computers and Windows 10. We recommend, if it's a desktop, to get a dedicated graphics, as it is always a better option, anyways. However, there is a fix.\n\nPlease press ``WindowsKey + X`` and click on \"Programs and Features\" and uninstall all copies of Java. \nAfter that, install Java 7 from this link: http://cdn.lemonmc.com/jre-7u80-windows-x64.exe \n\nStart up the launcher and try again.");
                        break;
                    case (logFile.includes('org.lwjgl.LWJGLException: Pixel format not accelerated')):
                        bot.reply(message, "\n**Automated Response** \nIt seems your gpu drivers are out of date. Please go to your manufacturer's website to find the up to date drivers for your computer.\nIntel: https://downloadmirror.intel.com/24345/a08/Intel%20Driver%20Update%20Utility%20Installer.exe\nAMD/ATI: http://www2.ati.com/drivers/auto/autodetectutility.exe\nNvidia: http://www.nvidia.com/Download/Scan.aspx?lang=en-us");
                        break;
                    case (logFile.includes("########## GL ERROR ##########") && logFile.includes("Post render") && logFile.includes("1286: Invalid framebuffer operation")):
                        bot.reply(message, "\n**Automated Response** \nYour graphics card seems to be having issues with Stencil Buffering.\nPlease goto the **launcher Options**_(top right)_\nThen click on the tab called \"Video Settings\"\nThen disable the option called \"Stencil Buffer\"");
                        break;
                    case (logFile.includes("Caught exception from MapWriter") && logFile.includes("java.lang.RuntimeException: Unknown character") && logFile.includes("MapWriter.cfg")):
                        bot.reply(message, "\n**Automated Response** \nIt seems MapWriter has screwed up once again. Please delete the modpack by clicking on the modpack in the launcher.\nThen press **delete** in the bottom right corner. Then redownload a fresh copy of the modpack. This will get rid of your world(s).\n\nOtherwise wait for someone to give you instructions on where to find the offending file(s) to delete.");
                        break;
                    case (logFile.includes('_JAVA_OPTIONS')):
                        bot.reply(message, '\n**Automated Response** \nPlease download this file, then RightClick->Run as Administrator.\nThis should clear Java Settings that are being stored in your OS, which interfere with Technic.\nThis script was written by the Moderator Khio, and can be trusted.\nhttp://iamtrue.net/clearJavaEnvVars.bat\n\n**Contents of file:**```bat\n::kill any currently running java processes\ntaskkill /f /im javaw.exe\n::override user set java variables messing with launcher\n::Clears the system variable _JAVA_OPTIONS\nsetx _JAVA_OPTIONS \"\" /m\n::Clears the local variable _JAVA_OPTIONS\nsetx _JAVA_OPTIONS \"\"\n::To let you know if it failed or was successful. Just press esc or enter.\npause```');
                        break;
                    case (logFile.includes('C:\\Program Files (x86)\\Java\\') && logFile.includes('C:\\Program Files (x86)\\Java\\')):
                        bot.reply(message, "\n**Automated Response** \nIn order to update to Java 64-Bit, please go to the link below and download the version for your computer.\nIf using Windows, please use the version Windows Offline (64-Bit).\nhttp://java.com/en/download/manual.jsp\nYou may need to restart your computer after(99% of the time you won't).\nAlso make sure you've got 64-bit java selected & 2gb(minimum) or 4gb(max) of ram allocated in **launcher Options**_(top right)_ --> \"Java Settings\".");
                        break;
                    case (logFile.includes("Error occurred during initialization of VM") || logFile.includes("Could not reserve enough space for object heap") || logFile.includes("insufficient memory for the Java")):
                        bot.reply(message, "\n**Automated Response** \nYou're allocating more ram than you have available. Please decrease ram allocation in launcher options or close programs.\n");
                        break;
                    default:
                        console.log("Solution not found for " + message.attachments[0].url);
                        //bot.sendMessage(message, 'Solution not found.');
                        break;
                }
            }
        });
    }

    function userRoles(userID) {
        var userObj = bot.users.get("id", userID);
        var roles = message.channel.server.rolesOfUser(userObj);
        var i = 0;
        var rolesOfUser = [];
        for (i; i < roles.length; i++) {
            rolesOfUser.push(roles[i].name.toLowerCase());
        }
        return rolesOfUser;
    }

    function userIsWhitelisted() {
        if (userWhitelist.userinfo[userid] != null) {
            return userWhitelist.userinfo[userid].whitelisted;
        } else {
            return false;
        }
    }

    function channelIsWhitelisted() {
        if (channelWhitelist.serverinfo[serverid] != null) {
            return channelWhitelist.serverinfo[serverid].whitelist.indexOf(message.channel.id);
        } else {
            return -1;
        }
    }

    function addProject(userID, messageID, messageObj) {
        console.log('in addProject');
        console.log('THIS IS THE MSG OBJ ' + messageObj);
        if (projectlist.projects[userID] != null) {
            console.log('in if');
            projectlist.projects[userID].projectIDs.push(messageID);
            projectlist.projects[userID].messageObjects.append(messageObj);

        } else if (projectlist.projects[userID] == null) {
            console.log('in else');
            projectlist.projects[userID] = {"projectIDs": [], "messageObjects": []};
            projectlist.projects[userID].projectIDs.push(messageID);
        }
        console.log('Made it out');

        fs.writeFile('./config/projectlist.json', JSON.stringify(projectlist), 'utf8', function (error) {
            if (error) {
                console.log(logerror('ERROR ADDING TO LIST!'));
            }
            console.log('in addProject writefile');
            readWhitelist('projectlist');
        });
    }

    function updateProject(userID, messageID) {
        if (projectlist.projects[userID] != null) {
            return projectlist.projects[userID].projectIDs.indexOf(messageID)
        } else {
            return -1;
        }
    }
    function puts(error, stdout, stderr) { sys.puts(stdout) }

    if (!message.channel.isPrivate) {
            var bot_permissions = message.channel.permissionsOf(bot.user.id);
            var bot_can_invite = bot_permissions.hasPermission("createInstantInvite");
            var bot_can_kick = bot_permissions.hasPermission("kickMembers");
            var bot_can_ban = bot_permissions.hasPermission("banMembers");
            var bot_can_manage_roles = bot_permissions.hasPermission("manageRoles");
            var bot_can_manage_permissions = bot_permissions.hasPermission("managePermissions");
            var bot_can_manage_channels = bot_permissions.hasPermission("manageChannels");
            var bot_can_manage_channel = bot_permissions.hasPermission("manageChannel");
            var bot_can_manage_server = bot_permissions.hasPermission("manageServer");
            var bot_can_read = bot_permissions.hasPermission("readMessages");
            var bot_can_send = bot_permissions.hasPermission("sendMessages");
            var bot_can_send_tts = bot_permissions.hasPermission("sendTTSMessages");
            var bot_can_manage_messages = bot_permissions.hasPermission("manageMessages");
            var bot_can_embed = bot_permissions.hasPermission("embedLinks");
            var bot_can_attach = bot_permissions.hasPermission("attachFiles");
            var bot_can_read_history = bot_permissions.hasPermission("readMessageHistory");
            var bot_can_mention_everyone = bot_permissions.hasPermission("mentionEveryone");
            var bot_can_voice_connect = bot_permissions.hasPermission("voiceConnect");
            var bot_can_voice_speak = bot_permissions.hasPermission("voiceSpeak");
            var bot_can_voice_mute = bot_permissions.hasPermission("voiceMuteMembers");
            var bot_can_voice_deafen = bot_permissions.hasPermission("voiceDeafenMembers");
            var bot_can_voice_move = bot_permissions.hasPermission("voiceMoveMembers");
            var bot_can_voice_use_vad = bot_permissions.hasPermission("voiceUseVAD");
            var userid = message.author.id;
            var serverid = message.channel.server.id;

        var messages = {
            "serverid":message.channel.server.id,
            "servername":message.channel.server.name,
            "channelid":message.channel.id,
            "channelname":message.channel.name,
            "_id":message.id,
            "authorid":message.author.id,
            "authorname":message.author.username,
            "content":message.content,
            "deleted":false
        };
        if (message.author.id !== bot.id) {
            db.messages.insert(messages, function (err, newDoc) {   // Callback is optional
                if (err) {
                    console.log(err);
                    return;
                }
            });
        }


            if (channelIsWhitelisted() > -1 || userIsWhitelisted() || userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1) {
                if (mSplit[0] === prefix) {
                    console.log('[' + timestamp + '] ' + 'COMMAND RECEIVED: from ' + message.author.username + '[' + message.author.id + "] in " + message.channel.server + "[" + message.channel.server.id + "]/" + message.channel.name + "[" + message.channel.id + "]");


                    //132361699738124289 programming projects

                    if (mSplit[1] === 'addproject') {
                        console.log('1');
                        var projectMessage = mSplit.splice(2).join(' ');
                        bot.sendMessage('132366337770127360', 'Project ID: ', function (error, sentMessage) {
                            if (error) {
                                console.log(logerror(error));
                                return;
                            }
                            if (sentMessage) {
                                console.log('ADDDDDDDD$#^ ' + sentMessage);
                                console.log('2');
                                var sMsgID = sentMessage.id;
                                var newProjectMessage = 'Project ID: ' + sMsgID + '\n' + projectMessage;
                                addProject(message.author.id, sentMessage.id, sentMessage);

                                bot.updateMessage(sentMessage, newProjectMessage, function (error, modMsg) {
                                    if (error) {
                                        console.log(logerror(error));
                                        bot.reply(error);
                                    }
                                    console.log('3');
                                });
                                console.log('4');
                                console.log('Added project: ' + sentMessage.id);
                            }
                        });
                    }

                    if (mSplit[1] === 'updateproject') {
                        console.log('Author ID:' + message.author.id);
                        console.log('mSplit[2]: ' + mSplit[2]);
                        console.log('Result of updateProject: ' + updateProject(message.author.id, mSplit[2]));
                        var arrayProjectValue = updateProject(message.author.id, mSplit[2]);
                        if (arrayProjectValue > -1) {
                            var newprojectMessage = mSplit.splice(3).join(' ');
                            var userID = message.author.id;
                            bot.updateMessage(projectlist.projects[userID].messageObjects[arrayProjectValue], 'Project ID: ' + mSplit[2] + '\n' + newprojectMessage, function (error, modMsg) {
                                if (error) {
                                    console.log(logerror(error));
                                    bot.reply(error);
                                    return;
                                }
                                console.log('Updated project: ' + modMsg.id);
                                bot.reply(message, 'Updated project: ' + modMsg.id);
                            });
                        } else {
                            bot.reply(message, 'This is either not your project or your Project ID is wrong.');
                        }
                    }


                    //DEVELOPER MODULE ~~START~~
                    if (userIsWhitelisted()) {
                        if (mSplit[1] === 'add') {
                            if (mSplit[2] === 'user') {
                                var memberUsername = bot.users.get("id", cleanID(mSplit[3]));
                                addUserWhitelist(cleanID(mSplit[3]), memberUsername.username);
                                console.log(userWhitelist);
                                bot.reply(message, 'Added ' + memberUsername.username + ' :thumbsup:');
                                //bot.reply(message, JSON.stringify(userWhitelist));
                            }
                            if (mSplit[2] === 'channel') {
                                addChannelWhitelist(cleanID(mSplit[3]), message.channel.server.id);
                                //console.log(channelWhitelist);
                                bot.reply(message, 'Added ' + mSplit[2] + ' :thumbsup:');
                                //bot.reply(message, JSON.stringify(channelWhitelist));
                            }
                            if (mSplit[2] === 'server') {
                                addServer(cleanID(message.channel.server.id));
                                //console.log(channelWhitelist);
                                bot.reply(message, 'Added ' + mSplit[2] + ' :thumbsup:');
                                //bot.reply(message, JSON.stringify(channelWhitelist));
                            }
                        }

                        if (mSplit[1] === 'reload') {
                            readWhitelist('channelwhitelist');
                            readWhitelist('userwhitelist');
                            readWhitelist('projectlist');
                            //readWhitelist('badwords');
                            readBlackLists();
                            readSongList();
                            bot.reply(message, 'Reloaded :thumbsup:');
                        }

                        if (mSplit[1] === 'logout') {
                            bot.logout(function (error) {
                                if (error) {
                                    console.log('Problems logging out!');
                                    console.log(error);
                                    return;
                                }
                                console.log('Logged out successfully!');
                            });
                        }

                        if (mSplit[1] === 'setavatar') {
                            fs.readdir('./images/avatars/', function (err, files) {
                                if (err) {
                                    console.log('Set avatar file reader broken');
                                    return;
                                }
                                var numPics = files.length;
                                if (mSplit[2] <= numPics && mSplit[2] > 0) {
                                    var base64str = base64_encode('./images/avatars/profile' + mSplit[2] + '.jpg');
                                    bot.updateDetails({avatar: 'data:image/jpeg;base64,' + base64str}, function (error) {
                                        if (error) {
                                            console.log(logerror(error));
                                            bot.reply(message, 'Do I look pretty?. ^_^  ');
                                        }
                                    });
                                } else {
                                    bot.reply(message, 'You appear to have inputted a number that is **not** between 1 and ' + numPics);
                                }
                            });
                        }

                        if (mSplit[1] === 'setStatus') {
                            bot.setStatus(mSplit[2], 'test', function (err) {
                                if (err) {
                                    bot.sendMessage(message, 'Dun goofed: ' + err);
                                    console.log(logerror(err));
                                    return;
                                }
                                //bot.sendMessage(message, 'Status: ' + mSplit[2] + ' Game: test');
                                console.log('Status: ' + mSplit[2] + ' Game: test');
                            });
                        }

                        if (mSplit[1] === 'setusername') {
                            var newUsername = mSplit.splice(2).join(' ');
                            bot.updateDetails({username: newUsername}, function (error) {
                                if (error) {
                                    console.log(logerror(error));
                                    bot.reply(message, 'Username changed to: ' + newUsername);
                                }
                            });
                        }
                        if (mSplit[1] === 'eval') {
                            var toEval = mSplit.splice(2).join(' ');
                            try {
                                var evaluation = eval(toEval);
                            } catch (e) {
                                console.log(logerror(e.stack));
                                bot.sendMessage(message, '```' + e.stack + '```');
                                return;
                            }
                            bot.sendMessage(message, '```' + evaluation + '```');
                        }
                    }
                    if (mSplit[1] === 'setgame') {
                        var gameStatus = mSplit.splice(2).join(' ');
                        bot.setPlayingGame(gameStatus, function (error) {
                            if (error) {
                                bot.reply(message, 'Problem setting the game ;(');
                            }
                        });
                    }
                    if (mSplit[1] === 'userwhitelist') {
                        bot.reply(message, JSON.stringify(userWhitelist));
                    }

                    if (mSplit[1] === 'leave_server') {
                        bot.leaveServer(mSplit[2]);
                    }

                    if (mSplit[1] === "add_server") {
                        serverFilesExist(message.channel.server.id);
                    }

                    if (mSplit[1] === "search") {
                        if (mSplit[2] === null) {
                            bot.reply(message, "Database not specified.");
                            return;
                        }
                        if (mSplit[3] === null) {
                            bot.reply(message, "Key not specified.");
                            return;
                        }
                        if (mSplit[4] === null) {
                            bot.reply(message, "Value not specified.");
                            return;
                        }

                        var whatToSearchFor = mSplit.slice(4).join(" ");
                        databaseFindAll(mSplit[2], mSplit[3], whatToSearchFor, function (err, searches) {
                            if (err) {
                                console.log(err);
                                bot.reply(message, err);
                                return;
                            }
                            console.log(searches);
                            var data = {
                                "title": "Zhu Li Database search",
                                "data": searches,
                                "language": "text",
                                "private": true,
                                "expires": 21600
                            };
                            if (searches == null || searches.length <= 0) {
                                bot.reply(message, "\nNothing found in database: messages with the field " + mSplit[2] + " and a key of " + mSplit[3]);
                            } else {
                                stickyNotes.sticky(JSON.stringify(data), function (error, paste) {
                                    if (error) {
                                        console.log(error);
                                        bot.reply(message, "\nResults of search (max of 6):\n" + searches.slice(0, 6), function (err, success) {
                                            if (err) {
                                                bot.sendMessage(message, err);
                                                console.log(err);
                                                return;
                                            }
                                            //console.log("success");
                                        });
                                        return;
                                    }
                                    console.log(paste);
                                    console.log(paste.id);
                                    bot.reply(message, "Results of search:\n" + "https://paste.lemonmc.com/" + paste.result.id + "/" + paste.result.hash);
                                });
                            }
                        });
                    }

                    if (mSplit[1] === "clean") {
                        //console.log("called");
                        bot.getChannelLogs(message.channel, 100, {before:message.id}, function(err, channelLogs) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            //console.log(channelLogs.length);
                            for (var i = 0;i < channelLogs.length; i++) {
                                //console.log(channelLogs[i].author.id === bot.user.id);
                                if (channelLogs[i].author.id === bot.user.id) {
                                    //console.log("in if");
                                    bot.deleteMessage(channelLogs[i], 1000, function (err, success) {
                                        if(err) {
                                            console.log(err);
                                            return;
                                        }
                                    });
                                }
                            }
                        });
                    }
/*
                    if (mSplit[1] === "update") {
                        switch(mSplit[2]) {

                            case "indev":
                                bot.sendMessage(message, "Pulling from indev and restarting!");
                                bot.logout(function(err) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    var child = child_process.spawn('updateindev.exe', { detached: true, stdio: [ 'ignore', out, err ] });
                                    child.unref();
                                    /*
                                    var child = child_process.spawn("updateindev.exe", []);
                                    child.stdout.on('data', function (data) {
                                        process.stdout.write(data.toString());
                                    });

                                    child.stderr.on('data', function (data) {
                                        process.stdout.write(data.toString());
                                    });

                                    child.on('close', function (code) {
                                        console.log("Finished with code " + code);
                                        bot.login(config.email, config.password, function(error, token) {
                                            if (error) {
                                                console.log('Problem occurred while logging in! ' + error);
                                                return;
                                            }
                                            console.log('-----------------------------------------------------------------------------');
                                            console.log('Useragent: ' + bot.userAgent.full);
                                            console.log('Token: ' + token);
                                            readWhitelist('channelwhitelist');
                                            readWhitelist('userwhitelist');
                                            readWhitelist('projectlist');
                                            readBlackLists();
                                            readSongList ();
                                        });

                                    });

                                });
                                break;

                            case "stable":
                                bot.sendMessage(message, "Pulling from stable and restarting!");
                                bot.logout(function(err) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    //child_process.execFileSync("updatestable.exe");
                                    var child = child_process.spawn('updatestable.exe', { detached: true, stdio: [ 'ignore', out, err ] });
                                    child.unref();
                                });
                        }

                    }
 */

                    //DEVELOPER MODULE ~~END~~


                    //Music Module ~~~START~~

                    if (mSplit[1] === 'song') {
                        if (!isvclocked || userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1 || userIsWhitelisted()) {
                            if (mSplit[2] === 'info' || mSplit[2] === 'help') {
                                bot.reply(message, '``gensokyo radio`` | ``anime`` | ``instrumental`` | ``jpop`` | ``touhou radio`` | ``random`` |``dropbox link`` | ``songname(from songlist.txt)``\nBe aware that anything not .mp3 may have problems.', function (error, sentMessage) {
                                    if (error) {
                                        console.log(error);
                                        return;
                                    }
                                    bot.sendFile(message, './config/songlist.txt', 'songlist.txt', function(err,success) {
                                        if (err) {
                                            console.log(logerror(err));
                                            return;
                                        }
                                        console.log("success");
                                    });
                                });
                                return;
                            } else {
                                if (inVoiceChannel) {
                                    console.log("I'm in");
                                    var ytregexp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
                                    var youtubeID = mSplit[2].match(ytregexp);
                                    if (youtubeID != null) {
                                        console.log('YoutubeID: ' + youtubeID[1]);
                                        console.log('Inside the regexp');

                                        var ytstream = ytdl('http://www.youtube.com/watch?v=' + youtubeID[1]);

                                        ytstream.on('error', function (err) {
                                            console.error(logerror(err));
                                            bot.sendMessage(message, err);
                                            return;
                                        });

                                        ytstream.pipe(fs.createWriteStream('youtubevideo.flv'));

                                        ytstream.on('finish', function () {

                                            ytdl.getInfo('http://www.youtube.com/watch?v=' + youtubeID[1], function (err, info) {
                                                if (err) {
                                                    console.log(logerror(err));
                                                    return;
                                                }
                                                console.log(info);
                                                //bot.sendMessage(message, info.author info.view_count);
                                            });

                                            bot.voiceConnection.playFile('./youtubevideo.flv', {
                                                volume: 0.1,
                                                stereo: true
                                            }, function (err, str) {
                                                if (err) {
                                                    console.error(logerror(err));
                                                    return;
                                                }
                                                console.log('Success: ' + str);
                                                return stream = './youtubevideo.flv';
                                            });
                                        });
                                    } else {
                                        var stream;
                                        var lcMessage = mSplit.splice(2).join(' ').toLowerCase();
                                        //console.log(lcMessage);
                                        //console.log(lcMessage.indexOf("http://"));
                                        //console.log(lcMessage.indexOf("gensokyo radio"));
                                        switch (0) {

                                            case lcMessage.indexOf("http://"):
                                                console.log('http');
                                                stream = lcMessage;
                                                console.log("I'm going to stream: " + stream);
                                                break;

                                            case lcMessage.indexOf("anime"):
                                                console.log('anime');
                                                var animeList = ['listen.radionomy.com/radio-openings-animes', 'listen.radionomy.com/airanimemusicradio', 'listen.radionomy.com/animeanthology-thesoundofthepast', 'streaming.radionomy.com/AnimeGold', 'streaming.radionomy.com/RadioAnimex-musicaanimeymuchomas-?ad=radionoweb', 'streaming.radionomy.com/AnimeClassicsRadioMOE', '158.69.9.92:443/', 'streaming.radionomy.com/AnimeClassicsRadioTwo', 'streaming.radionomy.com/AnimeClassicsRadio1', 'streaming.radionomy.com/AnimeToday', 'streaming.radionomy.com/Radio-Anime', 'listen.radionomy.com/animeextremonet', 'listen.radionomy.com/anime-stereo', 'listen.radionomy.com/-f-a-radio-animes', 'listen.radionomy.com/anime3000', 'listen.radionomy.com/animeradionet', 'listen.radionomy.com/manganimema', 'listen.radionomy.com/radioanimemx'];
                                                //http://listen.radionomy.com/airanimemusicradio

                                                var shuffledAnime = shuffleArray(animeList);

                                                var animeLength = shuffledAnime.length;
                                                console.log("radioLength: " + animeLength);
                                                var randAnime = Math.floor((Math.random() * animeLength));
                                                console.log("randRadio: " + randAnime);
                                                console.log("radioList[randRadio]: " + shuffledAnime[randAnime]);
                                                stream = "http://" + shuffledAnime[randAnime];
                                                console.log("stream: " + stream);
                                                bot.sendMessage(message, 'Playing: http://' + shuffledAnime[randAnime]);
                                                break;

                                            case lcMessage.indexOf("instrumental"):
                                                console.log('instrumental');
                                                var instrumentalList = ['listen.radionomy.com/instrumental-hits', 'listen.radionomy.com/instrumentals-forever', 'listen.radionomy.com/superinstrumental', 'listen.radionomy.com/instrumentalimate', 'listen.radionomy.com/arotoinstrumentalradio', 'listen.radionomy.com/instrumentalmusic'];

                                                var shuffledInstrumental = shuffleArray(instrumentalList);

                                                var instrumentalLength = shuffledInstrumental.length;
                                                console.log("instrumentalLength: " + instrumentalLength);
                                                var randInstrumental = Math.floor((Math.random() * instrumentalLength));
                                                console.log("randInstrumental: " + randInstrumental);
                                                console.log("shuffledInstrumental[randInstrumental]: " + shuffledInstrumental[randInstrumental]);
                                                stream = "http://" + shuffledInstrumental[randInstrumental];
                                                console.log("stream: " + stream);
                                                bot.sendMessage(message, 'Playing: http://' + shuffledInstrumental[randInstrumental]);
                                                break;

                                            case lcMessage.indexOf("jpop"):
                                                console.log('jpop');
                                                var jpopList = ['listen.radionomy.com/japanjpopjrockanime', '198.178.123.14:7002/', 'listen.radionomy.com/j-popprojectradio'];

                                                var shuffledJpop = shuffleArray(jpopList);

                                                var jpopLength = shuffledJpop.length;
                                                console.log("jpopLength: " + jpopLength);
                                                var randJpop = Math.floor((Math.random() * jpopLength));
                                                console.log("randJpop: " + randJpop);
                                                console.log("shuffledJpop[randJpop]: " + shuffledJpop[randJpop]);
                                                stream = "http://" + shuffledJpop[randJpop];
                                                console.log("stream: " + stream);
                                                bot.sendMessage(message, 'Playing: http://' + shuffledJpop[randJpop]);
                                                break;

                                            case lcMessage.indexOf("gensokyo radio"):
                                                console.log('gensokyo');
                                                stream = 'http://216.17.100.29:8000';
                                                console.log(stream);
                                                break;

                                            case lcMessage.indexOf("touhou radio"):
                                                console.log('touhou radio');
                                                stream = 'http://37.59.41.178:8000/;?1451814084772.mp3';
                                                console.log(stream);
                                                break;

                                            case lcMessage.indexOf("random"):
                                                console.log('random');
                                                var listLength = songList.length;
                                                var randSong = Math.floor((Math.random() * listLength) + 1);
                                                stream = "C:/Users/Berwyn/Music/music/" + songList[randSong];
                                                bot.sendMessage(message, 'Playing: ' + songList[randSong]);
                                                console.log(stream);
                                                break;

                                            default:
                                                console.log('default');
                                                console.log(lcMessage);
                                                stream = "C:/Users/Berwyn/Music/music/" + lcMessage;
                                                console.log('stream: ' + stream);
                                                break;
                                        }
                                        bot.voiceConnection.playFile(stream, {
                                            volume: 1,
                                            stereo: true
                                        }, function (err, str) {
                                            if (err) {
                                                console.error(logerror(err));
                                                return;
                                            }
                                            console.log('Success');
                                            return stream;
                                        });
                                    }
                                }
                            }
                        }
                    }
                    if (mSplit[1] === 'vcstop') {
                        if (!isvclocked || userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1 || userIsWhitelisted()) {
                            if (inVoiceChannel) {
                                bot.voiceConnection.stopPlaying();
                            }
                        }
                    }
                    if (mSplit[1] === 'vcjoin') {
                        if (!isvclocked || userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1 || userIsWhitelisted()) {
                            console.log('Voice Channel request from' + message.author.username);
                            var channelToJoin = mSplit.splice(2).join(' ');
                            console.log("Attempting to join: " + channelToJoin);
                            for (var vcchannel of message.channel.server.channels) {
                                if (vcchannel instanceof Discord.VoiceChannel) {
                                    if (!channelToJoin || vcchannel.name === channelToJoin) {
                                        bot.reply(message, "I joined");
                                        console.log(vcchannel);
                                        bot.joinVoiceChannel(vcchannel);
                                        //console.log(vcchannel);
                                        return inVoiceChannel = true;
                                    }
                                }
                            }
                        }
                    }
                    if (mSplit[1] === 'vcleave') {
                        if (!isvclocked || userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1 || userIsWhitelisted()) {
                            if (inVoiceChannel) {
                                bot.reply(message, 'Leaving :sob:');
                                bot.leaveVoiceChannel();
                                return inVoiceChannel = false;
                            }
                            bot.reply(message, "I need to be in one to leave one.");
                        }
                    }
                    if (userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1 || userIsWhitelisted()) {
                        if (mSplit[1] === 'vclock') {
                            bot.reply(message, "Locked :thumbsup:");
                            return isvclocked = true;
                        }
                        if (mSplit[1] === 'vcunlocklock') {
                            bot.reply(message, "Unlocked :thumbsup:");
                            return isvclocked = false;
                        }
                    }

                    //Music Module ~~~END~~


                    //MODERATION MODULE ~~START~~

                    if (mSplit[1] === 'banlist') {
                        if (!bot_can_manage_server) {
                            bot.reply(message, 'I do not have the manageServer permission.');
                            return;
                        }
                        bot.getBans(message.channel.server, function (error, users) {
                            console.log('RANS');
                            if (error) {
                                console.log(logerror(error));
                                bot.reply(message, 'Error: ' + error);
                                return;
                            }
                            bot.reply(message, 'bans: ' + users.toString());
                        });
                    }
                    //MODERATION MODULE ~~END~~


                    //ADMINISTRATION MODULE ~~START~~

                    if (mSplit[1] === 'roles') {
                        if (mSplit[2] != null) {
                            bot.reply(message, userRoles(cleanID(mSplit[2])));
                            return;
                        }
                        bot.reply(message, userRoles(message.author.id));
                    }

                    if (mSplit[1] === 'permissions') {
                        console.log(bot_permissions.serialise());
                    }

                    /*
                     if (mSplit[1] === 'number') {

                     if (Math.floor(parseInt(mSplit[2], 10) > 0)) {
                     //var div = Math.floor(number/100);
                     //var rem = number % 100;
                     var div = Math.floor(parseInt(mSplit[2], 10)/100);
                     var rem = parseInt(mSplit[2], 10) % 100;
                     console.log(div);
                     console.log(rem);
                     var i = 0;
                     var array = [];
                     bot.reply(message, 'div: ' + div + ' rem: ' + rem);
                     console.log('div: ' + div + ' rem: ' + rem);
                     for (i; div > 0; i++) {
                     console.log('Ran ' + i + ' times.');
                     array.push(100);
                     div--;
                     }
                     array.push(rem);
                     console.log(array);
                     i = 0;
                     console.log(i);

                     }
                     }
                     */


                    if (userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1 || userIsWhitelisted()) {
                        if (mSplit[1] === 'prune') {
                            if (!bot_can_manage_messages || !bot_can_read_history) {
                                bot.reply(message, 'I do not have the Manage Messages and or Read History permission(s).');
                                return;
                            }
                            console.log('prune called by ' + message.author.username + '\\' + message.author.id);
                            var div = Math.floor(parseInt(mSplit[2], 10) / 100);
                            var rem = parseInt(mSplit[2], 10) % 100;
                            var i = 0;
                            var array = [];
                            for (i; div >= 0; i++) {
                                array.push(100);
                                if (div === 0) {
                                    array.pop();
                                    array.push(rem);
                                    var x = 0;
                                    for (x; x < array.length; x++) {
                                        console.log('second for loop ' + x);
                                        bot.getChannelLogs(message.channel, array[x], {"before": message}, function (error, channelmsgs) {
                                            if (error) {
                                                console.error(logerror(error));
                                                bot.reply(message, error);
                                                return;
                                            }
                                            if (channelmsgs) {
                                                console.log(channelmsgs.length);
                                                var z = 0;
                                                var msgsDel = [];
                                                msgsDel = [];
                                                for (z; z < channelmsgs.length; z++) {
                                                    if (mSplit[3] != null) {
                                                        if (channelmsgs[z].author.id === cleanID(mSplit[3])) {
                                                            msgsDel.push(z);
                                                            bot.deleteMessage(channelmsgs[z], {"wait": 1500}, function (error) {
                                                                if (error) {
                                                                    console.error(logerror(error));
                                                                    bot.sendMessage('404 response received! Ratelimited :(');
                                                                    return;
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        msgsDel.push(z);
                                                        bot.deleteMessage(channelmsgs[z], {"wait": 1500}, function (error) {
                                                            if (error) {
                                                                console.error(logerror(error));
                                                                bot.sendMessage('404 response received! Ratelimited :(');
                                                                return;
                                                            }
                                                        });
                                                    }
                                                }
                                                bot.reply(message, msgsDel.length + " Message(s) deleted");
                                            }
                                        });
                                    }

                                }
                                div--;
                            }
                        }


                        if (mSplit[1] === 'create_channel') {
                            if (!bot_can_manage_channels || !bot_can_manage_channel) {
                                bot.reply(message, 'I do not have the Manage Channels and or Manage Channel permission(s).');
                                return;
                            }
                            bot.createChannel(message.channel.server.id, mSplit[2], mSplit[3], function (error, channel) {
                                console.log('channel: ' + channel);
                                if (error) {
                                    console.log(logerror('error: ' + error));
                                    bot.reply(message, error);
                                    return;
                                }
                                bot.reply(message, 'Created: ' + channel + ' :thumbsup:');
                            });
                        }

                        if (mSplit[1] === 'delete_channel') {
                            if (!bot_can_manage_channels || !bot_can_manage_channel) {
                                bot.reply(message, 'I do not have the Manage Channels and or Manage Channel permission(s).');
                                return;
                            }
                            bot.deleteChannel(cleanID(mSplit[2]), function (error) {
                                console.log('error: ' + error);
                                if (error) {
                                    console.log(logerror(error));
                                    bot.reply(message, error);
                                }
                                bot.reply(message, "I've deleted " + mSplit[2]);
                            });
                        }

                        if (mSplit[1] === 'set_channelname') {
                            if (!bot_can_manage_channels || !bot_can_manage_channel) {
                                bot.reply(message, 'I do not have the Manage Channels and or Manage Channel permission(s).');
                                return;
                            }
                            var getChannel = bot.channels.get("id", cleanID(mSplit[2]));
                            var oldName = getChannel.name;
                            //console.log(oldName);
                            console.log(oldName.name);

                            var newName = mSplit.splice(3).join(' ');
                            bot.setChannelName(cleanID(mSplit[2]), newName, function (err) {
                                if (err) {
                                    console.log(logerror(err));
                                    bot.reply(message, err);
                                    return;
                                }
                                bot.reply(message, "I've set " + oldName + "'s name to " + newName)
                            })
                        }

                        if (mSplit[1] === 'set_topic') {
                            if (!bot_can_manage_channels || !bot_can_manage_channel) {
                                bot.reply(message, 'I do not have the Manage Channels and or Manage Channel permission(s).');
                                return;
                            }
                            if (mSplit[2] === null) return;
                            var topic = mSplit.splice(3).join(' ');
                            bot.setChannelTopic(cleanID(mSplit[2]), topic, function (err) {
                                if (err) {
                                    console.error(logerror(err));
                                    return;
                                }
                                bot.reply(message, "I've set " + mSplit[2] + " topic to " + topic);
                            });
                        }


                        if (mSplit[1] === 'kick') {
                            if (!bot_can_kick) {
                                bot.reply(message, 'I do not have the kickMembers permission.');
                                return;
                            }
                            bot.kickMember(cleanID(mSplit[2]), message.channel.server.id, function (error) {
                                console.log('error: ' + error);
                                if (error) {
                                    console.log(logerror(error));
                                    //bot.reply(message, error);
                                    return;
                                }
                                bot.reply(message, "I've kicked: " + mSplit[2] + " from: " + message.channel.server.id);
                            });
                        }

                        if (mSplit[1] === 'ban') {
                            if (!bot_can_ban) {
                                bot.reply(message, 'I do not have the banMembers permission.');
                                return;
                            }
                            bot.banMember(cleanID(mSplit[2]), message.channel.server.id, mSplit[3], function (error) {
                                console.log('error: ' + error);
                                if (error) {
                                    console.error(logerror(error));
                                    //bot.reply(message, error);
                                    return;
                                }
                                bot.reply(message, "I've banned: " + mSplit[2] + " from: " + message.channel.server.id);
                            });
                        }

                        if (mSplit[1] === 'unban') {
                            if (!bot_can_ban) {
                                bot.reply(message, 'I do not have the banMembers permission.');
                                return;
                            }
                            bot.unbanMember(cleanID(mSplit[2]), message.channel.server.id, function (error) {
                                console.log(JSON.stringify(error));
                                if (error) {
                                    bot.reply(message, JSON.stringify(error));
                                    bot.reply(message, "I've unbanned " + mSplit[2] + " (probably)");
                                    console.error(logerror(error));
                                    //bot.reply(message, error);
                                    return;
                                }
                                bot.reply(message, "I've unbanned: " + mSplit[2] + " from: " + message.channel.server.id);
                            });
                        }
                    }
                    //Administration Module ~~END~~


                    //System Module ~~START~~

                    if (mSplit[1] === 'system') {
                        var freeMem = os.freemem();
                        var totalMem = os.totalmem();
                        var cpuCores = os.cpus();
                        var platformType = os.type();
                        var platform = os.platform();
                        var platformArch = os.arch();
                        var uptime = os.uptime();
                        bot.reply(message,
                            '\n**Memory**: ' + freeMem + 'bytes of ' + totalMem + ' bytes'
                            + '\n**CPU(s)**: x' + cpuCores.length + '  ' + cpuCores[0].model
                            + '\n**OS**: ' + platformType + '/' + platform + '/' + platformArch
                            + '\n**Uptime**: ' + uptime + 'seconds'
                        );
                    }
                    if (mSplit[1] === 'hostname') {
                        bot.reply(message, os.hostname());
                    }


                    //System Module ~~END~~
                    if (mSplit[1] === "profile") {
                        mojang.profile(mSplit[2], function(err, profile) {
                            if (err) {
                                console.error(logerror(err));
                                bot.reply(message, err);
                                return;
                            }
                            console.log("Profile:  " + profile);
                            bot.reply(message, "\n**Username:** " + profile.name + "\n**UUID:** " + profile.id);
                        });
                    }

                    if (mSplit[1] === "modpack") {
                        if (mSplit[2] == null) {
                            bot.reply(message, "You didn't specify a modpack");
                            return;
                        }
                        if (mSplit[3] == null) {
                            bot.reply(message, "You didn't specify a version");
                            return;
                        }
                        technic.modpack(mSplit[2], mSplit[3], function(error, modpack) {
                            if (error) {
                                console.error(error);
                                bot.reply(message, error);
                                return;
                            }

                            console.log(modpack);
                            var modpackInfo = [];
                            for (var i=0;i < modpack.mods.length;i++) {
                                var modInfo = "";
                                modInfo += "\n" + modpack.mods[i].name +  "[";
                                modInfo += modpack.mods[i].version +"]";
                                modpackInfo.push(modInfo);
                            }
                            var charLength = modpackInfo.join().length + 100;
                            if (charLength >= 2000) {
                                /*
                                pastebin
                                    .createPaste(modpackInfo.join(), mSplit[2]+"["+mSplit[3]+"]")
                                    .then(function (data) {
                                        // paste succesfully created, data contains the id
                                        console.log(data);
                                        bot.reply(message, "\n**Modpack**: " + mSplit[2] + " version " + mSplit[3] + ",\n**Minecraft Version**: " + modpack.minecraft + ",\n**Forge Version**: " + modpack.forge + ",\n\n**MODS**:\nhttp://pastebin.com/" + data);
                                    })
                                    .fail(function (err) {
                                        // Something went wrong
                                        console.log(err);
                                    });
                                    */

                                var data = {"title":"","data": modpackInfo.join(),"language":"text","private":true,"expires":21600};

                                stickyNotes.sticky(JSON.stringify(data), function(error, paste) {
                                    if (error) {
                                        console.log(error);
                                        return;
                                    }
                                    console.log(paste);
                                    console.log(paste.id);
                                    bot.reply(message, "\n**Modpack**: " + mSplit[2] + " version " + mSplit[3] + ",\n**Minecraft Version**: " + modpack.minecraft + ",\n**Forge Version**: " + modpack.forge + ",\n\n**MODS**:\n" + "https://paste.lemonmc.com/" + paste.result.id + "/" + paste.result.hash);
                                });

                            } else {
                                bot.reply(message, "\n**Modpack**: " + mSplit[2] + " version " + mSplit[3] + ",\n**Minecraft Version**: " + modpack.minecraft + ",\n**Forge Version**: " + modpack.forge + ",\n\n**MODS**:" + modpackInfo);
                            }
                        });
                    }

                    if (mSplit[1] === "status") {
                        mojang.status(function(err, status) {
                            if (err) {
                                console.error(logerror(err));
                                bot.reply(message, err);
                                return;
                            }
                            if (mSplit[2] !== null) {

                            } else {

                            }
                            for(var x=0; x < status.length; x++) {
                                var keys = Object.keys(status);
                                console.log(keys);
                            }
                            //console.log("Status:  " + status);
                            bot.reply(message, status);
                        });
                    }

                    if (mSplit[1] === "gw2") {
                        switch (mSplit[2]) {
                            case "price":
                                if(mSplit[3] == null) return;
                                gw2.price(mSplit[3],function(err, item) {
                                    if (err) {
                                        console.error(logerror(err));
                                        return;
                                    }
                                    bot.reply(message,"Item: " + item.id + "\nBuying " + item.buys.quantity + " at " + item.buys.unit_price + "\nSelling " + item.sells.quantity + " at " + item.sells.unit_price);
                                });
                                break;
                            case "exchange":
                                if(mSplit[3] == null) return;
                                if(mSplit[4] == null) return;
                                gw2.exchange(mSplit[3], mSplit[4],function(err, rate) {
                                    if (err) {
                                        console.error(logerror(err));
                                        return;
                                    }
                                    if (rate.text == undefined) {
                                        bot.reply(message,"\nNot enough coins for the current exchange rate.");
                                        return;
                                    }
                                    switch(mSplit[3]) {
                                        case "gems":
                                            bot.reply(message,"\nCoins per gem: " + rate.coins_per_gem + "\nFor " + mSplit[4] + " gems, you'd get " + rate.quantity + " coins.");
                                            break;
                                        case "coins":
                                            bot.reply(message,"\nCoins per gem: " + rate.coins_per_gem + "\nFor " + mSplit[4] + " coins, you'd get " + rate.quantity + " gems.");
                                            break;
                                    }
                                });
                                break;
                        }

                    }
                }
            }
        if (message.attachments[0] != undefined) {
                var attachmentFilename = message.attachments[0].filename.toLowerCase();
                console.log(attachmentFilename.includes('techniclauncher'));
                console.log(attachmentFilename.includes('.log'));
                if (attachmentFilename.includes('techniclauncher') && attachmentFilename.includes('.log')) {

                    var file = fs.createWriteStream("./data/technic.log");
                    var request = https.get(message.attachments[0].url, function (response) {
                        response.pipe(file);
                        file.on('finish', function () {
                            logReader.detectProblems("./data/technic.log", function (err, solutions) {
                                if (err) {
                                    console.error(logerror(err));
                                    //bot.reply(message, err);
                                    return;
                                }
                                //console.log(solutions);
                                var charLength = solutions.join().length + 27;
                                if (charLength >= 2000) {
                                    var splicedArray = solutions.splice(1, solutions.length - 1);
                                    bot.reply(message, "\n**Automated Response**:\n" + splicedArray);
                                    bot.reply(message, solutions[solutions.length]);
                                } else {
                                    bot.reply(message, "\n**Automated Response**:\n" + solutions);
                                }
                            });


                        })
                    });

                    request.on('error', function (err) {
                        console.error(logerror(err));
                    });

                    var storage = fs.createWriteStream("./data/" + "[" + logTime() + "]__@" + message.author.id + "__" + attachmentFilename);
                    var request2 = https.get(message.attachments[0].url, function (response2) {
                        response2.pipe(storage);
                    });
                    request2.on('error', function (err) {
                        console.error(logerror(err));
                    });
                }

                if (attachmentFilename.includes('dxdiag') && attachmentFilename.includes('.txt')) {

                    var file = fs.createWriteStream("./dxdiag.txt");
                    var request = https.get(message.attachments[0].url, function (response) {
                        response.pipe(file);
                        file.on('finish', function () {
                            //console.log("We're in 999999nein");
                            readDxDiag();
                        });
                    });

                    request.on('error', function (err) {
                        console.error(logerror(err));
                    });
                }
            }

        if (message.channel.server.id === '42463947818795009' || message.channel.id === '102588320181125120') {
            //console.log("M****** I AM IN THE STASH");
            blacklistedWord(message);
        }
        if (mSplit[1] === "beep") {
            switch(mSplit[2]) {
                case "off":
                    return beep = false;
                case "on":
                    return beep = true;
            }
        }
    }
});

//bot.on('warn', console.log);
//bot.on('error', console.log);
//bot.on('debug', console.log);


bot.on('messageDeleted', function(msg, channel) {
    if (msg == undefined || msg == null) {
        //console.error(logerror(err));
        //To the abyss with errors
        //*cackles*
        return;
    }
    console.log(lognotice('[' + timestamp + '] ' + 'MESSAGE DELETED: ') + "in " + channel.server.name +"[" + channel.server.id + "]/" + channel.name +"[" + channel.id + "/" + msg.author + "[" + msg.author.id + "] || [" + msg.id + "] " + msg.content );
});

bot.on('messageUpdated', function(oldMSG, newMSG) {
    console.log(newMSG.channel);
    console.log(lognotice('[' + timestamp + '] ' + 'MESSAGE UPDATE: ') + newMSG.channel.server.name + '[' + newMSG.channel.server.id + ']/' + newMSG.channel.name + '[' + newMSG.channel.id + ']/' + newMSG.author.username + '[' + newMSG.author.id  + "] updated message. " + oldMSG.content  + ' --> ' + newMSG.content );
    if (newMSG.channel.server.id === '42463947818795009' || newMSG.channel.server.id === '97805743893270528' || newMSG.channel.server.id === '102588320181125120') {
        blacklistedWord(newMSG);
    }
});

bot.on('presence', function(oldUserObj, newUserObj) {
    var state = jsondiffpatch.diff(newUserObj, oldUserObj);
    if (state.username !== undefined || state.avatarurl !== undefined || state.game !== undefined) {
        //console.log(lognotice('[' + timestamp + '] ' + 'USER UPDATED: ') + JSON.stringify(state));
        if(state.username !== undefined) {
            blacklistedStatus(newUserObj.username, newUserObj);
        }
        //{"game":{"name":["zz","z"]}}
        //{"game":[{"name":"ROBLOX"},null]}
        if (state.game !== undefined) {
            if(state.game.name !== undefined && state.game.name.length > 0 && state.game.name[0] !== null) {
                //console.log("1 " + state.game.name[0]);
                blacklistedStatus(state.game.name[0], newUserObj);
            } else if (state.game[0] !== undefined && state.game[0] !== null && state.game[0].name !== undefined && state.game[0].name !== null && state.game[0].name.length > 0 ){
                //console.log("2 " + state.game[0].name);
                blacklistedStatus(state.game[0].name, newUserObj);
            }
        }
    }
});

var os = process.platform;
var _dataPath = os == "win32" ? process.env.APPDATA : os == 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local';
_dataPath += "/BetterDiscord/settings/";
var file = _dataPath + "Settings.json";

function settingsjson(pathToFile, callback) {
    fs.open(file,'w', function(err, fd) {
        if (err) {
            console.log(err);
            if(callback) {
                callback(err,null);
            }
            return;
        }
        //success below here
        if(callback) {
            callback(null,fd);
        }
    });
}

bot.on('serverCreated', function(server) {
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER CREATED: ') + server);
});

bot.on('serverDeleted', function(server) {
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER DELETED: ') + server);
});

bot.on('serverUpdated', function(oldServer, newServer) {
    var state = jsondiffpatch.diff(newServer, oldServer);
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER UPDATED: ') + JSON.stringify(state));
});

bot.on('channelCreated', function(channel) {
    console.log(lognotice('[' + timestamp + '] ' + 'CHANNEL CREATED: ') + channel.name + '[' + channel.id + '] was created');
});

bot.on('channelDeleted', function(channel) {
    console.log(lognotice('[' + timestamp + '] ' + 'CHANNEL DELETED: ') + channel.name + '[' + channel.id + '] was deleted');
});

bot.on('channelUpdated', function(oldChannel, newChannel) {
    var state = jsondiffpatch.diff(newChannel, oldChannel);
    console.log(lognotice('[' + timestamp + '] ' + 'CHANNEL UPDATED: ') + oldChannel.name + '[' + oldChannel.id + '] was updated to: '+ JSON.stringify(state));
});

bot.on('serverRoleCreated', function(role) {
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER ROLE CREATED: ') + role.name);
});

bot.on('serverRoleDeleted', function(role) {
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER ROLE DELETED: ') + role);
});

bot.on('serverRoleUpdated', function(oldRole, newRole) {
    var state = jsondiffpatch.diff(newRole, oldRole);
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER ROLE UPDATED: ') + JSON.stringify(state));
});

bot.on('serverNewMember', function(server, user) {
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER NEW MEMBER: ') + user.name + '['+ user.id + '] joined ' + server.name + '[' + server.id + ']');
    if (server.id === '42463947818795009'  || server.id === '97805743893270528') {
        blacklistedName(user.username);
    }

    var join = {
        "serverid":server.id,
        "servername":server.name,
        "userid":user.id,
        "username":user.username
    };

    db.join.insert(join, function (err, newJoin) {   // Callback is optional
        if (err) {
            console.log(err);
            return;
        }
    });
});

bot.on('serverMemberRemoved', function(server, user) {
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER MEMBER REMOVED: ') + user.name + '['+ user.id + '] left ' + server.name + '[' + server.id + ']');

    var leave = {
        "serverid":server.id,
        "servername":server.name,
        "userid":user.id,
        "username":user.username
    };

    db.leave.insert(leave, function (err, newLeave) {   // Callback is optional
        if (err) {
            console.log(err);
            return;
        }
    });
});

bot.on('serverMemberUpdated', function(server, user) {
    console.log(lognotice('[' + timestamp + '] ' + 'SERVER MEMBER UPDATED: ') + server.name + '[' + server.id + ']' + user.username + "[" + user.id + "]");
});

bot.on('userBanned', function(user, server) {
    console.log(lognotice('[' + timestamp + '] ' + 'USER BANNED: ') + user.name + '['+ user.id + '] was banned from ' + server.name + '[' + server.id + ']');
    var userBanned = {
        "serverid":server.id,
        "servername":server.name,
        "userid":user.id,
        "username":user.username
    };

    db.banned.insert(userBanned, function (err, newLeave) {   // Callback is optional
        if (err) {
            console.log(err);
            return;
        }
    });
});

bot.on('userUnbanned', function(user, server) {
    console.log(lognotice('[' + timestamp + '] ' + 'USER UNBANNED: ') + user.name + '[' + user.id + '] was unbanned from ' + server.name + '[' + server.id + ']');
    var userUnbanned = {
        "serverid": server.id,
        "servername": server.name,
        "userid": user.id,
        "username": user.username
    };

    db.unbanned.insert(userUnbanned, function (err, newLeave) {   // Callback is optional
        if (err) {
            console.log(err);
            return;
        }
    });
});

    bot.on('voiceJoin', function (voiceChannel, user) {
        if (user.voiceChannel !== null) {
            console.log(lognotice('[' + timestamp + '] ' + 'VOICE JOIN: ') + user.name + '[' + user.id + '] joined voice channel ' + voiceChannel.server.name + '[' + voiceChannel.server.id + ']/' + voiceChannel.name + '[' + voiceChannel.id + ']');
            var voiceJoin = {
                "serverid": voiceChannel.server.id,
                "servername": voiceChannel.server.name,
                "voicechannelid": voiceChannel.id,
                "voicechannnelname": voiceChannel.name,
                "userid": user.id,
                "username": user.username
            };

            db.vcjoin.insert(voiceJoin, function (err, newLeave) {   // Callback is optional
                if (err) {
                    console.log(err);
                    return;
                }
            });
        }
    });

    bot.on('voiceLeave', function (voiceChannel, user) {
        //console.log(voiceChannel);
            console.log(user.voiceChannel);
            //console.log(user);
            console.log(lognotice('[' + timestamp + '] ' + 'VOICE LEAVE: ') + user.name + '[' + user.id + '] left voice channel ' + voiceChannel.server.name + '[' + voiceChannel.server.id + ']/' + voiceChannel.name + '[' + voiceChannel.id + ']');
            var voiceLeave = {
                "serverid": voiceChannel.server.id,
                "servername": voiceChannel.server.name,
                "voicechannelid": voiceChannel.id,
                "voicechannnelname": voiceChannel.name,
                "userid": user.id,
                "username": user.username
            };

            db.vcleave.insert(voiceLeave, function (err, newLeave) {   // Callback is optional
                if (err) {
                    console.log(err);
                    return;
                }
            });
    });

    bot.on("voiceStateUpdate", function (channel, user, oldState) {
        var state = jsondiffpatch.diff(user.voiceState, oldState);

        if (user.voiceChannel !== null) {
            console.log(lognotice('[' + timestamp + '] ' + 'VOICE UPDATE: ') + user.name + "[" + user.id + "] in " + channel.server.name + "[" + channel.server.id + "]/" + user.voiceChannel.name + "[" + user.voiceChannel.id + "] changed " + JSON.stringify(state));
        }
    });

bot.on('disconnected', console.error);

bot.on('error', console.error);

/*
ws.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        message.pipe(github);
    });

    ws.send('something');
});



github.on('*', function (event, repo, ref, data) {
    console.log("* " + event + repo + ref + data);
});

github.on('event', function (repo, ref, data) {
    console.log("event " + repo + ref + data);
});

github.on('event:reponame', function (ref, data) {
    console.log("event:reponame " + ref + data);
});

github.on('event:reponame:ref', function (data) {
    console.log("event:reponame:ref " + data);
});

github.on('reponame', function (event, ref, data) {
    console.log("reponame " + event + ref + data);
});

github.on('reponame:ref', function (event, data) {
    console.log("reponame:ref " + event  + data);
});
*/

/*

bot.on('unknown', function(data) {
    console.log('unknown: ' + data);
});

bot.on('raw', function(data) {
    console.log('raw: ' + data);
});
 bot.on('userTypingStarted', function(user, channel) {
 console.log('userTypingStarted:' + channel + '/' + user);
 });

 bot.on('userTypingStopped', function(user, channel) {
 console.log('userTypingStopped:' + channel + '/' + user);
 });

 */