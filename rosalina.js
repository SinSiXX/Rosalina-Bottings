/* This bot is super inefficient in the way it does things. I already know this. I will be doing an entire rewrite sometime in the future.*/
var Discord = require("./lib/discord.js");
var S = require('./lib/string');
var winston = require('./lib/winston');
var d20 = require('./lib/d20');
var parseString = require('./lib/xml2js').parseString;
var http = require('http');
var Wiki = require('wikijs');
var wiki = new Wiki();
var bot = new Discord.Client();
var cleverbot = require("./lib/cleverbot.io");
var clever = new cleverbot('API USER','API KEY/PASS');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            name: 'chat-file',
            filename: 'chat.log',
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'badlang-file',
            filename: 'badlang.log',
            level: 'warn'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'debug.log',
            level: 'error'
        })
    ]
});
var rosaStatus = 1;
var greetOn = 1;
var goodbyeOn = 1;
var commandCount = [];
var cleverStatus = 1;
var cleverUsage = 0;
var lastCommandUsed = "";

function xmlToJson(url, callback) {
    var req = http.get(url, function (res) {
        var xml = '';

        res.on('data', function (chunk) {
            xml += chunk;
        });

        res.on('error', function (e) {
            callback(e, null);
        });

        res.on('timeout', function (e) {
            callback(e, null);
        });

        res.on('end', function () {
            parseString(xml, function (err, result) {
                callback(null, result);
            });
        });
    });
}


