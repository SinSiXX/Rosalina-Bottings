/* This bot is super inefficient in the way it does things. I already know this. I will be doing an entire rewrite sometime in the future.*/
var Discord = require("./lib/discord.js");
var S = require('./lib/string');
var d20 = require('./lib/d20');
var parseString = require('./lib/xml2js').parseString;
var http = require('http');
var Wiki = require('wikijs');
var wiki = new Wiki();
var bot = new Discord.Client();
var Cleverbot = require('./lib/cleverbot');
var fs = require("fs");
var gm = require('gm'), dir = __dirname + 'images/rip/';
var league_api = require('./lib/league-api');
var league = new league_api('[redacted]');
var crawler = require('./lib/youtube-crawler');
var Github = require("github-api");
var github = new Github({
    token: "[redacted]",
    auth: "oauth"
});
var validator = require('validator');
var repo = github.getRepo("actowolfy", "Rosalina-Bottings");
var tools = require('./lib/tools.js');
var gwapi = require ('./lib/gw2api');
var gwreset = require ('./lib/gw2reset/src/core.js');
var gwspidy = require ('./lib/gw2spidy');
var delay = require ('./lib/delayed');
var osuapi = require('osu-api');
var osu = new osuapi.Api('[redacted]');
var osu_mania = new osuapi.Api('[redacted]', osuapi.Modes.osumania);
var imgScramble = require ('./lib/image-scramble');
var request = require('./lib/request');

var _mysql = require('./lib/mysql');

var util = require('util');

/*
 //My local database
 var HOST = '[redacted]';
 var PORT = [redacted];
 var MYSQL_USER = '[redacted]';
 var MYSQL_PASS = '[redacted]';
 var DATABASE = '[redacted];
 var TABLE = '[redacted]';
 */

//my webhost
var HOST = '[redacted]';
var PORT = [redacted];
var MYSQL_USER = '[redacted]';
var MYSQL_PASS = '[redacted]';
var DATABASE = '[redacted]';
var TABLE = '[redacted]';


var mysql = _mysql.createConnection({
    host: HOST,
    port: PORT,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: DATABASE,
    table: TABLE
});


function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}


var rosaStatus = 1;
var greetOn = 1;
var goodbyeOn = 1;
var cleverStatus = 1;
var moderationOn = 1;
var miscOn = 1;
var downloadsOn = 1;
var guildwarsOn = 1;
var osuOn = 1;
var mcOn = 1;
var lolOn = 1;
var gameOn = 1;
var hacky = "No value set";
var scrambleOn = imgScramble[1];
var ForFuckSakes = imgScramble[0];
var GlobalImgToUse = ForFuckSakes;
var ImgScrambleServerReturn = "";
var ImgScrambleServer = ImgScrambleServerReturn;


var commandCount = [];
var cleverUsage = 0;
var lastCommandUsed = "";

var dictKey = "[redacted]";

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
    console.log("MADE IT to message!");
    var TABLE = 'discord_chat';
    var stringTest = S(message.content.toLowerCase());
    var badWords = stringTest.contains("vulgar language") || stringTest.contains("nigger") || stringTest.contains("nig-nog") || stringTest.contains("nignog") || stringTest.contains("niglet") || stringTest.contains("night club bomber") || stringTest.contains("allahu akbar") || stringTest.contains("fuck you")|| stringTest.contains("kill your self") || stringTest.contains("nigga");
    var greetings = message.content === "hi" || stringTest.contains("mornin'") || stringTest.contains("hello") || stringTest.contains("greetings") || stringTest.contains("good evening") || stringTest.contains("good morning") || stringTest.contains("good afternoon") || message.content.toLowerCase() ==="morning"|| message.content.toLowerCase() ==="afternoon"|| message.content.toLowerCase() ==="evening"|| stringTest.contains("hola");
    var goodByes = stringTest.contains("goodbye") || stringTest.contains("getting off") || stringTest.contains("cya") || stringTest.contains("gotta go") || stringTest.contains("heading off") || stringTest.contains("bye") || message.content.toLowerCase() ==="night" || message.content.toLowerCase() ==="night.";
    var commandList = ["``!imgur(not implemented)``"];
    var miscCommands = ["``!servers``", "``!game #``",  "``just do it!``", "``!coin``", "``!wat``", "``!youtube searchtermhere``", "``!roll #d#``", "``success!``", "``r.i.p``", "``rest in peace``", "``!horrible``", "``cake``"];
    var modCommands = ["``!ban``", "``!kick``"];
    var greetCommands = ["``\\o/``", "``\\o``", "``o/``", "``hi``", "``mornin``", "``hello``", "``greetings``", "``good evening``", "``good morning``", "``good afternoon``", "``morning``", "``afternoon``", "``evening``", "``hola``"];
    var farewellCommands = ["``goodbye``", "``getting off``", "``cya``", "``gotta go``", "``heading off``", "``bye``", "``night``"];
    var discordCommands = ["``!help``", "``!commands``", "``!userinfo``", "``!serverinfo``", "``!members``"];
    var devCommands = ["``!help/!commands``", "``!info``", "``!gamelist``", "``!emojilist``", "``!emojishortcutlist``", "``!uptime``"];
    var controlCommands = ["``!on/off``", "``!greet on/off``", "``!farewell on/off``", "``!moderation on/off``", "``!misc on/off``", "``!games on/off``", "``!gw2 on/off``", "``!osu on/off``"];
    var privateCommands = ["!download"];
    var guildwarsCommands = ["``!gw2 guildname``", "``!gw2 guildid``", "``!gw2 servers``"];
    var osuCommands = ["``!osu user``, ``!osu best``"];
    var mcCommands = ["``Under Construction``"];
    var lolCommands = ["``Under Construction``"];
    var gameCommands = ["``!imgscramble``"];
    var GlobalImgToUse = ForFuckSakes;
    var ImgScrambleServer = ImgScrambleServerReturn;

    var mentionRosa = "<@111424758314213376>";
    var rosaId = "111424758314213376";
    var ptolemy = "102529479179509760";
    var botBlackList = ["112592601865072640"];
