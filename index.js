'use strict';
/**
 * Created by Berwyn on 12/27/2015.
 */

var fs = require('fs');
var http = require('http');

var Discord = require('discord.js');
var bot = new Discord.Client();

var config = require('./config/config.js');

bot.userAgent = {"url":"https://github.com/Lord-Ptolemy/Rosalina-Bottings","version":"0.2.0"};
bot.login(config.email, config.password, function(error, token) {
    if (error) {
        console.log('Problem occurred while logging in! ' + error);
        return;
    }
    console.log('-----------------------------------------------------------------------------');
    console.log('Useragent: ' + bot.userAgent.full);
    console.log('Token: ' + token);

});

bot.on('ready', function onReady() {
    //readUserWhitelist();
    readWhitelist('channelwhitelist');
    readWhitelist('userwhitelist');
    readWhitelist('projectlist');
    console.log('Username: ' + bot.user.username);
    console.log('ID: ' + bot.user.id);
    console.log('Servers: ' + bot.servers.length);
    console.log('Channels: ' + bot.channels.length);
    console.log('-----------------------------------------------------------------------------');
});




//used to script < @ > , from IDs to get only the numbers
function cleanID(messageToClean) {
    var regexp = new RegExp("\\d","g");
    var numbers = messageToClean.match(regexp);
    return messageToClean = numbers.toString().replace(/,/g, "");
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}


var userWhitelist; //json object containing keys for whitelisted user IDs
var channelWhitelist; //json object containing keys for whitelisted channel IDs
var projectlist; //JSON object containing the entire project list of the Programming Server

function readWhitelist(whitelistToRead) {
    fs.readFile('./config/' + whitelistToRead +'.json', 'utf8', function (err, data) {
        if (err) {
            console.error('Problem with ' + whitelistToRead + ' list. Is it populated?');
            console.error(err);
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
        }catch(e) {
            console.error('Problem parsing the json. Is the list populated?');
        }
    });
}

function addServer(serverID) {

    channelWhitelist.serverinfo[serverID] = {"whitelist":[]};

    fs.writeFile('./config/channelwhitelist.json',  JSON.stringify(channelWhitelist), 'utf8', function (error) {
        if (error) {
            console.log('ERROR ADDING TO WHITELIST!');
        }
        readWhitelist('channelwhitelist');
    });
}

function addUserWhitelist(usersID, userName) {
    userWhitelist.userinfo[usersID] = {"username":userName, "whitelisted":true};

    fs.writeFile('./config/userwhitelist.json',  JSON.stringify(userWhitelist), 'utf8', function (error) {
        if (error) {
            console.log('ERROR ADDING TO WHITELIST!');
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
            console.log('ERROR ADDING TO WHITELIST!');
        }
        readWhitelist('channelwhitelist');
    });
}


