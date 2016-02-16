/* 
 * Copyright (C) 2015 Raphael Touet <raphraph@raphraph.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * 
 * @author Michanel Friese <michael@sinusbot.com>
 * @author Raphael Touet <raphraph@raphraph.de>
 * 
 */
registerPlugin({
    name: 'Advertising (Text)',
    version: '2.0',
    description: 'This script will announce one of the configured lines every x seconds. (Help: https://github.com/Raphouphe/sinusbot-scripts)',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphraph@raphraph.de>',
    vars: {
        ads: {
            title: 'Ads (supports bbcode)',
            type: 'multiline',
            placeholder: 'Welcome to the best TS3-Server!'
        },
        interval: {
            title: 'Interval (in seconds)',
            type: 'number',
            placeholder: '30'
        },
        order: {
            title: 'Order',
            type: 'select',
            options: [
                'default (line by line)',
                'random'
            ]
        },
        type: {
            title: 'Broadcast-Type',
            type: 'select',
            options: [
                'Channel',
                'Server',
                'Private (not recommended)'
            ]
        }
    }
}, function(sinusbot, config, info) {
    
        // -- Some settings, which can be adjusted manually... --
    // -> these commands are currently NOT AVAILABLE !!
    var commands = {
        advertise: ".advertise",
        advertise_opts: {
            add: "add",
            remove: "remove",
            list: "list",
            stop: "stop",
            pause: "pause",
            start: "start"
        }
    };
    var min_interval_ads = 5;
    var debug = false;
    
    /* 
                !! DO NOT EDIT SOMETHING BENEATH THIS LINE !!
    */
       
        // -- Setting additional informations --
    info.testversion = "0.9.10-e1fdee3";
    
        // -- Load messages --
    sinusbot.log(''); sinusbot.log('Loading...'); sinusbot.log('');
    var author = info.author.split(',');
    if(author.length == 1){
        author = author[0];
        author = author.replace(/<.*>/gi, '').trim();
    } else {
        author = author.map(function(e){
            return e.replace(/<.*>/gi, '').trim();
        });
        author = author.join(' & ');
    }
    sinusbot.log(info.name + ' v' + info.version + ' by ' + author + ' for SinusBot v' + info.testversion + ' (and above)');
    
        // -- Additional variables --
    var errors = {
        configErr: "configErr",
        configUndef: "configUndef",
        undefined: "undefined",
        notFound: "notFound"
    };
    var errorsPre = {
        configErr: "[CONFIG] ",
        configUndef: "[CONFIG] ",
        undefined: "[UNDEF.] ",
        notFound: "[NOT FOUND] "
    };
    var errorsMsg = {
        errConfigUndef: "Please check your configuration. There is an undefined setting named '%name%'.",
        errConfig: "Please check your configuration. %message%"
    };
    var logs = {
        custom: "custom",
        scriptStart: "scriptStart",
        broadcasting: "broadcasting",
        broadcasted: "broadcasted"
    };
    var logsMsg = {
        custom: "%message%",
        scriptStart: "The script is now starting itself...",
        broadcasted: "Following message has been broadcasted (type: %type%): \n%bc_ad%",
        broadcasting: "Broadcasting message..."
    };
    var self = getBotId();
    var ad_counter = 0;
    var timer_interval;
    
        // -- Basic functions --
    // -> logErr(type, options)
    logErr = function(type, options, cancelScript) {
        type = type || undefined;
        cancelScript = cancelScript || false;
        var pre = "[ERROR]";
        switch (type) {
            case undefined:
                return;
            case errors.configUndef:
                sinusbot.log(pre + errorsPre.configUndef + errorsMsg.errConfigUndef.replace("%name%", options.name));
                break;
            case errors.configErr:
                sinusbot.log(pre + errorsPre.configErr + errorsMsg.errConfig.replace("%message%", options.message));
                break;
            default:
                return;
        }
        if (cancelScript) {
            sinusbot.log(''); sinusbot.log('Exit script...'); sinusbot.log('');
            exit();
        }
    };
    // -> logIt(type, options)
    logIt = function(type, options, onlyDebugging) {
        type = type || undefined;
        onlyDebugging = onlyDebugging || false;
        if (onlyDebugging && debug == false) return;
        var pre = "[INFO] ";
        switch (type) {
            case undefined:
                return;
            case logs.custom:
                sinusbot.log(pre + logsMsg.custom.replace("%message%", options.message));
                break;
            case logs.scriptStart:
                sinusbot.log(pre + logsMsg.scriptStart);
                break;
            case logs.broadcasting:
                sinusbot.log(pre + logsMsg.broadcasting);
                break;
            case logs.broadcasted:
                sinusbot.log(pre + logsMsg.broadcasted.replace("%bc_ad%", options.bc_ad).replace("%type%", options.type));
                break;
            default:
                return;
        }
    };
    // -> startsWith(searchString, position)
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
    // -> isUndefined(variable)
    isUndefined = function(variable) {return typeof variable == "undefined";};
    
        // -- Check config --    
    if (isUndefined(config.ads)) logErr(errors.configUndef, {name: info.vars.ads.title}, true);
    if (isUndefined(config.interval)) logErr(errors.configUndef, {name: info.vars.interval.title}, true);
    else if (config.interval < min_interval_ads) logErr(errors.configErr, {message: "The broadcasting interval has to be greater than 5 seconds! (-> "+info.vars.interval.title+")"}, true);
    if (isUndefined(config.order)) logErr(errors.configUndef, {name: info.vars.order.title}, true);
    if (isUndefined(config.type)) logErr(errors.configUndef, {name: info.vars.type.title}, true);
        
        // -- Passed config checks --
    var ads = config.ads.split('\n').map(function(e) { 
        return e.trim().replace(/\r/g, '')
                .replace(/(?:[url=.{1,}])?((https?:\/\/(?:www\.)?[a-zA-Z0-9._\/-]+\.[a-zA-Z]{2,63})([\/?\#](?:.){0,})?)(?:[/url])?/gi,'[url=$1]$1[/url]'); 
    });
    if(ads.length == 0) {sinusbot.log('[Advertising] No ads defined.');return;}
        
        // -- Additional variables --
    var ctr = 0, client, clients;
    
        // -- Additional functions --
    // -> generate a random integer (min and max are included !)
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // -> starting the loop
    function startLoop() {
        logIt(logs.custom, {message: "Loop startet..."}, true);
        timer_interval = setInterval(function() {
            broadcastAd();
        }, config.interval * 1000);
    }
    // -> get all clients
    function getClients(channel_id) {
        var channel, channels, clients = [];
        channels = getChannels();
        if (typeof channel_id == 'undefined') { 
            for(var i = 0; i < channels.length; i++){
                channel = channels[i];
                clients.push(channel.clients);
            }
            return clients;
        } else {
            for(var i = 0; i < channels.length; i++){
                channel = channels[i];
                if(channel.id == channel_id){
                    return channel.clients;
                    break;
                }
            }
        }
        return [];
    };
    // -> broadcast an ad
    function broadcastAd() {
        logIt(logs.broadcasting, {}, true);
        var ad = ad_counter;
        if (config.order == 1 && ads.length > 1) {
            ad = getRandomInt(0, ads.length-1);
        }
        if (config.type == 0) {
            chatChannel(ads[ad]);
        } else if(config.type == 1) {
            chatServer(ads[ad]);
        } else {
            clients = getClients();
            for (var j = 0; j < clients.length; j++) {
                client = clients[j];
                chatPrivate(client.id, ads[ad]);
            }
        }
        logIt(logs.broadcasted, {bc_ad: ads[ad], type: (config.type == 0 ? "Channel" : (config.type == 1 ? "Server" : "Private"))}, true);
        if (ad_counter + 1 >= ads.length) ad_counter = 0;
        else ad_counter += 1;
    }
    
        // -- Script itself --
    logIt(logs.scriptStart, {}, true);
    startLoop();
    
        // -- Events --
    /*sinusbot.on("chat", function(ev){
        if (ev.clientId == self) return;
        if (ev.mode == 3) return;
        if (!ev.msg.startsWith(commands.advertise.charAt(0))) return;
        var args = ev.msg.split(" ").map(function(e){ return e.trim().replace(/\r/g, '');});
        if (args[0].toLowerCase() != commands.advertise) return;
        
        switch (args[1].toLowerCase()) {
            case commands.advertise_opts.stop:
                clearTimeout(timer_interval);
                break;
            case commands.advertise_opts.start:
                startLoop();
                break;
            default:
                return;
        }
    });*/
    
        // -- Information --
    sinusbot.log(''); sinusbot.log('Loaded !'); sinusbot.log('');
});
