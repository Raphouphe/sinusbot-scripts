/* 
 * Copyright (C) 2015 Raphael Touet
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
 * @author Raphael Touet <raphi@bypit.de>
 * 
 */

registerPlugin({
    name: 'Idle Mover',
    version: '2.7',
    description: 'The bot will move all clients that are idle longer than the time given (in seconds) to a separate channel',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphi@bypit.de>',
    vars: {
        idleTime: {
            title: 'Number of seconds idle',
            type: 'number',
            placeholder: '600'
        },
        idleChannel: {
            title: 'Name of the channel to move the client into',
            type: 'string'
        },
        exemptChannel: {
            title: 'Comma-separated list of ignored channels',
            type: 'string'
        },
        sendIdleMessage: {
            title: 'If the bot has to sent the idle message to each client which is moved',
            type: 'select',
            options: [
                'Send',
                'Don\'t Send'
            ]
        },
        idleMessage: {
            title: 'Message sent privatly to each client which is moved after idling to long',
            type: 'string',
            placeholder: 'You have been moved.'
        },
        checksPerMinute: {
            title: 'Number of times per minute the bot will check if the clients are idling',
            type: 'number',
            placeholder: '2'
        },
        ignoreIfOutputIsntMuted: {
            title: 'If the clients which speakers aren\'t disabled, has to be ignored by the idle mover',
            type: 'select',
            options: [
                'Ignore Client',
                'Don\'t Ignore Client'
            ]
        }
    }
}, function(sinusbot, config) {
    var exemptNames = config.exemptChannel.split(',').map(function(e) { return e.trim() });
    
    var counter = 0;
    var idleChannel = 0;
    var exemptChannels = [];
    
    var whitelist = {};
    
    if (config.idleTime < 150) {
        log('[Idle Mover] Idle time must be at least 150 seconds.');
        return;
    } 
    if (config.checksPerMinute > 30) {
        log('[Idle Mover] The bot won\'t check more than 30 times a minute, if the clients are idling...');
        return;
    }

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
            log('[Idle Mover] Idle check');
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
                    if (config.ignoreIfOutputIsntMuted == 0) {
                        if (!client.outputMuted) continue;
                    }
                    if (client.idle > config.idleTime * 1000 || (client.away && client.idle > config.idleTime * 500)) {
                        log('Client ' + client.nick + ' is idling, moving');
                        chatPrivate(client.id, config.idleMessage);
                        move(client.id, idleChannel);
                    }
                }
            }
        }
    });
	
    sinusbot.on('move', function(){
        if(ev.oldChannel == idleChannel){
            whitelist[ev.clientId] = Date.now();
        }
    });
        
    var updateChannels = function() {
        log('[Idle Mover] Connected, getting channels');
        var channels = getChannels();
        var channel_names = channels.map(function(e) { return e.name });
        if(channel_names.indexOf(config.idleChannel) >= 0){
            idleChannel = channels[channel_names.indexOf(config.idleChannel)].id;
            log('[Idle Mover] Idle-Channel will be ' + idleChannel);
        }
        for(var i = 0; i < exemptNames.length; i++){
            if(channel_names.indexOf(exemptNames[i]) >= 0){
                var id = channels[channel_names.indexOf(exemptNames[i])].id;
                if(exemptChannels.indexOf(id) == -1){
                    exemptChannels.push(id);
                }
            }
        }
        log('[Idle Mover] Exempted channels: ' + exemptChannels.toString());
    };
    updateChannels();
    sinusbot.on('connect', updateChannels);

    log('[Idle Mover] Idle Mover initialized...');
});