bot.on("message", function(message) {
    var stringTest = S(message.content.toLowerCase())
    var badWords = stringTest.contains("vulgar language") || stringTest.contains("nigger") || stringTest.contains("nig-nog") || stringTest.contains("nignog") || stringTest.contains("niglet") || stringTest.contains("night club bomber") || stringTest.contains("allahu akbar") || stringTest.contains("fuck you")|| stringTest.contains("kill your self") || stringTest.contains("nigga");
    var greetings = message.content === "hi" || stringTest.contains("Mornin'") || stringTest.contains("hello") || stringTest.contains("greetings") || stringTest.contains("good evening") || stringTest.contains("good morning") || stringTest.contains("good afternoon") || message.content ==="morning"|| message.content ==="afternoon"|| message.content ==="evening"|| message.content ==="hola" || message.content ==="hola.";
    var goodByes = stringTest.contains("goodbye") || stringTest.contains("getting off") || stringTest.contains("cya") || stringTest.contains("gotta go") || stringTest.contains("heading off") || stringTest.contains("bye");
    var commandList = ["``!info``","``!help``", "``!commands``", "``!greet off``", "``!greet on``", "``!farewell off``", "``!farewell on``", "``just do it!``", "``!coin``", "``!wat``", "``!roll xd4``", "``!roll xd6``", "``!roll xd8``", "``!roll xd10``", "``!roll xd12``", "``!roll xd20``", "``!roll xd100``", "``success!``", "``r.i.p``", "``rest in peace``", "``!horrible``", "``cake``", "``\\o/``", "``\\o``", "``o/``", "``!id``", "``!avatar``", "``!game #``", "``!on``", "``!off``", "``!uptime``", "``!getavatar @mention``", "``!channelid``", "``!serverid``", "``!members``", "``!imgur(not implemented)``"];
    var mentionRosa = "<@111424758314213376>";
    var rosaId = "111424758314213376";
    //var botBlackList = "";
    //var userBlackList = "";
    var roleBlackList = message.sender.role !== "moderateur";
    ///var serverWhitelist = [];
    var channelWhitelist = ["102588320181125120","112185703961534464","94831883505905664","81402706320699392","110374132432011264","113477047145238528","95657260969103360","103028520011190272"]
    var userWhitelist = ["102529479179509760","102528327251656704"]
    if (channelWhitelist.indexOf(message.channel.id) !== -1 && message.sender.roles.indexOf !== "Bots" || userWhitelist.indexOf(message.sender.id) !== -1 && message.sender.roles.indexOf !== "Bots") {



        if (stringTest.contains(mentionRosa + " !wiki")) {
            var searchWiki = message.content.substring(28);
                wiki.page('searchWiki').then(function(page) {
                    page.info().then(function(info) {
                        bot.reply(message, (info['alter_ego'])); // Bruce Wayne
                    });
                });

        }

        if (message.content) {
            var memberId = message.sender.id;
            var userName = message.sender.username;
            logger.log("info", "[Chat]: " + memberId + " " + userName + ": " + message.content);
        }

        if (message.content === mentionRosa + " !info" && rosaStatus !== 0) {
            bot.reply(message, "```Bot created by: Lord Ptolemy \n Contact Info: \n - Steam: <http://steamcommunity.com/id/Actowolfy> \n - DiscordID: 102529479179509760  \n Current Version: 0.0.1 \n Libraries: Discord.js, Winston, String.js, d20, & xml2js \n TODO: Implement groups to prevent abuse of certain commands.```");
            return lastCommandUsed = "!info";
        } else {

        }

        if (message.content === "!lastCommand") {
            bot.reply(message, "Last command used: " + lastCommandUsed);
            return lastCommandUsed = "!lastCommand";
        }

        if (stringTest.contains("shipping") || stringTest.contains("loli") || stringTest.contains("box")) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.sendFile(message, "images/loliinabox.jpg", "loliinabox.jpg");
                bot.reply(message, "Loli in a box. Shipping starts in 2016");
            }
        }

        if (message.content === "!cleverStatus") {
            bot.reply(message, "\n" + "cleverStatus is set to: ``" + cleverStatus + "``\n" + "!clever has been called: ``" + cleverUsage + "`` times.");
        }


        if (stringTest.contains("!wat") && rosaStatus !== 0 ) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.sendMessage(message, " https://www.youtube.com/watch?v=2ZPfgVSrPVY");
            }
        } else {

        }

        if (stringTest.contains(mentionRosa + " !serverid")) {
            bot.reply(message, "The server id is: " + "``" +message.channel.server.id + "``");
        } else {

        }

        if (stringTest.contains("r.i.p") && rosaStatus !== 0 || stringTest.contains("rest in peace") && rosaStatus !== 0 || message.content === "rip" && rosaStatus !== 0) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                var randomRIP = Math.floor((Math.random() * 4) + 1);
                bot.sendFile(message, "images/rip/rip" + randomRIP + ".png", "rip" + randomRIP + ".png");
            }
        } else {

        }

        if (stringTest.contains(mentionRosa + " i like your") && rosaStatus !== 0 || stringTest.contains(mentionRosa + " i like that you") && rosaStatus !== 0 || message.content === mentionRosa + " i like you" && rosaStatus !== 0 || stringTest.contains(mentionRosa + " i love your") && rosaStatus !== 0 || stringTest.contains(mentionRosa + " i love that you") && rosaStatus !== 0) {
            bot.reply(message, "Thanks!");
        } else {

        }

        if (stringTest.contains("!horrible") && rosaStatus !== 0) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.sendMessage(message, "https://www.youtube.com/watch?v=yerwwZWXtdQ");
            }
        } else {

        }

        if (stringTest.contains("just do it!") && rosaStatus !== 0) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.sendMessage(message, "https://www.youtube.com/watch?v=ZXsQAXx_ao0");
            }
        } else {

        }

        if (stringTest.contains("cake") && rosaStatus !== 0) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "The cake is a lie");
            }
        } else {

        }

        if (stringTest.contains("success!") && rosaStatus !== 0) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.sendMessage(message, "https://www.youtube.com/watch?v=zb4yFR9qS3A");
            }
        } else {

        }

            /*else {
                var usersAvatar = message.sender.avatarURL;
                logger.log("error", usersAvatar + " PASSED! vanilla");

                if (usersAvatar) { // user has an avatar
                    bot.reply(message, "your avatar can be found at " + usersAvatar);
                } else { // user doesn't have an avatar
                    bot.reply(message, "you don't have an avatar!");
                }
            }
        } else {

        } */
