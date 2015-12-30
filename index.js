'use strict';
/**
 * Created by Berwyn on 12/27/2015.
 */
var Discord = require('discord.js');
var bot = new Discord.Client();
var fs = require('fs');
var config = require('./config/config.js');
var whitelist = require('./config/whitelist.json');


bot.login(config.email, config.password, function(error, token) {
    if (error) {
        console.log('Problem occurred while logging in! ' + error);
        return;
    }
    console.log('-----------------------------------------------------------------------------');
    console.log('Token: ' + token);

});

bot.on('ready', function onReady() {
    //readUserWhitelist();
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


//var userWhitelist = []; //json object containing keys for whitelisted user IDs
/*
function readUserWhitelist() {
    fs.readFile('./config/whitelist.json', 'utf8', function (err, data) {
        if (err) {
            console.error(err);
        }
        console.log(JSON.parse(data));
        return userWhitelist = JSON.parse(data);
    });
}

function addUserWhitelist(usersID) {
    //userWhitelist.usersID = '1';
    //{"102529479179509760":[{"username":"Lord Ptolemy","whitelisted":1}]}
    console.log('String?: ' + usersID.isString);
    userWhitelist = JSON.stringify({"userID":usersID,"username":"Lord Ptolemy","whitelisted":1});



    fs.writeFile('./config/whitelist.json',  userWhitelist, 'utf8', function (error) {
        if (error) {
            console.log('ERROR ADDING TO WHITELIST!');
        }
        //readUserWhitelist();
    });
}



function inUserWhitelist(usersID) {
    if(userWhitelist.hasOwnProperty('usersID')){
        return 1;
    }
    return 0;
}
*/


var channelWhitelist = ['111075786936623104', '114957491716096003', '114957522636374017', '102588320181125120', '112150043858837504', '112150135697358848', '112150249539158016', '112150012649078784', '115593364522401793'];
var array_userWhitelist = ['102529479179509760'];





bot.on("message", function(message) {

    var prefix = config.prefix;
    var mSplit = message.content.split(" ");
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

/*
    var mSplit = message.content.split(" ");

    if (mSplit[0] === prefix) {
        if(mSplit[1].substring(0,10 === '!' {
            var message = mSplitp
        }
    }
    */
/*
    if (mSplit[0] === prefix) {
        if (mSplit[1] === '!add') {
            addUserWhitelist(cleanID(mSplit[2]));
            console.log(userWhitelist);
            bot.reply(message, 'Added :thumbsup:');
        }
    }
*/
    if (message.channel.isPrivate) {
        if (message.author.id !== bot.user.id) {
            bot.joinServer(mSplit[0]);
            bot.sendMessage(message, "I've joined, but be warned that I do not respond to anyone, but my owner in un-whitelisted servers. \nContact him here:\nhttps://discord.gg/0hBikJKBJHYqQwoR");
        }
    }


    if (mSplit[0] === prefix && array_userWhitelist.indexOf(message.author.id) !== -1) {
        if (mSplit[1] === 'addchannel') {
            bot.reply(message, 'Whitelisted channel :thumbsup:');
            return channelWhitelist.push(message.channel.id);
        }
    }

    if (channelWhitelist.indexOf(message.channel.id) !== -1 && array_userWhitelist.indexOf(message.author.id) !== -1 ) {
        if (mSplit[0] === prefix) {
            console.log('Command received!');

            //DEVELOPER MODULE ~~START~~
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

                            var test_base64 = 'data:image/jpeg;base64,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';

                            bot.updateDetails({avatar: 'data:image/jpeg;base64,' + base64str}, function (error) {
                                if(error) {
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
                    bot.updateDetails({username:newUsername}, function (error) {
                        if (error) {
                            bot.reply(message, 'Username changed to: ' + newUsername);
                        }
                    });
                }

            if (mSplit[1] === 'setgame') {
                bot.setStatus('online', mSplit[2], function(error) {
                    if(error) {
                        bot.reply(message, 'Problem setting the game ;(');
                    }
                });
            }
            if (mSplit[1] === 'setgame2') {
                console.log('failed');
                bot.setPlayingGame(mSplit[2], function(error) {
                    if(error) {
                        bot.reply(message, 'Problem setting the game ;(');
                    }
                });
            }
/*
                if (mSplit[1] === 'adduser') {
                    //bot.reply(message, 'Whitelisted user :thumbsup:');
                    //return userWhitelist.push(cleanID(mSplit[2]));
                }
                */

            if (mSplit[1] === 'userwhitelist') {
                bot.reply(message, JSON.stringify(userWhitelist));
            }


                /*
                 if(mSplit[1] === 'base64') {
                 var base64str = base64_encode('./images/avatars/profile' + mSplit[2] + '.jpg');
                 base64_decode(base64str,'./images/avatars/base64.txt');
                 }
                 */
            }
            //DEVELOPER MODULE ~~END~~


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

                if (mSplit[1] === 'create_channel') {
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
                            bot.reply(message, "I've kicked " + mSplit[2] + " (probably)");
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
                    bot.banMember(cleanID(mSplit[2]), message.channel.server.id,  mSplit[3], function (error) {
                        console.log('error: ' + error);
                        if (error) {
                            bot.reply(message, "I've banned " + mSplit[2] + " (probably)");
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
                //ADMINISTRATION MODULE ~~END~~

        }
});


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
