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
 * @author Raphael Touet <raphraph@raphraph.de>
 * 
 */

registerPlugin({
    name: 'Teammeeting',
    version: '1.0',
    description: 'This script will manage some teem-meetings.',
    author: 'Raphael Touet <raphraph@raphraph.de>',
    vars: {
        permissions: {
            title: 'Permission: ClientUIDs / ServergroupIDs',
            type: 'string',
            placeholder: 'JmVEkJ8Zt27E5ANPRFTTNwtqrl0= , 50'
        },
        defaultName: {
            title: 'Default channel name',
            type: 'string',
            placeholder: '» Teambesprechung  |  %d %t'
        },
        defaultTime: {
            title: 'Default time of the meeting',
            type: 'string',
            placeholder: '18h00'
        },
        order: {
            title: 'Where to place the channel',
            type: 'string',
            placeholder: 'before: The Channel Name // after: the channel id'
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
    log(info.name + ' v' + info.version + ' by ' + author + ' for SinusBot v0.9.9-50e8ba1 (and above)');
    
    // some basic variables
    var self = getBotId(), prefix = "["+info.name+"] ";
    
    // basic function
    var getChannel = function(ident) {
        var channels = getChannels(), channel;
        log(isNan(parseInt(ident)));
        if(isNan(parseInt(ident))===false){
            ident = parseInt(ident);
            for(var i = 0; i<channels.length; i++){
                channel = channels[i];
                if(channel.id == ident) return channel;
            }
            return false;
        } else {
            log('string');
            for(var i = 0; i<channels.length; i++){
                channel = channels[i];
                if(channel.name == ident) return channel;
            }
            return false;
        }
    };
    
    // checking configuration
    if(typeof config.order === 'undefined') {log(prefix+"Please define where the channel have to be placed!");return;}
    else {
        var o = config.order.trim().split(':').map(function(e){return e.trim();});
        config.order = getChannel(o[1]);
        log(config.order);
        return;
        if(config.order === false){
            log(prefix+"Please define where the channel have to be placed!");
            return;
        }
        switch(o[0]) {
            case "before":
                config.order = ((config.order.order - 1) >= 0) ? config.order.order - 1 : 0;
                break;
            case "after":
                config.order = config.order.order + 1;
                break;
            default:
                log(prefix+"Please define where the channel have to be placed!");
                return;
        }
    }
    
    // -- Recreating "startsWith()" function which isn't included in ECMAScript 5 --
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };  
    }
    
    // functions
    var mCreate = function(meetingDate, meetingTime){
        meetingDate = typeof meetingDate !== 'undefined' ? meetingDate : (new Date()).getDate().toString() + "." + ((new Date()).getMonth() + 1).toString();
        meetingTime = typeof meetingTime !== 'undefined' ? meetingTime : config.defaultTime;
        
        var name = config.defaultName.replace("%d",meetingDate).replace("%t",meetingTime);
        channelCreate({name: name, codec: 4, default: 0, enc: 1, maxClients: 0, parent: 0, perm: 1, pw: 0, quality: 10, sperm: 0, topic: "", order: config.order});
    };
    
    var command = [];
    sinusbot.on('chat', function(ev){
        if(self == ev.clientId) return;
        if(ev.mode != 1) return;
        ev.msg = ev.msg.trim();
        if(!ev.msg.startsWith('!')) return;
        command = ev.msg.substring(1).split(' ').map(function(e){return e.trim();});
        if(command[0] != "meeting") return;
        switch(command[1]){
            case "start":
                
                break;
            case "end":
                
                break;
            case "mute":
                
                break;
            case "create":
                if(command.length !== 4){
                    chatPrivate(ev.clientId, prefix+"Please retry: !meeting create <date> <time>");
                }
                mCreate(command[2].replace("_"," "), command[3].replace("_"," "));
                break;
            case "delete":
            
                break;
            default:
                chatPrivate(ev.clientId, prefix+"Valid parameters: start / end / mute / create / delete");
        }
    });
    
    // -- Information --
    log('Loaded !');
    log('');
});