/*
        function buildAvatar(id, id2) { //Thanks Sorch
            if (id2 === null) {
                return null;
            } else {
                return 'https://discordapp.com/api/users/' + id + '/avatars/' + id2 + '.jpg';
            }
        }

        if( stringTest.contains(mentionRosa + " !getavatar") && rosaStatus !== 0 ) { //Thanks Sorch
            bot.reply(message, "\n Mentions: " + "``" +message.mentions + "``" + "\n Mention length: " + "``" +message.mentions.length + "``");

            if (message.mentions.length === 2) {
                var idOfAvatar = message.content.substring(35, 53); // 54

                var usersAvatar = "";
                for (i = 0; i < bot.servers.length; i++) {
                    var avUser = bot.servers[i].getMember(idOfAvatar);
                    if (avUser.id.toString() == idOfAvatar) {
                        usersAvatar = avUser.avatarURL;
                        if (usersAvatar.length > 0) break;
                    }
                }

                if (bot.getUser("id", idOfAvatar) != null) { // user has an avatar
                    var avatar = buildAvatar(idOfAvatar, bot.getUser("id", idOfAvatar).avatar);
                    if (avatar === null) {
                        bot.sendMessage(message, "This person doesn't have an avatar or it's default! :(");
                    } else {
                        bot.sendMessage(message, "this person's avatar can be found at " + avatar);
                    }
                }
            } else if (messsage.content === mentionRosa + " !getavatar"){
                var usersAvatar = message.sender.avatarURL;

                if (usersAvatar) { // user has an avatar
                    bot.reply(message, "your avatar can be found at " + usersAvatar);
                } else { // user doesn't have an avatar
                    bot.reply(message, "you don't have an avatar!");
                }
            }else if (stringTest.contains(mentionRosa + " !getavatar " + mentionRosa)) {
                bot.reply(message, "My avatar can be found at ")
            } else {
                bot.reply(message, "Please don't break me :(");
            }
        }
        */

        if (stringTest.contains(mentionRosa + " !getavatar")) {
            if (stringTest.contains(mentionRosa + " !getavatar " + mentionRosa)) {
                var rosaAvatar = message.mentions[0].avatarURL;
                bot.reply(message, "My avatar can be found here " +rosaAvatar);
            } else if (message.mentions.length === 2) {
                var userAvatarLoc = message.mentions[1].avatarURL;
                bot.reply(message,"Avatar is at: " + userAvatarLoc);
            } else if (message.mentions.length === 1) {
                var sendersAvatar = message.sender.avatarURL;

                if (sendersAvatar) { // user has an avatar
                    bot.reply(message, "your avatar can be found at " + sendersAvatar);
                } else { // user doesn't have an avatar
                    bot.reply(message, "you don't have an avatar!");
                }
            } else {
                bot.reply(message, "Too many mentions. Please don't break me. :(");
            }
        }



        if (badWords) {
            var memberId = message.sender.id;
            var userName = message.sender.username;
            logger.log("warn", "[Problem]: " + memberId + " " + userName + ": " + message.content);
            bot.reply(message, "These word(s) are not allowed.\nFurther use of such language will result in a permanent ban.");
        } else {

        }

        if (message.content === mentionRosa + " !id" && rosaStatus !== 0) {
            var memberId = message.sender.id;
            bot.reply(message, "Your member id is " + memberId);
        } else {

        }

        if (stringTest.contains(mentionRosa + " !getid") && rosaStatus !== 0) {
            var memberId = message.content.substring(31,49); // 54
            bot.reply(message, "This member's id is: " + memberId);
        } else {

        }

        if (message.content === mentionRosa + " !help" && rosaStatus !== 0 || message.content === mentionRosa + " !commands" && rosaStatus !== 0 || message.content === mentionRosa && rosaStatus !== 0) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "For the majority of the commands you need to @mention Rosalina. \n Make sure to **NOT** add extra spaces between the @mention & command. \n ``Example: @Rosalina Bottings !help``. \n \n Current Commands: " + commandList)
            }
        } else {

        }

        if (greetings && rosaStatus !== 0 && greetOn === 1) {
            if (stringTest.contains("``")) {

            } else {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.reply(message, "Hello! ^_^");
                }
            }
        } else {

        }


        if (stringTest.contains(mentionRosa + " !greet off")) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Greetings have been turned off. :(");
                return greetOn = 0;
            }
        } else {

        }

        if (stringTest.contains(mentionRosa + " !greet on")) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Greetings have been turned on. :)");
                return greetOn = 1;
            }
        } else {

        }

        if (message.content === "!greetOn") {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Variable greetOn is currently set to: " + greetOn);
            }
        } else {

        }

        if (message.content === "!goodbyeOn") {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Variable goodbyeOn is currently set to: " + goodbyeOn);
            }
        } else {

        }

        if (goodByes && rosaStatus !== 0 && goodbyeOn !== 0) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Goodbye ;(");
            }
        } else {

        }

        if (stringTest.contains(mentionRosa + " !farewell on")) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Goodbyes have been turned on. :)");
                return goodbyeOn = 1;
            }
        } else {

        }

        if (stringTest.contains(mentionRosa + " !farewell off")) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Goodbyes have been turned off. :(");
                return goodbyeOn = 0;
            }
        } else {

        }

        if (stringTest.contains("\\o/") && rosaStatus !== 0 && greetOn === 1 || stringTest.contains("o/") && rosaStatus !== 0 && greetOn === 1 && !stringTest.contains("/o/") || stringTest.contains("\\o") && rosaStatus !== 0 && greetOn === 1 && !stringTest.contains("\\o\\")) {
            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                if (stringTest.contains("\\o/")) {
                    bot.reply(message, "\\o/");
                }
                else if (stringTest.contains("o/")) {
                    bot.reply(message, "o/");
                }
                else if (stringTest.contains("\\o")) {
                    bot.reply(message, "\\o");
                }
            }
        } else {

        }

        if (message.content === mentionRosa + " !uptime" && rosaStatus !== 0) {
            var totalSec = bot.uptime / 1000;
            var hours = parseInt(totalSec / 3600) % 24;
            var minutes = parseInt(totalSec / 60) % 60;
            var seconds = totalSec % 60;

            var result = (hours < 10 ? "0" + hours : hours) + " hours " + (minutes < 10 ? "0" + minutes : minutes) + " minutes " + Math.round(seconds < 10 ? "0" + seconds : seconds) + " seconds";
            console.log(bot.uptime);
            bot.reply(message, "I've been up for " + result)
        } else {

        }

        if (message.content === mentionRosa + " !off" && rosaStatus !== 0) {
            bot.reply(message, "Turning off.");
            bot.setStatusIdle();
            return rosaStatus = 0;
        } else {

        }

        if (message.content === mentionRosa + " !on") {
            if (rosaStatus === 1) {
                bot.reply(message, "I'm already on...");
            } else {
                bot.reply(message, "Turning on.");
                bot.setStatusOnline();
                return rosaStatus = 1;
                return lastCommandUsed = "!on";
            }
        } else {

        }

        if (stringTest.contains(mentionRosa + " !game") && rosaStatus !== 0) {
            bot.setPlayingGame(Number(message.content.substring(28)));
            bot.reply("Setting game to: " + message.content.substring(28));
        } else {

        }

        if (stringTest.contains(mentionRosa + " !roll") && rosaStatus !== 0) {
            var diceRoll = message.content.substring(28);
            var diceResults = d20.verboseRoll(diceRoll);
            var total = 0;
            for (var i in diceResults) {
                total += diceResults[i];
            }

            bot.reply(message, "You rolled a  " + "``" + diceResults + "``" + "  for a total of  " + "``" + total + "``");
        } else {

        }

        if (stringTest.contains("i'm back") && rosaStatus !== 0 && greetOn === 1 || stringTest.contains("im back") && rosaStatus !== 0 && greetOn === 1 || stringTest.contains("i am back") && rosaStatus !== 0 && greetOn === 1 ) {
            bot.reply(message, "Welcome back!");
        } else {

        }

        if (message.content === mentionRosa + " !channelid" && rosaStatus !== 0) {
            bot.reply(message, "The channel id is: " + "``" + message.channel.id + "``");
        } else {

        }

        if (message.content === mentionRosa + " !members" && rosaStatus !== 0) {
            bot.sendMessage(message, "Current members: \n" + message.channel.members);
        } else {

        }

        if (stringTest.contains(mentionRosa + " !coin") && rosaStatus !== 0) {
            var coinResult = Math.floor(Math.random(1, 2) * 2) + 1
            if (coinResult === 1) {
                bot.reply(message, "flipped ``heads``!");
            } else {
                bot.reply(message, "flipped ``tails``!");
            }
        } else {

        }

        if (stringTest.contains(mentionRosa + " !clever") && rosaStatus !== 0 && cleverStatus !== 0) {
            logger.log("error", "function called! ");

            var userMessage = message.content.substring(33);
            bot.reply(message, "Message to send is: " + userMessage)
            clever.create(function (err, session) {
                // session is your session name, it will either be as you set it previously, or cleverbot.io will generate one for you

                // Woo, you initialized cleverbot.io.  Insert further code here
                clever.ask(userMessage, function (err, response) {
                    if (err === true) {
                        logger.log("error", "Response was null" + response);
                        bot.reply(message, " \n Response: " + response + "\n Error: " + err);
                        //bot.reply(message, "Response from api was null. Disabling Clever commands.");
                        return cleverStatus = 0;
                    } else {
                        logger.log("error", "Response from api:  " + response);
                        bot.reply(response);
                        return cleverUsage++;
                    }
                });
            });
        }

        if (cleverUsage === 999) {
            bot.reply(message, "Cleverbot api limit has been reached. Cleverbot commands have been disabled.");
            return cleverStatus = 0;
        } else {

        }

        if (stringTest.contains(mentionRosa + " !clever") && rosaStatus !== 0 && cleverStatus !== 1) {
            bot.reply(message, "Cleverbot api limit has been reached or has sent back a null response. Cleverbot commands have been disabled.");
        } else {

        }

        if (stringTest.contains(mentionRosa + " !smarton") && rosaStatus !== 0) {
            bot.reply("cleverStatus has been reset to 1");
            return cleverStatus = 1;
        } else {

        }

        if (stringTest.contains(mentionRosa + " !smartoff") && rosaStatus !== 0) {
            bot.reply("cleverStatus has been set to 0");
            return cleverStatus = 0;
        } else {

        }

        if (stringTest.contains(":salty:") && rosaStatus !== 0) {
            bot.sendFile(message, "images/salty.jpg", "salty.jpg");
        }

        if (message.content === mentionRosa + " !gensokyo" && rosaStatus !== 0) {

            var url = "http://gensokyoradio.net/xml/"

            xmlToJson(url, function (err, data) {
                if (err) {
                    // Handle this however you like
                    return
                }

                // Do whatever you want with the data here
                // Following just pretty-prints the object
                var jsonString = JSON.stringify(data);
                radio = JSON.parse(jsonString);

                var lastUpdate = radio.GENSOKYORADIODATA.SERVERINFO[0].LASTUPDATE[0];
                var servers = radio.GENSOKYORADIODATA.SERVERINFO[0].SERVERS[0];
                var status = radio.GENSOKYORADIODATA.SERVERINFO[0].STATUS[0];
                var listeners = radio.GENSOKYORADIODATA.SERVERINFO[0].LISTENERS[0];
                var bitrate = radio.GENSOKYORADIODATA.SERVERINFO[0].BITRATE[0];
                var node = radio.GENSOKYORADIODATA.SERVERINFO[0].MODE[0];
                var aims = radio.GENSOKYORADIODATA.SERVERINFO[0].AIMS[0];

                var songTitle = radio.GENSOKYORADIODATA.SONGINFO[0].TITLE[0];
                var artist = radio.GENSOKYORADIODATA.SONGINFO[0].ARTIST[0];
                var album = radio.GENSOKYORADIODATA.SONGINFO[0].ALBUM[0];
                var year = radio.GENSOKYORADIODATA.SONGINFO[0].YEAR[0];
                var circle = radio.GENSOKYORADIODATA.SONGINFO[0].CIRCLE[0];

                var DURATION = radio.GENSOKYORADIODATA.SONGTIMES[0].DURATION[0];
                var PLAYED = radio.GENSOKYORADIODATA.SONGTIMES[0].PLAYED[0];
                var REMAINING = radio.GENSOKYORADIODATA.SONGTIMES[0].REMAINING[0];
                var SONGSTART = radio.GENSOKYORADIODATA.SONGTIMES[0].SONGSTART[0];
                var SONGEND = radio.GENSOKYORADIODATA.SONGTIMES[0].SONGEND[0];

                var SONGID = radio.GENSOKYORADIODATA.MISC[0].SONGID[0];
                var IDCERTAINTY = radio.GENSOKYORADIODATA.MISC[0].IDCERTAINTY[0];
                var circleLink = radio.GENSOKYORADIODATA.MISC[0].CIRCLELINK[0];
                var albumArt = radio.GENSOKYORADIODATA.MISC[0].ALBUMART[0];
                var circleArt = radio.GENSOKYORADIODATA.MISC[0].CIRCLEART[0];
                var RATING = radio.GENSOKYORADIODATA.MISC[0].RATING[0];
                var TIMESRATED = radio.GENSOKYORADIODATA.MISC[0].TIMESRATED[0];
                var FORCEDELAY = radio.GENSOKYORADIODATA.MISC[0].FORCEDELAY[0];
                bot.sendMessage(message, "Current listeners: " + "``" + listeners + "``" + "\nCurrent Song Info: " + "\nTitle: " + "``" + songTitle + "``" + "\nArtist: " + "``" + artist + "``" + "\nAlbum: " + "``" + album + "``" + "\nCircle: " + "``" + circle + "``" + "\nAlbum Art: " + "\n http://gensokyoradio.net/images/albums/200/" + albumArt + "\n Circle Art: " + "http://gensokyoradio.net/images/circles/" + circleArt);
            });
        } else {

        }

        // http://steamcommunity.com/id/Actowolfy/?xml=1
        // http://steamcommunity.com/profiles/76561198012320511?xml=1
        if (stringTest.contains("steamcommunity.com/profiles/") && rosaStatus !== 0 || stringTest.contains("steamcommunity.com/id/") && rosaStatus !== 0) {
            var test = message.content;
            var regexp = new RegExp("(steamcommunity.com)(/id/[a-z]+|(/profiles/(\d)+))", "i");
            var out = test.match(regexp)[0];

            var memberId = message.sender.id;
            if (memberId === rosaId) {

            } else {
                bot.reply(message, "Correct? " + out);
            }
        }

            /*else {
                var url = message.content + "?xml=1";
                logger.log("error", "Steam url  " + url);

                xmlToJson(url, function (err, data) {
                    if (err) {
                        // Handle this however you like
                        return
                    }

                    // Do whatever you want with the data here
                    // Following just pretty-prints the object
                    var jsonString = JSON.stringify(data);
                    steam = JSON.parse(jsonString);
                    logger.log("error", "Steam json  " + jsonString);

                    bot.reply(message, "xml received");
                });
            }
        }
        */
        /*
         if (stringTest.contains(mentionRosa + " !abc us")) {
         var memberId = message.sender.id;
         if (memberId === rosaId) {

         } else {
         var url = "http://feeds.abcnews.com/abcnews/usheadlines";

         xmlToJson(url, function(err, data) {
         if (err) {
         // Handle this however you like
         return
         }

         // Do whatever you want with the data here
         // Following just pretty-prints the object
         var jsonString = JSON.stringify(data);
         abcUs = JSON.parse(jsonString);
         logger.log("error", "Abc US  " + abcUs);

         bot.reply(message, abcUs);
         });
         }
         }
         */

    }
} );

/*

bot.on("debug", function(msg) {
    logger.log("error", msg);
});

bot.on("unknown", function(data) {
    logger.log("error", data);
});

bot.on("raw", function(data) {

});
*/

bot.login("EMAIL", "PASSWORD");