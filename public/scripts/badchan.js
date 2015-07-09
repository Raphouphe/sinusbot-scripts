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
    name: 'Bad Channel Names',
    version: '1.2',
    description: 'This script will remove all channels matching some userdefined names.',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphi@bypit.de>',
    vars: {
        names: {
            title: 'List of forbidden names or regex (one per line)',
            type: 'multiline'
        },
        ignoredChannels: {
            title: 'Comma-separated list of ignored channel-ids',
            type: 'string'
        }
    }
}, function(sinusbot, config) {
    if (!config.names) {log('[BCN] Invalid channel names'); return;}
    var ignoredChannels = [];
    if (config.ignoredChannels){
        ignoredChannels = config.ignoredChannels.split('\n').map(function(e) { 
            var n = parseInt(e.trim().replace(/\r/g, ''));
            if(!n){
                return -1;
            }
            return n;
        }); 
    }
    
    var names = config.names.split('\n').map(function(e) { return e.trim().replace(/\r/g, ''); });
    
    var convertToRegex = function(string) {
        string = string.substr(1);
        var arr = string.split("/");
        return new RegExp(arr[0],arr[1]);
    }
    
    sinusbot.on('channelCreate', function(ev) {
        if (!ev.name) return; // should not happen
        if (ignoredChannels.indexOf(ev.id) >= 0) return;
        var expression, reg;
        for (var i = 0; i < names.length; i++) {
            expression = names[i];
            log('exp: '+expression);
            if (expression.match(/^\/.*\/.*$/)){
                reg = convertToRegex(names[i]);
                if(ev.name.match(reg)){
                    log('[BCN] Deleting channel ' + ev.name);
                    channelDelete(ev.id, true);
                    return;
                }
            } else {
                if (ev.name.toLowerCase().indexOf(expression.toLowerCase()) >= 0) {
                    log('[BCN] Deleting channel ' + ev.name);
                    channelDelete(ev.id, true);
                    return;
                }
            }
        }
    });
    
    var updateChannels = function() {
        var channels = getChannels();
        var removed = [];
        var channel;
        for(var j = 0; j < channels.length; j++){
            channel = channels[j];
            if (ignoredChannels.indexOf(channel.id) >= 0) continue;
            for (var i = 0; i < names.length; i++) {
                if (names[i].match(/^\/.*\/.*$/)){
                    var reg = convertToRegex(names[i]);
                    if(channel.name.match(reg)){
                        removed.push(channel.name);
                        channelDelete(channel.id, true);
                    }
                } else {
                    if (channel.name.toLowerCase().indexOf(names[i].toLowerCase()) >= 0) {
                        removed.push(channel.name);
                        channelDelete(channel.id, true);
                    }
                }
            }
        }
        if(removed.length > 0) log('[BCN] Removed following channels: ' + removed.toString());
    };
    
    updateChannels();
    sinusbot.on('connect', updateChannels);
    log('[BCN] Initialized Script.');
    
});