//var array_channelWhitelist = ['111075786936623104', '114957491716096003', '114957522636374017', '102588320181125120', '112150043858837504', '112150135697358848', '112150249539158016', '112150012649078784', '115593364522401793'];
//var array_userWhitelist = ['102529479179509760'];
var inVoiceChannel = false;
var isvclocked = false;

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
            bot.joinServer(mSplit[0]);
            bot.sendMessage(message, "I've joined, but be warned that I do not respond to anyone, but my owner in un-whitelisted servers. \nContact him here:\nhttps://discord.gg/0hBikJKBJHYqQwoR");
        }
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
                console.log('ERROR ADDING TO LIST!');
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


        if (channelIsWhitelisted() > -1 || userIsWhitelisted() || userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1) {
            if (mSplit[0] === prefix) {
                console.log('Command received! from ' + message.author.username + '\\' + message.author.id);


                //132361699738124289 programming projects

                if (mSplit[1] === 'addproject') {
                    console.log('1');
                    var projectMessage = mSplit.splice(2).join(' ');
                    bot.sendMessage('132366337770127360', 'Project ID: ', function (error, sentMessage) {
                        if (error) {
                            console.log(error);
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
                                    console.log(error);
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
                                bot.reply(err);
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
                        readWhitelist('userwhitelist');
                        readWhitelist('channelwhitelist');
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
                                        bot.reply(message, 'Do I look pretty?. ^_^  ');
                                    }
                                });
                            } else {
                                bot.reply(message, 'You appear to have inputted a number that is **not** between 1 and ' + numPics);
                            }
                        });
                    }

                    if (mSplit[1] === 'setusername') {
                        var newUsername = mSplit.splice(2).join(' ');
                        bot.updateDetails({username: newUsername}, function (error) {
                            if (error) {
                                bot.reply(message, 'Username changed to: ' + newUsername);
                            }
                        });
                    }
                    if (mSplit[1] === 'eval') {
                        var toEval = mSplit.splice(2).join(' ');
                        try {
                            var evaluation = eval(toEval);
                        } catch (e) {
                            bot.sendMessage(message, '```' + e.stack + '```');
                            return;
                        }
                        bot.sendMessage(message, '```' + evaluation + '```');
                    }
                }
                if (mSplit[1] === 'setgame') {
                    console.log('failed');
                    bot.setPlayingGame(mSplit[2], function (error) {
                        if (error) {
                            bot.reply(message, 'Problem setting the game ;(');
                        }
                    });
                }
                if (mSplit[1] === 'userwhitelist') {
                    bot.reply(message, JSON.stringify(userWhitelist));
                }
                //DEVELOPER MODULE ~~END~~


                //Music Module ~~~START~~

                if (mSplit[1] === 'song') {
                    if (!isvclocked || userRoles(message.author.id).indexOf("admin") > -1 || userRoles(message.author.id).indexOf("administrator") > -1 || userRoles(message.author.id).indexOf("mod") > -1 || userRoles(message.author.id).indexOf("moderator") > -1 || userIsWhitelisted()) {
                        if (mSplit[2] === 'info' || mSplit[2] === 'help') {
                            bot.reply(message, '.! song ``anime`` | ``jpop`` | ``gensokyo`` | ``dropbox link`` | ``songname(from songlist.txt)``\nBe aware that anything not .mp3 may have problems.', function (error, sentMessage) {
                                if (error) {
                                    console.log(error);
                                    return;
                                }
                                bot.sendFile(message, './config/songlist.txt', 'songlist');
                            });
                            return;
                        } else {
                            if (inVoiceChannel) {
                                var stream;
                                var lcMessage = mSplit[2].toLowerCase();
                                switch (lcMessage) {
                                    case "anime":
                                        console.log('anime');
                                        stream = 'http://158.69.9.92:443/';
                                        console.log(stream);
                                        break;
                                    case "jpop":
                                        console.log('jpop');
                                        stream = 'http://198.178.123.14:7002/';
                                        console.log(stream);
                                        break;
                                    case "gensokyo":
                                        console.log('gensokyo');
                                        stream = 'http://216.17.100.29:8000';
                                        console.log(stream);
                                        break;
                                    case message.content.substr(message.content.indexOf("http://")):
                                        console.log('http');
                                        stream = mSplit[2];
                                        break;
                                    default:
                                        console.log('default');
                                        console.log(lcMessage);
                                        stream = "D:/non-touhou/" + mSplit.splice(2).join(' ');
                                        console.log(stream);
                                        break;
                                }
                                bot.voiceConnection.playFile(stream, {volume: 0.5, stereo: true}, function (err, str) {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    console.log('Success: ' + str);
                                });
                            }
                        }
                    }
                }
                if (mSplit[1] === 'stop' && !isvclocked) {
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
                    } if (mSplit[1] === 'vcunlocklock') {
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
                            console.log('ERRORED');
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
                        var div = Math.floor(parseInt(mSplit[2], 10)/100);
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
                                    bot.getChannelLogs(message.channel, array[x], {"before": message.id}, function (error, channelmsgs) {
                                        if (error) {
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
                                                                console.error(error);
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    msgsDel.push(z);
                                                    bot.deleteMessage(channelmsgs[z], {"wait": 1500}, function (error) {
                                                        if (error) {
                                                            console.error(error);
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
                        if (!bot_can_manage_channels || bot_can_manage_channel) {
                            bot.reply(message, 'I do not have the Manage Channels and or Manage Channel permission(s).');
                        }
                        bot.createChannel(message.channel.server.id, mSplit[2], mSplit[3], function (error, channel) {
                            console.log('error: ' + error);
                            console.log('channel: ' + channel);
                            if (error) {
                                bot.reply(message, error);
                                return;
                            }
                            bot.reply(message, 'Created: ' + channel + ' :thumbsup:');
                        });
                    }

                    if (mSplit[1] === 'delete_channel') {
                        bot.deleteChannel(cleanID(mSplit[2]), function (error) {
                            console.log('error: ' + error);
                            if (error) {
                                bot.reply(message, error);
                            }
                            bot.reply(message, "I've deleted " + mSplit[2]);
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
                                console.log(error);
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
                                console.log(error);
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
                                //bot.reply(message, error);
                                return;
                            }
                            bot.reply(message, "I've unbanned: " + mSplit[2] + " from: " + message.channel.server.id);
                        });
                    }
                }
            }
        }
    }
});

