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
 * @author Michael Friese <michael@sinusbot.com>
 * @author Raphael Touet <raphraph@raphraph.de>
 * 
 */

registerPlugin({
    name: 'Idle Mover',
    version: '3.1',
    description: 'This script will move all idling clients to a defined channel. (Help: https://github.com/Raphouphe/sinusbot-scripts)',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphraph@raphraph.de>',
    vars: {
        idleTime: {
            title: 'Idle time',
            type: 'number',
            placeholder: 600
        },
        idleChannel: {
            title: 'Idle channel',
            type: 'channel'
        },
        exemptChannel: {
            title: 'Exempted channels',
            type: 'multiline'
        },
        sendIdleMessage: {
            title: 'Send idle message',
            type: 'select',
            options: [
                'Send',
                'Don\'t Send'
            ]
        },
        idleMessage: {
            title: 'Idle message',
            type: 'string',
            placeholder: 'You have been moved.'
        },
        checksPerMinute: {
            title: 'Checks per minute',
            type: 'number',
            placeholder: '2'
        },
        ignoreIfOutputIsntMuted: {
            title: 'Speakers not disabled',
            type: 'select',
            options: [
                'Ignore Client',
                'Don\'t Ignore Client'
            ]
        },
        logCheck: {
            title: 'Log checks into console',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        }
    }
}, function(sinusbot, config, info) {
    // -- Load messages --
    log('');
    log('Loading...');
    log('');
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
    log(info.name + ' v' + info.version + ' by ' + author + ' for SinusBot v0.9.9-a4f6453 (and above)');
    
    if (typeof config.idleTime == 'undefined') {log('Invalid idle time'); return;}
    if (typeof config.idleChannel == 'undefined' || config.idleChannel == '') {log('Invalid idle channel name'); return;}
    if (typeof config.exemptChannel == 'undefined') {config.exemptChannel = "";}
    if (typeof config.sendIdleMessage == 'undefined') {log('Not selected: send idle message'); return;}
    if (typeof config.idleMessage == 'undefined' || config.idleMessage == '') {log('Invalid idle message'); return;}
    if (typeof config.checksPerMinute == 'undefined') {log('Invalid amount of checks per minute'); return;}
    if (typeof config.ignoreIfOutputIsntMuted == 'undefined') {log('Not selected: ignoring client if speakers aren\'t disabled'); return;}
    if (typeof config.logCheck == 'undefined') {config.logCheck = 0;}
    
    var exemptNames = config.exemptChannel.split('\n').map(function(e) { return e.trim().replace(/\r/g, ''); });
    
    var sendIdleMessage = config.sendIdleMessage, ignoreIfOutputIsntMuted = config.ignoreIfOutputIsntMuted;
    
    var counter = 0;
    var idleChannel = parseInt(config.idleChannel, 10);
    var exemptChannels = [];
    
    var whitelist = {};
    
    if (config.idleTime < 150) {
        log('Idle time must be at least 150 seconds.');
        return;
    } 
    if (config.checksPerMinute > 30) {
        log('The bot won\'t check if the clients are idling more than 30 times a minute...');
        return;
    }

    var msg = config.idleMessage.replace(/(?:[url=.{1,}])?((https?:\/\/(?:www\.)?[a-zA-Z0-9._\/-]+\.[a-zA-Z]{2,63})([\/?\#](?:.){0,})?)(?:[/url])?/gi,'[url=$1]$1[/url]');

    sinusbot.on('timer', function() {
        counter++;
        if ((counter % 20) == 0){
            for(var id in whitelist){
                if(whitelist[id] + 120*1000 < Date.now()){
                    delete whitelist[id];
                }
            }
        }
        if ((counter % (60/config.checksPerMinute)) == 0) {
            if(config.logCheck == 1) log('Checking...');
            // Idle-check once in 60 seconds
            var channel, client;
            var channels = getChannels();
            var self = getBotId();
            for (var i = 0; i < channels.length; i++) {
                if (!channels[i].clients) continue;
                if (channels[i].id == idleChannel) continue;
                if (exemptChannels.indexOf(channels[i].id) >= 0) continue;
                channel = channels[i];
                for (var j = 0; j < channel.clients.length; j++) {
                    client = channel.clients[j];
                    if (client.id == self) continue;
                    if (whitelist[client.id]) continue;
                    if (client.away && client.idle > config.idleTime * 500){
                        log('Client ' + client.nick + ' is idling, moving');
                        if(sendIdleMessage == 0) chatPrivate(client.id, msg);
                        move(client.id, idleChannel);
                        continue;
                    }
                    if (ignoreIfOutputIsntMuted == 0) {
                        if (!client.outputMuted) continue;
                    }
                    if (client.idle > config.idleTime * 1000) {
                        log('Client ' + client.nick + ' is idling, moving');
                        if(sendIdleMessage == 0) chatPrivate(client.id, msg);
                        move(client.id, idleChannel);
                        continue;
                    }
                }
            }
        }
    });
	
    sinusbot.on('move', function(ev){
        if(ev.oldChannel == idleChannel){
            whitelist[ev.clientId] = Date.now();
        }
    });
        
    var updateChannels = function() {
        log('Connected, getting channels');
        var channels = getChannels();
        for(var i = 0; i<channels.length; i++){
            if(channels[i].id == idleChannel) {
                log('Idle-Channel will be ' + channels[i].name);
            }
        }
        for(var i = 0; i < exemptNames.length; i++){
            if(channel_names.indexOf(exemptNames[i]) >= 0){
                var id = channels[channel_names.indexOf(exemptNames[i])].id;
                if(exemptChannels.indexOf(id) == -1){
                    exemptChannels.push(id);
                }
            }
        }
        log('Exempted channels: ' + exemptChannels.toString());
    };
    
    var self = getBotId();
    sinusbot.on('chat', function(ev) {
        if(ev.clientId == self) return;
        if(ev.mode != 1) return;
        
        switch (ev.msg.trim().split(' ')[0].trim()) {
            case '!afk':
                move(ev.clientId, idleChannel);
                break;
        }
        
    });
    
    updateChannels();
    sinusbot.on('connect', updateChannels);
    
    // -- Information --
    log('Loaded !');
    log('');
});