// var userBlackList = ["121787649198391297"];
// var roleBlackList = message.sender.role !== "moderateur";
//var serverWhitelist = [];
    var channelWhitelist = ["116956709448187905", "112735322504232960","102588320181125120","112185703961534464","94831883505905664","81402706320699392","110374132432011264","113477047145238528","95657260969103360","103028520011190272","116705171312082950","113743192305827841"];
    var userWhitelist = ["102529479179509760","102528327251656704","95654393294098432"];

    var memberId = message.sender.id;
    var userName = message.sender.username;
    var messageContent = message.content;

    if (message.isPrivate == true) {


        console.log( "[Private Message]: " + memberId + "/" + userName + ": " + message.content);
        mysql.query('insert into '+ TABLE +' (private, userid, username, message) values ("' + 1 + '", "' + memberId + '", "' + userName + '", "' + messageContent + '")',
            function selectCb(err, results, fields) {
                if (err) throw err;
                else {

                }
            });

    } else {
        var serverName = message.sender.server.name;
        var serverID = message.sender.server.id;
        var channelName = message.channel.name;
        var channeID = message.channel.id;
        var memberId = message.sender.id;
        var userName = message.sender.username;
        var userID = message.sender.id;
        var messageContent = message.content;
        var userDiscriminator = message.sender.discriminator;

        if (message.sender.server.id !== "97805743893270528") {
            mysql.query('insert into '+ TABLE +' (private, serverid, servername, channelid, channelname, userid, username, userdiscriminator, message) values ("' + 0 + '", "' + serverID + '", "' + serverName + '", "' + channeID + '", "' + channelName + '", "' + memberId + '", "' + userName + '", "' + userDiscriminator + '", "' + messageContent + '")',
                function selectCb(err, results, fields) {
                    if (err) throw err;
                    else {

                    }
                });
        }
        /*
         //http://lanfest.discord.gg
         //https://discord.gg/0dAXLo6DdjoOW9Lr
         //https://discordapp.com/invite/0dAXLo6Ddjp3jRfq
         if (stringTest.contains("discord.gg") && rosaStatus !== 0 || stringTest.contains("discord.me") && rosaStatus !== 0) {
         //var test = message.content;
         //var regexp = new RegExp("(([a-z]|(\d))(.discord.gg)", "i");
         //var out = test.match(regexp);

         //var str = "http://lanfest.discord.gg";
         //var patt1 = new RegExp("\\w","g");
         //var result = str.match(patt1);

         //var test = message.content;
         //var regexp = new RegExp("(steamcommunity.com)(/id/[a-z]+|(/profiles/(\d)+))", "i");
         //var out = test.match(regexp);

         var r = request.get("http://lanfest.discord.gg", function (err, res, body) {
         var test = res.request.uri.href;
         var regexp = new RegExp(" ((//w)(!? invite/)", "i");
         var finalURL = test.match(regexp);
         /*
         console.log( res.request.uri.href);
         bot.sendMessage(message, res.request.uri.href);
         */
        /*
         console.log( res.request.uri.href);
         bot.sendMessage(message, "https://discord.gg/" + finalURL);
         });
         }
         */






        console.log( "[" + getDateTime() + "] " + serverName + "/" + channelName + " [Chat]: " + memberId + "/" + userName + ": " + message.content);

        if (channelWhitelist.indexOf(message.channel.id) !== -1 && message.sender.roles.indexOf(message.sender.roles) !== "Bots" && botBlackList.indexOf(message.sender.id) === -1 || userWhitelist.indexOf(message.sender.id) !== -1 && message.sender.roles.indexOf(message.sender.roles) !== "Bots" && botBlackList.indexOf(message.sender.id) === -1) {


            if (stringTest.contains(mentionRosa + " !help") && rosaStatus !== 0 || stringTest.contains(mentionRosa + " !commands") && rosaStatus !== 0 || message.content === mentionRosa && rosaStatus !== 0) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.reply(message,
                        "For the majority of the commands you need to @mention Rosalina. Also If you see # replace it with a number." +
                        "\n Make sure to **NOT** add extra spaces between the @mention & command. " +
                        "\n ``Example: @Rosalina Bottings !help``. " +
                        "\n \n **Rosa On: [" + rosaStatus + "]**" +
                        "\n \n **Control Commands" + "[" + rosaStatus + "]:** " + controlCommands +
                        "\n \n **Basic Commands" + "[" + rosaStatus + "]:** " + discordCommands +
                        "\n \n **Greet Triggers" + "[" + greetOn + "]:** " + greetCommands +
                        "\n \n **Farewell Triggers" + "[" + goodbyeOn + "]:** " + farewellCommands +
                        "\n \n **Misc Commands" + "[" + miscOn + "]:** " + miscCommands +
                        "\n \n **Dev Commands" + "[" + rosaStatus + "]:** " + devCommands +
                        "\n \n **Mod Commands" + "[" + moderationOn + "]:** " + modCommands +
                        "\n \n **Game Commands" + "[" + gameOn + "]:** " + gameCommands +
                        "\n \n **GW2 Commands" + "[" + guildwarsOn + "]:** " + guildwarsCommands +
                        "\n \n **Osu! Commands" + "[" + osuOn + "]:** " + osuCommands +
                        "\n \n **Minecraft Commands" + "[" + mcOn + "]:** " + mcCommands +
                        "\n \n **LoL Commands" + "[" + lolOn + "]:** " + lolCommands
                    )
                }
            }

            if (message.content === mentionRosa + " !info" && rosaStatus !== 0) {
                bot.reply(message,
                    "```Bot created by: Lord Ptolemy " +
                    "\n Contact Info: " +
                    "\n - Steam: <http://steamcommunity.com/id/Actowolfy> " +
                    "\n - DiscordID: 102529479179509760  " +
                    "\n - Github: <https://github.com/actowolfy/Rosalina-Bottings>" +
                    "\n Current Version: 0.0.1 " +
                    "\n Libraries: Discord.js, Winston, String.js, d20, & xml2js " +
                    "\n TODO: Implement groups to prevent abuse of certain commands.```");
                return lastCommandUsed = "!info";
            } else {

            }

            if (stringTest.contains(mentionRosa + " !resources") && rosaStatus !== 0) {
                console.log(util.inspect(process.memoryUsage()));
                bot.sendMessage(message, util.inspect(process.memoryUsage()));
            }

            if (stringTest.contains(mentionRosa + " !eval") && rosaStatus !== 0) {
                if (message.sender.id == ptolemy) {
                    var toEval = message.content.substring(28);
                    bot.reply(message, "Correct? " + toEval);
                    var evalResult = eval(toEval);
                    bot.sendMessage(message, "Eval: ```" + evalResult + "```");
                } else {
                    bot.reply(message, "Access denied. This has been logged.");
                }
            }

            if (stringTest.contains(mentionRosa + " !imgscramble") && gameOn === 1) {
                var seedToUse = Math.floor((Math.random() * 100000) + 1);
                var sliceSizeToUse = Math.floor((Math.random() * 30) + 1 + 35);
                var imgToUse = Math.floor((Math.random() * 30) + 1);

                bot.reply(message, "Seed: " + seedToUse + "\nSliceSize: " + sliceSizeToUse + " imgToUse: " + imgToUse);
                imgScramble({
                    image: './images/games/imgscramble/' + imgToUse + '.png', // source
                    seed: seedToUse, // seed
                    sliceSize: sliceSizeToUse, // 50 slice size
                    dest: './images/games/imgscramble/scrambled.png' // dest
                }, function (err) {
                    //bot.reply(message, "Help! I broke." + err);
                    //console.log( err);
                    bot.sendFile(message, "./images/games/imgscramble/scrambled.png", "scrambled.png");
                    //return [scrambleOn = 1, imgToUse];
                    //return {'scrambleOn': scrambleOn, 'imgToUse': imgToUse};
                });

                bot.reply(message, "imgToUseTest: " + imgToUse);
                return [ForFuckSakes = imgToUse, scrambleOn = 1 , ImgScrambleServerReturn = message.sender.server.id];
                //bot.sendFile(message, "./images/games/imgscramble/erin_scrambled.png", "erin_scrambled.png");
                //return scrambleOn = 1;
            }

            if (message.content.toLowerCase() === "!scrambleon") {
                bot.reply(message, "ScrambleOn set to ``1``!");
                return scrambleOn = 1;
            }

            if (stringTest.contains(mentionRosa + " !games on") && rosaStatus !== 0 && gameOn !== 1) {
                bot.reply(message, "Games have been turned on!");
                return gameOn = 1;
            }

            if (stringTest.contains(mentionRosa + " !games off") && rosaStatus !== 0 && gameOn !== 0) {
                bot.reply(message, "Games have been turned off!");
                return gameOn = 0;
            }

            if (stringTest.contains(mentionRosa + " !image") && rosaStatus !== 0 && message.sender.id == "102529479179509760") {
                var imageNum = message.content.substring(6,9);
                bot.reply(message, "GlobalImgToUse set to ``" + imageNum + "``!");
                return GlobalImgToUse = imageNum;
            }

            if ( scrambleOn === 1 && message.sender.server.id == ImgScrambleServer) { //I need to switch this to an array or a json file >.> This is a bitch to change
                if (stringTest.contains("erin") && GlobalImgToUse == "1"){
                    bot.sendMessage(message, "The correct answer is erin. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if (stringTest.contains("jarjar") && GlobalImgToUse == "2" || stringTest.contains("jar jar") && GlobalImgToUse == "2"){
                    bot.sendMessage(message, "The correct answer is Jar Jar Binks. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if (stringTest.contains("miku") && GlobalImgToUse == "3" || stringTest.contains("hatsune") && GlobalImgToUse == "3"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("harry") && GlobalImgToUse == "4" || stringTest.contains("potter") && GlobalImgToUse == "4"){
                    bot.sendMessage(message, "The correct answer is Harry Potter. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("cat") && GlobalImgToUse == "5" || stringTest.contains("kat") && GlobalImgToUse == "5" || stringTest.contains("kitty") && GlobalImgToUse == "5"){
                    bot.sendMessage(message, "The correct answer is cat. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("radio") && GlobalImgToUse == "6" || stringTest.contains("boom box") && GlobalImgToUse == "6" || stringTest.contains("music player") && GlobalImgToUse == "6"){
                    bot.sendMessage(message, "The correct answer is Radio. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("pikachu") && GlobalImgToUse == "7"){
                    bot.sendMessage(message, "The correct answer is Pikachu. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("harry") && GlobalImgToUse == "8" || stringTest.contains("potter") && GlobalImgToUse == "8"){
                    bot.sendMessage(message, "The correct answer is Harry Potter. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("miley") && GlobalImgToUse == "9" || stringTest.contains("cyrus") && GlobalImgToUse == "9"){
                    bot.sendMessage(message, "The correct answer is Miley Cyrus. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("sun") && GlobalImgToUse == "10" ||stringTest.contains("star") && GlobalImgToUse == "10"){
                    bot.sendMessage(message, "The correct answer is Sun. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("keyboard") && GlobalImgToUse == "11"){
                    bot.sendMessage(message, "The correct answer is Keyboard. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("dog") && GlobalImgToUse == "12"){
                    bot.sendMessage(message, "The correct answer is Dog. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("keyboard") && GlobalImgToUse == "13"){
                    bot.sendMessage(message, "The correct answer is Keyboard. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("cat") && GlobalImgToUse == "14" || stringTest.contains("kat") && GlobalImgToUse == "14" || stringTest.contains("kitty") && GlobalImgToUse == "14"){
                    bot.sendMessage(message, "The correct answer is Cat. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("car") && GlobalImgToUse == "15" || stringTest.contains("vehicle") && GlobalImgToUse == "15"){
                    bot.sendMessage(message, "The correct answer is Car. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("horse") && GlobalImgToUse == "16"){
                    bot.sendMessage(message, "The correct answer is Horse. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("keyboard") && GlobalImgToUse == "17"){
                    bot.sendMessage(message, "The correct answer is Keyboard. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("keyboard") && GlobalImgToUse == "18"){
                    bot.sendMessage(message, "The correct answer is Keyboard. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("bill") && GlobalImgToUse == "19" || stringTest.contains("gates") && GlobalImgToUse == "19"){
                    bot.sendMessage(message, "The correct answer is Bill Gates. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("bill") && GlobalImgToUse == "20" || stringTest.contains("gates") && GlobalImgToUse == "20"){
                    bot.sendMessage(message, "The correct answer is Bill Gates. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("boat") && GlobalImgToUse == "21" || stringTest.contains("ship") && GlobalImgToUse == "21"){
                    bot.sendMessage(message, "The correct answer is Boat. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("car") && GlobalImgToUse == "22" || stringTest.contains("vehicle") && GlobalImgToUse == "22"){
                    bot.sendMessage(message, "The correct answer is Car. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("car") && GlobalImgToUse == "23" || stringTest.contains("vehicle") && GlobalImgToUse == "23"){
                    bot.sendMessage(message, "The correct answer is Car. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("boat") && GlobalImgToUse == "24" || stringTest.contains("ship") && GlobalImgToUse == "24"){
                    bot.sendMessage(message, "The correct answer is Boat. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("kitty") && GlobalImgToUse == "25" || stringTest.contains("kitten") && GlobalImgToUse == "25" || stringTest.contains("cat") && GlobalImgToUse == "25"){
                    bot.sendMessage(message, "The correct answer is Kitten. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("computer") && GlobalImgToUse == "26"){
                    bot.sendMessage(message, "The correct answer is Computer. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("table") && GlobalImgToUse == "27"){
                    bot.sendMessage(message, "The correct answer is Table. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("dog") && GlobalImgToUse == "28"){
                    bot.sendMessage(message, "The correct answer is Dog. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("pikachu") && GlobalImgToUse == "29"){
                    bot.sendMessage(message, "The correct answer is Pikachu. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("computer") && GlobalImgToUse == "30"){
                    bot.sendMessage(message, "The correct answer is Computer. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }//////////////////
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "31"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "32"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "33"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "34"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "35"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "36"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "37"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "38"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "39"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "40"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "41"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "42"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "43"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "44"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "45"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "46"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "47"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "48"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "49"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "50"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "51"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "52"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "53"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "54"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "55"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "56"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "57"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "58"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "59"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if ( stringTest.contains("hatsune") && GlobalImgToUse == "60"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if (stringTest.contains("hatsune") && GlobalImgToUse == "61"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if (stringTest.contains("hatsune") && GlobalImgToUse == "62"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }
                if (stringTest.contains("hatsune") && GlobalImgToUse == "63"){
                    bot.sendMessage(message, "The correct answer is Hatsune Miku. \n" + "<@" + message.sender.id + ">" + " wins this game.");
                    bot.sendFile(message, "./images/games/imgscramble/" + GlobalImgToUse + ".png",  GlobalImgToUse +".png");
                    return scrambleOn = 0;
                }

            }

            if (stringTest.contains("!scramblehelp")){
                bot.reply(message, "ScrambleOn: ``" + scrambleOn + "``  imgToUse: ``" + GlobalImgToUse + "``");
            }


            if (stringTest.contains(mentionRosa + " !wiki")) {
                var searchWiki = message.content.substring(28);
                wiki.page('searchWiki').then(function (page) {
                    page.info().then(function (info) {
                        bot.reply(message, (info['alter_ego'])); // Bruce Wayne
                    });
                });

            }

            if (stringTest.contains(mentionRosa + " !osu user") && osuOn === 1) {
                var username = message.content.substring(32);
                //bot.reply(message, "Correct? " + username);
                osu.getUser(username, [2], function(error, output) {
                    if (error) {
                        bot.reply(message, "Seems to be wrong. Try again");
                        console.log( error);
                        return
                    }
                    bot.sendMessage(message, "``` \n" + "[" + output.country + "]" + output.username + "[" + output.user_id + "]" + "\n Level: " + output.level + "\n ACC: " + output.accuracy + "\n SS/S/A: " + output.count_rank_ss + "/" + output.count_rank_s + "/" + output.count_rank_a + "\n ```");
                });
            }

            if (stringTest.contains(mentionRosa + " !osu best") && osuOn === 1) {
                var best = message.content.substring(32);
                bot.reply(message, "Correct? " + best);
                osu.getUserBest(best, function(error, userBest) {
                    if (error) {
                        bot.reply(message, "Seems to be wrong. Try again");
                        console.log( error);
                        return
                    }
                    bot.sendMessage(message, "``` \n " +"1.) " + "\n" + userBest[0].date + "\nMap: " + userBest[0].beatmap_id + "\nScore: " + "[" + userBest[0].rank  + "]" + userBest[0].score  + " \nMods? " + userBest[0].enabled_mods + "\n\n2.) " + "\n" + userBest[1].date + "\nMap: " + userBest[1].beatmap_id + "\nScore: " + "[" + userBest[1].rank  + "]" + userBest[1].score  + "\nMods? " + userBest[1].enabled_mods + "\n\n3.) " + "\n" + userBest[2].date + "\nMap: " + userBest[2].beatmap_id + "\nScore: " + "[" + userBest[2].rank  + "]" + userBest[2].score  + "\nMods? " + userBest[2].enabled_mods + "```");
                });
            }

            if (stringTest.contains(mentionRosa + " !servers") && rosaStatus !== 0) {
                bot.reply(message, "Public server spreadsheet: https://goo.gl/VOdvye");
            }

            if (stringTest.contains("!champions")) {
                league.getChampions('na', function (data) {
                    if (data == null) {
                        bot.reply(message, "Data is: " + data);
                        console.log( "BROKEN: " + data);
                    } else {
                        bot.reply(message, ":thumbsup:");
                        bot.reply(message, data);
                    }
                });
            }

            if (stringTest.contains(mentionRosa + " !pullrequests") && rosaStatus !== 0) {
                var state = 'open'; //or 'closed', or 'all'
                repo.listPulls(state, function (err, pullRequests) {
                    if (!err) {
                        bot.reply(message, "# currently open pull requests: " + pullRequests.length);
                        console.log( pullRequests);
                    } else {
                        bot.reply(message, err);
                    }
                });
            }

            if (stringTest.contains(mentionRosa + " !issues") && rosaStatus !== 0) {
                var issues = github.getIssues("actowolfy", "Rosalina-Bottings");
                issues.list({}, function (err, issues) {
                    if (!err) {
                        bot.reply(message, "# currently open issues: " + issues.length);
                    } else {

                    }
                });
            }
            /*
             if (stringTest.contains(mentionRosa + " !commits") && rosaStatus !== 0) {
             var issues = github.getIssues("actowolfy", "Rosalina-Bottings");
             repo.getCommit('master', sha, function(err, commit) {
             if (!err) {
             bot.reply(message, "Current commit: " + commit);
             } else {

             }
             });
             }
             */
            if (stringTest.contains(mentionRosa + " !youtube") && rosaStatus !== 0 && miscOn !== 0) {
                var findVideo = message.content.substring(31);
                crawler(findVideo, function (err, results) {
                    if (err) {
                        console.warn(err);
                    } else if (!err) {
                        bot.reply(message, results[0].link);
                    }
                });
            } else {

            }

            if (stringTest.contains("!getsummoner")) {
                var summoner_name = "Actowolf";
                league.getSummonerByName('na', summoner_name, function (data) {
                    if (data == null) {
                        bot.reply(message, "Data is: " + data);
                        console.log( "BROKEN: " + data);
                    } else {
                        bot.reply(message, ":thumbsup:");
                        bot.reply(message, data);
                        console.log( "BROKEN: " + data);
                    }
                });
            }
            /*
             if (bot.message.embeds) {
             console.log( "\n" + "``Title: " + message.embeds.title + "``" + "\n" + "```Desc: " + message.embeds.description + "```")
             bot.reply(message, "\n" + "``Title: " + message.embeds.title + "``" + "\n" + "```Desc: " + message.embeds.description + "```");
             }

             */

            if (message.content === "!lastCommand") {
                bot.reply(message, "Last command used: " + lastCommandUsed);
                return lastCommandUsed = "!lastCommand";
            }

            if (stringTest.contains("!shipping") && rosaStatus !== 0 && miscOn === 1 || stringTest.contains("!loli") && rosaStatus !== 0 && miscOn === 1 || stringTest.contains("!box") && rosaStatus !== 0 && miscOn === 1){
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.sendFile(message, "images/loliinabox.jpg", "loliinabox.jpg");
                    bot.reply(message, "Loli in a box. Shipping starts in 2016");
                }
            }

            if (stringTest.contains("mother of god") && rosaStatus !== 0 && miscOn === 1) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.sendFile(message, "images/motherofgod.gif", "motherofgod.gif");
                }
            }

            if (stringTest.contains("!kick") && userWhitelist.indexOf(message.sender.id) !== -1) {
                var serverID = message.sender.server.id;
                var serverName = message.sender.server.id;
                var userID = message.mentions[0];
                bot.kickMembers(userID, serverID);
                bot.reply(message, "Kicked: " + userID + " from " + serverName + "/" + serverID);
            }

            if (stringTest.contains("!ban") && userWhitelist.indexOf(message.sender.id) !== -1) {
                var server = message.sender.server.id;
                var user = message.mentions[0];
                if (user == "<@111424758314213376>") {
                    bot.reply(message, "I'm not banning myself >.>");
                } else {
                    bot.banMember(user, server);
                    bot.reply(message, "Banned: " + user + " from " + server);
                }
            }

            if (message.content === "!cleverStatus") {
                bot.reply(message, "\n" + "cleverStatus is set to: ``" + cleverStatus + "``\n" + "!clever has been called: ``" + cleverUsage + "`` times.");
            }


            if (stringTest.contains("!wat") && rosaStatus !== 0 && miscOn === 1) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.sendMessage(message, " https://www.youtube.com/watch?v=2ZPfgVSrPVY");
                }
            } else {

            }

            if (message.content === mentionRosa + " !restart") {
                bot.reply(message, "Restarting...");
                process.exit();
            } else {

            }

            if (message.content === mentionRosa + " !die") {
                bot.reply(message, ":( *dies* :(");
                process.kill()
            } else {

            }

            if (stringTest.contains(mentionRosa + " !setName")) {
                if (message.content.substring(0, 1) != "<") {
                    bot.reply(message, "Improper command structure");
                } else {
                    var newName = message.content.substring(31);
                    bot.setUsername(newName);
                    bot.reply(message, "Username changed to: " + newName);
                }
            }

            if (stringTest.contains("r.i.p") && rosaStatus !== 0 && miscOn === 1 || stringTest.contains("rest in peace") && rosaStatus !== 0 && miscOn === 1 || message.content.toLowerCase() === "rip" && rosaStatus !== 0 && miscOn === 1) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.reply(message, "Mentions: " + message.mentions + "  Length: ``" + message.mentions.length + "``" );
                    if (message.mentions.length !== 0) {
                        var mentioned = message.mentions[1];
                        bot.reply(message, "It ran. " + mentioned);
                        gm('./images/rip/rip2.png')
                            .stroke("#ffffff")
                            .drawCircle(10, 10, 20, 10)
                            .font("Arial.ttf", 12)
                            .drawText(30, 20, "test")
                            .write( "./images/rip/mentionrip.png", function (err) {
                                if (!err) {
                                    console.log( 'done');
                                    bot.reply(message,"It worked");
                                    bot.sendFile(message, "images/rip/mentionrip.png", "mentionrip.png");
                                } else {
                                    bot.reply(message, "It broke miserably. ``" + err +"``");
                                }
                            });
                    } else {
                        var randomRIP = Math.floor((Math.random() * 4) + 1);
                        bot.sendFile(message, "images/rip/rip" + randomRIP + ".png", "rip" + randomRIP + ".png");
                    }
                }
            }

            if (stringTest.contains(mentionRosa + " i like your") && rosaStatus !== 0 && miscOn === 1 || stringTest.contains(mentionRosa + " i like that you") && rosaStatus !== 0 && miscOn === 1 || message.content === mentionRosa + " i like you" && rosaStatus !== 0 && miscOn === 1 || stringTest.contains(mentionRosa + " i love your") && rosaStatus !== 0 && miscOn === 1 || stringTest.contains(mentionRosa + " i love that you") && rosaStatus !== 0 && miscOn === 1) {
                bot.reply(message, "Thanks!");
            } else {

            }

            if (stringTest.contains("!horrible") && rosaStatus !== 0 && miscOn === 1) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.sendMessage(message, "https://www.youtube.com/watch?v=yerwwZWXtdQ");
                }
            } else {

            }

            if (stringTest.contains("just do it!") && rosaStatus !== 0 && miscOn === 1) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.sendMessage(message, "https://www.youtube.com/watch?v=ZXsQAXx_ao0");
                }
            } else {

            }

            if (stringTest.contains("cake") && rosaStatus !== 0 && miscOn === 1) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.reply(message, "The cake is a lie");
                }
            } else {

            }

            if (stringTest.contains("success!") && rosaStatus !== 0 && miscOn === 1) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.sendMessage(message, "https://www.youtube.com/watch?v=zb4yFR9qS3A");
                }
            } else {

            }

            //if (stringTest.contains(mentionRosa + "!"))

            /*else {
             var usersAvatar = message.sender.avatarURL;
             console.log( usersAvatar + " PASSED! vanilla");

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

            if (badWords && rosaStatus !== 0 && moderationOn === 1) {
                var memberId = message.sender.id;
                var userName = message.sender.username;
                console.log( "[Problem]: " + "Server: " + message.sender.server + " Channel: " + "[" + message.sender.channel + memberId + "] " + userName + ": " + message.content);
                bot.reply(message, "These word(s) are not allowed.\nFurther use of such language will result in a permanent ban.");
            } else {

            }

            if (stringTest.contains(mentionRosa + " !moderation off")) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.reply(message, "Moderation has been turned off. :(");
                    return moderationOn = 0;
                }
            } else {

            }

            if (stringTest.contains(mentionRosa + " !moderation on")) {
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    bot.reply(message, "Moderation has been turned on. :(");
                    return moderationOn = 0;
                }
            } else {

            }


            /*
             if (stringTest.contains(mentionRosa + " !getid") && rosaStatus !== 0) {
             var memberId = message.content.substring(31,49); // 54
             bot.reply(message, "This member's id is: " + memberId);
             } else {

             }
             */

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

            if (stringTest.contains("i'm back") && rosaStatus !== 0 && greetOn === 1 || stringTest.contains("im back") && rosaStatus !== 0 && greetOn === 1 || stringTest.contains("i am back") && rosaStatus !== 0 && greetOn === 1) {
                bot.reply(message, "Welcome back!");
            } else {

            }

            if (stringTest.contains(mentionRosa + " !coin") && rosaStatus !== 0) {
                var coinResult = Math.floor(Math.random(1, 2) * 2) + 1;
                if (coinResult === 1) {
                    bot.reply(message, "flipped ``heads``!");
                } else {
                    bot.reply(message, "flipped ``tails``!");
                }
            } else {

            }
/*
            if (stringTest.contains(mentionRosa + " !clever") && rosaStatus !== 0 && cleverStatus !== 0) {
                console.log("function called! ");

                var userMessage = message.content.substring(33);
                bot.reply(message, "Message to send is: " + userMessage);

                cleverIndex = serverLs.indexOf(msg.channel.server.id);
                console.log("CI:" + cleverIndex);
                console.log(serverLs[cleverIndex]);
                console.log(cleverLs[cleverIndex]);
                console.log(cleverbot);
                CleverLs[cleverIndex].prepare(function(){
                    console.log('Sent to Clever:' + msg.content.substr(msg.content.indexOf(' ')+1));
                    cleverLs[cleverIndex].write(msg.content.substr(msg.content.indexOf(' ')+1), function (response) {
                        bot.reply(message, response);
                    });
                });
            }
        }
            }
            */


            if (stringTest.contains(mentionRosa + " !smarton") && rosaStatus !== 0) {
                bot.reply(message, "cleverStatus has been reset to 1");
                return cleverStatus = 1;
            } else {

            }

            if (stringTest.contains(mentionRosa + " !smartoff") && rosaStatus !== 0) {
                bot.reply(message, "cleverStatus has been set to 0");
                return cleverStatus = 0;
            } else {

            }

            if (stringTest.contains(mentionRosa + " !misc off") && rosaStatus !== 0) {
                bot.reply(message, "Misc responses have been turned off");
                return miscOn = 0;
            } else {

            }

            if (stringTest.contains(mentionRosa + " !misc on") && rosaStatus !== 0) {
                bot.reply(message, "Misc responses have been turned on");
                return miscOn = 1;
            } else {

            }

            if (stringTest.contains(mentionRosa + " !gw2 on") && rosaStatus !== 0) {
                bot.reply(message, "GW2 commands have been turned on");
                return guildwarsOn = 1;
            } else {

            }

            if (stringTest.contains(mentionRosa + " !gw2 off") && rosaStatus !== 0) {
                bot.reply(message, "GW2 commands have been turned on");
                return guildwarsOn = 0;
            } else {

            }

            if (stringTest.contains(mentionRosa + " !osu off") && rosaStatus !== 0) {
                bot.reply(message, "Osu! commands have been turned on");
                return osuOn = 0;
            } else {

            }

            if (stringTest.contains(mentionRosa + " !osu on") && rosaStatus !== 0) {
                bot.reply(message, "Osu! commands have been turned on");
                return osuOn = 1;
            } else {

            }

            if (stringTest.contains(":salty:") && rosaStatus !== 0 && miscOn === 1) {
                bot.sendFile(message, "images/salty.jpg", "salty.jpg");
            }

            if (stringTest.contains(":cthulhu:") && rosaStatus !== 0 && miscOn === 1 || stringTest.contains("(;,;)") && rosaStatus !== 0 && miscOn === 1) {
                bot.sendFile(message, "images/cthulhu.png", "cthulhu.png");
            }


            if (message.content === mentionRosa + " !gensokyo" && rosaStatus !== 0) {

                var url = "http://gensokyoradio.net/xml/";

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
                var out = test.match(regexp);
                var xmlTest = S(test.toLowerCase());
                var memberId = message.sender.id;
                if (memberId === rosaId) {

                } else {
                    if (xmlTest.contains("?xml")) {
                        bot.reply(message, "Please do not include ?xml=1 to the end of the link");
                    } else {
                        var url = message.content + "?xml=1";
                        console.log( "Steam url  " + url);

                        xmlToJson(url, function (err, data) {
                            if (err) {
                                // Handle this however you like
                                return
                            }

                            // Do whatever you want with the data here
                            // Following just pretty-prints the object
                            var jsonString = JSON.stringify(data);
                            steam = JSON.parse(jsonString);
                            console.log( "Steam json  " + jsonString);

                            var steamID64 = steam.profile.steamID64[0];
                            var steamUsername = steam.profile.steamID[0];
                            var status = steam.profile.onlineState[0];
                            var profilePrivate = steam.profile.privacyState[0];
                            var avatarIcon = steam.profile.avatarIcon[0];
                            var vacBanned = steam.profile.vacBanned[0];
                            var tradeBanState = steam.profile.tradeBanState[0];
                            var isLimitedAccount = steam.profile.isLimitedAccount[0];

                            bot.sendMessage(message, "\n ```[" + profilePrivate + "] " + steamUsername + " [" + status + "] " + "[" + isLimitedAccount + "]" + "\n" + avatarIcon + "\n SteamID64: " + steamID64 + "\n VAC Banned? " + vacBanned + "\n Trade Banned? " + tradeBanState + "```");
                        });
                    }
                }
            }

            if (stringTest.contains(mentionRosa + " !define") && rosaStatus !== 0) {
                var defineWord = message.content.substring(30);
                var url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + defineWord + "?key=" + dictKey;
                //bot.reply(message, "URL: " + url);
                bot.reply(message, "Correct? " + defineWord);

                xmlToJson(url, function (err, data) {
                    if (err) {
                        bot.sendMessage(message, "ERROR: " + err);
                        console.log( err);
                        // Handle this however you like
                        return
                    }

                    // Do whatever you want with the data here
                    // Following just pretty-prints the object
                    console.log( data);
                    var jsonString = JSON.stringify(data);
                    console.log( jsonString);
                    definedWord = JSON.parse(jsonString);

                    console.log( definedWord);

                    //console.log( "YES!??? " + definedWord.entry_list.entry[0].def[0].dt[0] + definedWord.entry_list.entry[0].def[0].dt[0].fw[0]);
                    //bot.sendMessage(message, definedWord.entry_list.entry[0].def[0].dt[0] + definedWord.entry_list.entry[0].def[0].dt[0].fw[0]);

                    console.log( "YES!??? " + definedWord.entry_list.entry[1].def[0].dt[0]);
                    bot.sendMessage(message, definedWord.entry_list.entry[1].def[0].dt[0]);

                    //console.log( "YES!??? " + definedWord.entry_list.entry[0].def[0].dt[0]);
                    //bot.sendMessage(message, definedWord.entry_list.entry[0].def[0].dt[0]);

                    //var wordOutput = definedWord.entry.def[0].dt[0].fw;
                    //bot.sendMessage(message, wordOutput);
                });
            }

            if (stringTest.contains(mentionRosa + " !gw2 servers") && rosaStatus !== 0 && guildwarsOn === 1) {
                gwapi.getWorldNames({lang: 'en'}, function (err, data) {
                    if (err) {
                        bot.reply(message, "Seems to be wrong. Try again");
                        console.log( err);
                        return
                    }
                    var stringIt =JSON.stringify(data);
                    var parsedResponse = JSON.parse(stringIt);
                    var serverList = parsedResponse.length;
                    for (var i = 0; i < serverList; i++) {
                        delay.delayed(6000);
                        bot.sendMessage(message, parsedResponse[i].name + " Population: " + parsedResponse[i].population);
                    }
                });
            }

            if (stringTest.contains(mentionRosa + " !gw2 wvw")&& rosaStatus !== 0 && guildwarsOn === 1) {
                bot.reply(message, "You seem to have found a secret & unfinished command");
            }

            if (stringTest.contains(mentionRosa + " !gw2 dailies") && rosaStatus !== 0 && guildwarsOn === 1) {
                gwapi.getWorldNames({lang: 'en'}, function (err, data) {
                    if (err) {
                        bot.reply(message, "Seems to be wrong. Try again");
                        console.log( err);
                        return
                    }
                    var stringIt = JSON.stringify(data);
                    var parsedResponse = JSON.parse(stringIt);
                });
            }

            if (stringTest.contains(mentionRosa + " !gw2 guildname") && rosaStatus !== 0 && guildwarsOn === 1) {
                var guildName = message.content.substring(37);
                bot.reply(message, "Correct?" + guildName);
                gwapi.getGuildDetails({guild_name: guildName}, function (err, data) {
                    if (err) {
                        bot.reply(message, "Seems to be wrong. Try again");
                        console.log( err);
                        return
                    }
                    var stringIt = JSON.stringify(data);
                    var parsedResponse = JSON.parse(stringIt);
                    bot.sendMessage(message,parsedResponse.guild_id + "/" + parsedResponse.guild_name + "[" + parsedResponse.tag + "]");
                });
            }

            if (stringTest.contains(mentionRosa + " !gw2 guildid") && rosaStatus !== 0 && guildwarsOn === 1) {
                var guildID = message.content.substring(35);
                bot.reply(message, "Correct?" + guildID);
                gwapi.getGuildDetails({guild_id: guildID}, function (err, data) {
                    if (err) {
                        bot.reply(message, "Seems to be wrong. Try again");
                        console.log( err);
                        return
                    }
                    var stringIt = JSON.stringify(data);
                    var parsedResponse = JSON.parse(stringIt);
                    bot.sendMessage(message,parsedResponse.guild_id + "/" + parsedResponse.guild_name + "[" + parsedResponse.tag + "]" + " " + parsedResponse.emblem.background_id);
                });
            }


            /*else {
             var url = message.content + "?xml=1";
             console.log( "Steam url  " + url);

             xmlToJson(url, function (err, data) {
             if (err) {
             // Handle this however you like
             return
             }

             // Do whatever you want with the data here
             // Following just pretty-prints the object
             var jsonString = JSON.stringify(data);
             steam = JSON.parse(jsonString);
             console.log( "Steam json  " + jsonString);

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
             console.log( "Abc US  " + abcUs);

             bot.reply(message, abcUs);
             });
             }
             }
             */

        }
        /*
         if (stringTest.contains(mentionRosa + " !getstatus") && rosaStatus !== 0) {
         if (stringTest.contains(mentionRosa + " !getstatus " + mentionRosa)) {
         bot.reply(message, "My status is: " + bot.user.status);
         } else if(message.mentions.length === 2) {
         bot.reply(message, message.mentions[1] + " is: " + message.mentions[1].status);
         } else if(message.mentions.length === 1) {
         bot.reply(message, "Your status is: " + message.mentions[0].status);
         } else {
         bot.reply(message, "Too many mentions. Please don't break me. :(");
         }
         } else {

         }

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

         if (stringTest.contains(mentionRosa + " !getid") && rosaStatus !== 0) {
         if (stringTest.contains(mentionRosa + " !getid " + mentionRosa)) {
         bot.reply(message, "My member id is: " + rosaId);
         } else if(message.mentions.length === 2) {
         bot.reply(message, "This member's id is: " + message.mentions[1].id);

         } else if(message.mentions.length === 1) {
         bot.reply(message, "Your member's id is: " + message.mentions[0].id);
         } else {
         bot.reply(message, "Too many mentions. Please don't break me. :(");
         }
         } else {

         }

         */
        if (message.content === mentionRosa + " !channelid" && rosaStatus !== 0) {
            bot.reply(message, "The channel id is: " + "``" + message.channel.id + "``");
        } else {

        }

        if (stringTest.contains(mentionRosa + " !serverid")) {
            bot.reply(message, "The server id is: " + "``" + message.channel.server.id + "``");
        } else {

        }

        if (message.content === mentionRosa + " !members" && rosaStatus !== 0) {
            bot.sendMessage(message, "Current members: \n" + message.channel.members);
        } else {

        }

        if (stringTest.contains(mentionRosa + " !serverinfo")) {
            var serverName = message.sender.server.name;
            var serverID = message.sender.server.id;
            var channels = message.sender.server.channels;
            var members = message.sender.server.members;
            var memberTotal = message.sender.server.members.length;
            var memberOnline = message.sender.server.members.status == "Online";
            var memberOnlineTotal = memberOnline === "Online";
            var iconURL = message.sender.server.iconURL;
            var defaultChannel = message.sender.server.defaultChannel;
            var afkChannel = message.sender.server.afkChannel;
            var serverOwner = message.sender.server.owner;
            var serverRegion = message.sender.server.region;
            // bot.sendMessage(message, "```Server Name: " + message.sender.server.name + );
            var messageToSend = ("```Server name:" + serverName + "(" + memberOnlineTotal.length + "/" + memberTotal + ")" + "\nServer ID: " + serverID + "\nServer Owner: " + serverOwner + "\nServer Region: " + serverRegion + "\nDefault Channel: " + defaultChannel + "\nAFK Channel: " + afkChannel + "\nServer Channels(" + channels + "): " + channels + "\nServer Icon URL: " + iconURL + "```")
            //var messageToSend = messageTo.replace(/<#>/g, '');
            bot.sendMessage(message, messageToSend);
        }


        if (stringTest.contains(mentionRosa + " !createChannel") && rosaStatus !== 0) {
            //createChannel(server, channelName, channelType, callback)
            var channelCommand = message.content.split;
            var serverID = message.server.id;
            var channelName = channelCommand.createChannel.channelName;
            var channelType = channelCommand.createChannel.channelType;
        }
        if (stringTest.contains(mentionRosa + " !userinfo") && rosaStatus !== 0) {
            if (stringTest.contains (mentionRosa + " !userinfo " + mentionRosa)) {
                bot.sendMessage(message, "```Username: " + message.mentions[0].username + "[" + message.mentions[0].status + "]" + "\n UserID: " + message.mentions[0].id + "\n Discriminator: " + message.mentions[0].discriminator + "\n Avatar URL: " + message.mentions[0].avatarURL + "```");
            } else if (message.mentions.length === 2) {
                bot.sendMessage(message, "```Username: " + message.mentions[1].username + "[" + message.mentions[1].status + "]" + "\n UserID: " + message.mentions[1].id + "\n Discriminator: " + message.mentions[1].discriminator + "\n Avatar URL: " + message.mentions[1].avatarURL + "```");
            } else if (message.mentions.length === 1) {
                bot.sendMessage(message, "```Username: " + message.sender.username + "[" + message.sender.status + "]" + "\n UserID: " + message.sender.id + "\n Discriminator: " + message.sender.discriminator + "\n Avatar URL: " + message.sender.avatarURL + "```");
            }
        }

        //Thanks #q! && downloadsOn !== 0
        if (stringTest.contains(mentionRosa + " !download") && rosaStatus !== 0 && userWhitelist.indexOf(message.sender.id) !== -1) {
            bot.reply(message, "Downloading...");
            var exec = require('child_process').exec,
                child;

            child = exec('node ./lists/gamelist.js',
                function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                    bot.reply(message, "games.json, emojis.json, & emoji-shortcuts.json have downloaded.");
                });
        }

        if (stringTest.contains(mentionRosa + " !gamelist") && rosaStatus !== 0) {
            fs.stat('./lists/games.json', function (err, stats) {
                if (!err) {
                    bot.sendFile(message, "./lists/games.json", "games.json");
                } else if (err) {
                    bot.reply(message, "File not found. Redownloading...");
                    var exec = require('child_process').exec,
                        child;

                    child = exec('node ./lists/gamelist.js',
                        function (error, stdout, stderr) {
                            console.log('stdout: ' + stdout);
                            console.log('stderr: ' + stderr);
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                            bot.sendFile(message, "./lists/games.json", "games.json");
                        });
                } else {
                    bot.reply(message, "ERROR! The entire world has been engulfed in flames.");
                }
            });
        }

        if (stringTest.contains(mentionRosa + " !emojilist") && rosaStatus !== 0) {
            fs.stat('./lists/emojis.json', function (err, stats) {
                if (!err) {
                    bot.sendFile(message, "./lists/emojis.json", "emojis.json");
                } else if (err) {
                    bot.reply(message, "File not found. Redownloading...");
                    var exec = require('child_process').exec,
                        child;

                    child = exec('node ./lists/gamelist.js',
                        function (error, stdout, stderr) {
                            console.log('stdout: ' + stdout);
                            console.log('stderr: ' + stderr);
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                            bot.sendFile(message, "./lists/emojis.json", "emojis.json");
                        });
                } else {
                    bot.reply(message, "ERROR! The entire world has been engulfed in flames.");
                }
            });
        }

        if (stringTest.contains(mentionRosa + " !emojishortcutlist") && rosaStatus !== 0 && downloadsOn !== 0) {
            fs.stat('./lists/emoji-shortcuts.json', function (err, stats) {
                if (!err) {
                    bot.sendFile(message, "./lists/emoji-shortcuts.json", "emoji-shortcuts.json");
                } else if (err) {
                    bot.reply(message, "File not found. Redownloading...");
                    var exec = require('child_process').exec,
                        child;

                    child = exec('node ./lists/gamelist.js',
                        function (error, stdout, stderr) {
                            console.log('stdout: ' + stdout);
                            console.log('stderr: ' + stderr);
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                            bot.sendFile(message, "./lists/emoji-shortcuts.json", "emoji-shortcuts.json");
                        });
                } else {
                    bot.reply(message, "ERROR! The entire world has been engulfed in flames.");
                }
            });
        }

        if (stringTest.contains(mentionRosa + " !downloads off")) {
            bot.reply(message, "Downloads have been turned off!");
            return downloadsOn = 0;
        }

    }





});



 bot.on("debug", function(msg) {
    console.log( msg);
 });

 bot.on("unknown", function(data) {
    console.log( data);
 });

 bot.on("raw", function(data) {
     console.log( data);
 });
/*
bot.on("error", console.log);
bot.on("warn", console.log);
*/


bot.on("messageUpdate", function(newMessage, oldMessage) {
    var serverWhitelist = ["102588320181125120"];
    var channelWhitelist = ["112735322504232960","102588320181125120","112185703961534464","94831883505905664","81402706320699392","110374132432011264","113477047145238528","95657260969103360","103028520011190272"];
    if (channelWhitelist.indexOf(newMessage.channel) !== -1 || serverWhitelist.indexOf(newMessage.server) !== -1) {
        bot.sendMessage(newMessage.channel, oldMessage.content + " has been changed to " + newMessage.content);
    }
});




bot.on("serverNewMember", function(user, server) {
    var serverWhitelist = ["102588320181125120"];
    var channelWhitelist = ["112735322504232960","102588320181125120","112185703961534464","94831883505905664","81402706320699392","110374132432011264","113477047145238528","95657260969103360","103028520011190272"];
    /*
     if (channelWhitelist.indexOf(server.chanel) !== -1 || serverWhitelist.indexOf(server.server) !== -1) {
     bot.sendMessage(server, "User " + user + " has joined! Give them a warm welcome.");
     }
     */

    var TABLE = 'discord_joinleave';

    mysql.query('insert into '+ TABLE +' (event, serverid, servername, userid, username) values ("'+ "Join" + '", "' + server.id + '", "' + server + '", "' + user + '", "' + user.username + '")',
        function selectCb(err, results, fields) {
            if (err) throw err;
            else {

            }
        });

    if ( server.id == "95657260969103360" ) {
        bot.sendMessage(server, "User " + user + " has joined! Give them a warm welcome.");
        bot.sendFile(user, "./images/new.jpg", "new.jpg");
        bot.sendMessage(user, "Welcome " + user + "!" + "\nRule(s): Commonsense!");

    }
});

bot.on("serverRemoveMember", function(user, server) {
    var serverWhitelist = ["102588320181125120"];
    var channelWhitelist = ["112735322504232960","102588320181125120","112185703961534464","94831883505905664","81402706320699392","110374132432011264","113477047145238528","95657260969103360","103028520011190272"];
    /*
     if (channelWhitelist.indexOf(server.channel) !== -1 || serverWhitelist.indexOf(server.server) !== -1) {
     bot.sendMessage(server, "User " + user + " has left...traitor.");
     }
     */
    var TABLE = 'discord_joinleave';

    mysql.query('insert into '+ TABLE +' (event, serverid, servername, userid, username) values ("'+ "Leave" + '", "' + server.id + '", "' + server + '", "' + user + '", "' + user.username + '")',
        function selectCb(err, results, fields) {
            if (err) throw err;
            else {

            }
        });

    if ( server.id == "95657260969103360" ) {
        bot.sendMessage(server, user + " has left...traitor.");
    }
});

/*
 bot.on("userUpdate", function(oldUser, newUser) {
 bot.sendMessage(message.sender.channel, oldUser + " has changed their name to " + newUser);
 });
 */
/*
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});
*/

bot.login("[redacted]", "[redacted]");