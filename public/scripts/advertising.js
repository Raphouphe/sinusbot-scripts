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
 * @author Michanel Friese <michael@sinusbot.com>
 * @author Raphael Touet <raphi@bypit.de>
 * 
 */
registerPlugin({
    name: 'Advertising (Text)',
    version: '1.2',
    description: 'This script will announce one of the configured lines every x seconds.',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphi@bypit.de>',
    vars: {
        ads: {
            title: 'Ads (supports bbcode)',
            type: 'multiline',
            placeholder: 'Welcome to the best TS3-Server!'
        },
        interval: {
            title: 'Interval (in seconds)',
            type: 'number',
            placeholder: '5'
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
}, function(sinusbot, config) {
    if(!config.ads) {log('[Advertising] Ads not defined.');return;}
    if(!config.interval || config.interval < 5) {log('[Advertising] Invalid interval.');return;}
    if(!config.order) {log('[Advertising] Order not selected.');return;}
    if(!config.type) {log('[Advertising] Type not selected.');return;}
    
    var ads = config.ads.split('\n').map(function(e) { 
        return e.trim().replace(/\r/g, '')
                .replace(/(?:[url=.{1,}])?((https?:\/\/(?:www\.)?[a-zA-Z0-9._\/-]+\.[a-zA-Z]{2,63})([\/?\#](?:.){0,})?)(?:[/url])?/gi,'[url=$1]$1[/url]'); 
    });
    if(ads.length == 0) {log('[Advertising] No ads defined.');return;}
    
    var order = config.order;
    if(typeof order != 'number') order = parseInt(order);
    var type = config.type;
    if(typeof type != 'number') type = parseInt(type);
    
    var ctr = 0;
    
    sinusbot.on('timer', function() {
        ctr++;
        if (ctr % config.interval != 0) return;
        var ad = ctr % ads.length;
        if (order == 1 && ads.length > 1) {
            ad = getRand(ads.length - 1);
        }
        if (type == 0) {
            chatChannel(ads[ad]);
        } else if(type == 1) {
            chatServer(ads[ad]);
        } else {
            var channel, client;
            var channels = getChannels();
            for (var i = 0; i < channels.length; i++) {
                channel = channels[i];
                for (var j = 0; j < channel.clients.length; j++) {
                    client = channel.clients[j];
                    chatPrivate(client.id, ads[ad]);
                }
            }
        }
    });
    
    log('[Advertising] Initialized script.');
});
