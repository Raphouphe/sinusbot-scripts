/* 
 * Copyright (C) 2015 Raphael Touet <raphi@bypit.de>
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
    name: 'No Recording!',
    version: '1.1',
    description: 'This script will kick anyone who attempts to record.',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphi@bypit.de>',
    vars: {
        kickMessage: {
            title: 'Used kick message',
            type: 'string',
            placeholder: 'No recording on our server!'
        },
        exemptChannels: {
            title: 'Name-list of the channels which are exempted. (one per line)',
            type: 'multiline'
        },
        whitelistOrBlacklist: {
            title: 'Either allowing recording in the specified channels or not',
            type: 'select',
            options: [
                'Allow',
                'Deny'
            ]
        }
    }
}, function(sinusbot, config) {
    if(!config.kickMessage) {log('[No Rec.] Invalid kick message');return;}
    if(!config.whitelistOrBlacklist) {config.whitelistOrBlacklist = 0}
    if(!config.exemptChannels) {config.exemptChannels = ""}
    
    var exemptedChannelNames = config.exemptChannels.split('\n').map(function(e) { 
        return e.trim().replace(/\r/g, '');
    });
    var exemptChannels = [];
    
    sinusbot.on('record', function(ev) {
        var channels = getChannels();
        var channel;
        for (var i = 0; i < channels.length; i++) {
            channel = channels[i];
            if (exemptChannels.indexOf(channel.id) >= 0) {
                if (config.whitelistOrBlacklist == 1){
                    return;
                }
            }
        }
        kickServer(ev.clientId, config.kickMessage);
        log('Client with id: ' + ev.clientId + ' tried to record. Kicking...');
    });
    
    var updateChannels = function() {
        log('[No Rec.] Connected, getting channels');
        var channels = getChannels();
        var channel_names = channels.map(function(e) { return e.name });
        for(var i = 0; i < exemptedChannelNames.length; i++){
            if(channel_names.indexOf(exemptedChannelNames[i]) >= 0){
                var id = channels[channel_names.indexOf(exemptedChannelNames[i])].id;
                if(exemptChannels.indexOf(id) == -1){
                    exemptChannels.push(id);
                }
            }
        }
        log('[No Rec.] Exempted channels: ' + exemptChannels.toString());
    };
    
    updateChannels();
    sinusbot.on('connect', updateChannels);
});

