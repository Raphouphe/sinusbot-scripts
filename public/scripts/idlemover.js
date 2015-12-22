/* 
 * Copyright (C) 2015-2016 Raphael Touet <raphraph@raphraph.de>
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
 * @author Michael Friese <michael@sinusbot.com>
 * @author Raphael Touet <raphraph@raphraph.de>
 * 
 */

registerPlugin({
    name: 'Idle Mover 2',
    version: '1.0',
    description: 'This script will move all idling clients to a defined channel. (Help: https://github.com/Raphouphe/sinusbot-scripts)',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphraph@raphraph.de>',
    vars: {
        idleTime: {
            title: 'Idle time',
            type: 'number',
            placeholder: '600'
        },
        idleChannel: {
            title: 'Idle channel',
            type: 'channel'
        },
        debugging: {
            title: 'Debugging',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        },
        idleMessage: {
            title: 'Idle message',
            type: 'string',
            placeholder: 'You have been moved.'
        },
        sendIdleMessage: {
            title: 'Send idle message',
            type: 'select',
            options: [
                'Don\'t send',
                'Send'
            ]
        },
        passedChannels: {
            title: 'Ignored channels',
            type: 'multiline'
        }
    }
}, function(sinusbot, config, info) {
    
    // -- Some settings, which can be adjusted manually... --
    var checksPerMinute = 5;
    var commands = {
        afk: ".afk"
    };
    
    /* 
                !! DO NOT EDIT SOMETHING BENEATH THIS LINE !!
    */
       
    // -- Setting additional informations --
    info.testversion = "0.9.9-98d0cd5";
    
    // -- Load messages --
    log(''); log('Loading...'); log('');
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
    log(info.name + ' v' + info.version + ' by ' + author + ' for SinusBot v' + info.testversion + ' (and above)');
    
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
        clientCheck: "clientCheck",
        clientIdling: "clientIdling"
    };
    var logsMsg = {
        clientCheck: "Checking for idling clients...",
        clientIdling: "The client named '%name%' is idling. Moving him to the idle-channel..."
    };
    var timeCounter = 0;
    var self = getBotId();
    
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
                log(pre + errorsPre.configUndef + errorsMsg.errConfigUndef.replace("%name%", options.name));
                break;
            case errors.configErr:
                log(pre + errorsPre.configErr + errorsMsg.errConfig.replace("%message%", options.message));
                break;
            default:
                return;
        }
        if (cancelScript) {
            log(''); log('Exit script...'); log('');
            exit();
        }
    };
    // -> logIt(type, options)
    logIt = function(type, options, onlyDebugging) {
        type = type || undefined;
        onlyDebugging = onlyDebugging || false;
        if (onlyDebugging && config.debugging == 0) return;
        var pre = "[INFO] ";
        switch (type) {
            case undefined:
                return;
            case logs.clientCheck:
                log(pre + logsMsg.clientCheck);
                break;
            case logs.clientIdling:
                log(pre + logsMsg.clientIdling.replace("%name%", options.name));
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
    
    // -- Check variables --
    if (isUndefined(config.idleTime)) logErr(errors.configUndef, {name: info.vars.idleTime.title}, true);
    else if (config.idleTime < 60) logErr(errors.configErr, {message: "The number (/setting) named '" + info.vars.idleTime.title + "' has to be greater than 60!"}, true);
    if (isUndefined(config.idleChannel) || config.idleChannel == null) logErr(errors.configUndef, {name: info.vars.idleChannel.title}, true); 
    if (isUndefined(config.debugging)) config.debugging == 0;
    if (isUndefined(config.sendIdleMessage)) config.sendIdleMessage == 0;
    if (isUndefined(config.idleMessage) && config.sendIdleMessage == 1) logErr(errors.configUndef, {name: info.vars.idleMessage.title}, true);
    if (isUndefined(config.passedChannels)) config.passedChannels = [];
    else config.passedChannels = config.passedChannels.split('\n').map(function(e) { 
        var n = parseInt(e.trim().replace(/\r/g, ''));
        if (isNaN(n)) return e.trim().replace(/\r/g, '');
        else return n;
    });
    
    // -- Additional functions --
    // -> getClients(channel)
    getClients = function() {
        var channels = getChannels(), clients = [], i = 0;
        for (var i = 0; i < channels.length; i++) {
            var e = 0, ch = channels[i];
            if (config.passedChannels.indexOf(ch.id) != 0 || config.passedChannels.indexOf(ch.name.trim())) continue;
            for (var e = 0; e < ch.clients.length; e++) {
                clients.push(ch.clients[e]);
            }
        }
        return clients;
    };
    // -> isClientIdling(client)
    isClientIdling = function(client) {
        if (client.id == self) return false;
        if (client.idle >= config.idleTime * 1000) return true;
        return false;
    };
    
    // -- Events --
    var clients;
    sinusbot.on('timer', function(){
        ++timeCounter;
        if (timeCounter % (60/checksPerMinute) == 0) {
            logIt(logs.clientCheck, null, true);
            clients = getClients();
            clients.every(function(e) {
                if (isClientIdling(e)) {
                    logIt(logs.clientIdling, {name: e.nick}, true);
                    move(e.id, config.idleChannel);
                    if (config.sendIdleMessage == 1) chatPrivate(e.id, config.idleMessage);
                }
                return true;
            });
        }
    });
    
    sinusbot.on('chat', function(ev){
        if (ev.clientId == self) return;
        if (ev.mode != 1) return;

        var args = ev.msg.trim().split(' ');

        switch (args[0].trim()) {
            case commands.afk:
                move(ev.clientId, config.idleChannel);
                break;
        }
    });
    
    // -- Information --
    log(''); log('Loaded !'); log('');
});