//bot.on('warn', console.log);
//bot.on('error', console.log);
//bot.on('debug', console.log);


bot.on('messageDeleted', function(msg) {
    console.log('messageDeleted: ' + msg);
});

bot.on('messageUpdated', function(msg) {
    console.log('messageUpdated: ' + msg);
});

bot.on('serverCreated', function(server) {
    console.log('serverCreated: ' + server);
});

bot.on('serverDeleted', function(server) {
    console.log('serverDeleted: ' + server);
});

bot.on('serverUpdated', function(oldServer, newServer) {
    console.log('serverUpdated: ' + oldServer + ' -> ' + newServer);
});

bot.on('channelCreated', function(channel) {
    console.log('channelCreated: ' + channel);
});

bot.on('channelDeleted', function(channel) {
    console.log('channelDeleted: ' + channel);
});

bot.on('channelUpdated', function(channel) {
    console.log('channelUpdated: ' + channel);
});

bot.on('serverRoleCreated', function(role) {
    console.log('serverRoleCreated: ' + role);
});

bot.on('serverRoleDeleted', function(role) {
    console.log('serverRoleDeleted: ' + role);
});

bot.on('serverRoleUpdated', function(oldRole, newRole) {
    console.log('serverRoleUpdated: ' + oldRole + ' -> ' + newRole);
});

bot.on('serverNewMember', function(server, user) {
    console.log('serverNewMember: ' + server + '/' + user);
});

bot.on('serverMemberRemoved', function(server, user) {
    console.log('serverMemberRemoved: ' + server + '/' + user);
});

bot.on('serverMemberUpdated', function(server, user) {
    console.log('serverMemberUpdated: ' + server + '/' + user);
});

bot.on('userUpdated', function(oldUser, newUser) {
    console.log('userUpdated: ' + oldUser.username + ' -> ' + newUser.username);
});

bot.on('userBanned', function(user, server) {
    console.log('userBanned: ' + server + '/' + user);
});

bot.on('userUnbanned', function(user, server) {
    console.log('userUnbanned: ' + server + '/' + user);
});

bot.on('voiceJoin', function(user, voiceChannel) {
    console.log('voiceJoin: ' + voiceChannel + '/' + user);
});

bot.on('voiceLeave', function(user, voiceChannel) {
    console.log('voiceLeave: ' + voiceChannel + '/' + user);
});

bot.on('disconnected', console.log);

bot.on('error', console.log);


/*
bot.on('warn', console.log);

bot.on('warn', console.log);

bot.on('debug', function(msg) {
    console.log('debug: ' + msg);
});

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

 bot.on('presence', function(user, status, gameID) {
 console.log('presence: ' + user + '/' + status + '/' + gameID);
 });

 */


/*
var commands = {
    "test": function() {
        console.log("This test function worked");
    }
};


var message = "!commands test";
var mSplit = message.split(" ");

if (mSplit[0] === "!commands") {
    if (mSplit[1] in commands) {
        commands[mSplit[1]]();
    }
}

*/
