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
    name: 'Bad Usernames',
    version: '1.0',
    description: 'This script will warn / kick / warn and kick all users matching some userdefined names or regex expressions.',
    author: 'Raphael Touet <raphraph@raphraph.de>',
    vars: {
        expressions: {
            title: 'Forbidden names/regex (one per line)',
            type: 'multiline'
        },
        ignoredClients: {
            title: 'Ignored client ids/uuids',
            type: 'string'
        },
        type: {
            title: 'Warn/Kick/Both',
            type: 'select',
            options: [
                'Warn',
                'Kick',
                'Warn and kick'
            ]
        },
        messages: {
            title: 'The messages sent to the client. (First line: warn message, Second line: kick message) (Use: %n -> client nick, %d -> delay before being kicked)',
            type: 'multiline'
        },
        kickDelay: {
            title: 'The delay (in seconds) before the name of the client is checked again, and if it\'s a bad name the client get kicked. (cannot be lower than 30) (can differ up to 5 seconds)',
            type: 'number',
            placeholder: '10'
        }
    }
}, function(sinusbot, config) {
    log('[Bad Usernames] Bad Usernames v1.0 by Raphael Touet');
    
    if(!config.expressions) {log('[Bad Usernames] No regex expressions or names defined');return;}
    var ignoredClients = [];
    if(!config.ignoredClients) {
        log('[Bad Usernames] No ignored clients defined');
    } else {
        ignoredClients = config.ignoredClients.split('\n').map(function(e) { return e.trim().replace(/\r/g, ''); });
    }
    
    var expressions = config.expressions.split('\n').map(function(e) { 
        return e.trim().replace(/\r/g, ''); 
    });
    
    if(!config.type) {log('[Bad Usernames] No type defined');return;}
    var type = config.type;
    if(typeof type != 'number') type = parseInt(type);
    
    if(!config.messages) {log('[Bad Usernames] No messages defined');return;}
    var messages = {};
    var m = config.messages.split('\n').map(function(e) { return e.trim().replace(/\r/g, '')
            .replace(/(?:[url=.{1,}])?((https?:\/\/(?:www\.)?[a-zA-Z0-9._\/-]+\.[a-zA-Z]{2,63})([\/?\#](?:.){0,})?)(?:[/url])?/gi,'[url=$1]$1[/url]'); });
    if(m.length < 2) {log('[Bad Usernames] You have to define 2 messages');return;}
    messages['warn'] = m[0];
    messages['kick'] = m[1];
    
    if(type == 2){
        var kickDelay = config.kickDelay;
        if(!kickDelay || kickDelay < 10) {log('[Bad Usernames] Invalid kick-delay. Using 10 seconds.');kickDelay=10;}
    }
    
    var delayed = {};
    
    var logFunc = function(what, params){
        if(what == 'badUsername'){
            log('[Bad Usernames] ' + ((type == 0 || type == 2) ? "Warning" : "Kicking" ) + ' \'' + params['client'] + '\' with id \'' + 
                    params['id'] + '\' and uuid \'' + params['uuid'] +'\' (matches: ' + params['match'] +')');
        }
    }
    
    var convertToRegex = function(string) {
        string = string.substr(1);
        var arr = string.split("/");
        return new RegExp(arr[0],arr[1]);
    }
    
    var checkName = function(id, uuid, name){
        if(ignoredClients.indexOf(id.toString()) >= 0 || ignoredClients.indexOf(uuid) >= 0) return false;
        var expression, reg;
        for(var i = 0; i < expressions.length; i++){
            expression = expressions[i];
            if(expression.match(/^\/.*\/.*$/)){
                reg = convertToRegex(expression);
                if(name.match(reg)){
                    logFunc('badUsername', {id: id, uuid: uuid, client: name, match: expression});
                    return true;
                }
            } else {
                if(name.toLowerCase().match(expression.toLowerCase())){
                    logFunc('badUsername', {id: id, uuid: uuid, client: name, match: expression});
                    return true;
                }
            }
        }
        return false;
    }
    
    var checkClient = function (id, uuid, nick){
        if (!checkName(id, uuid, nick)) return;
        if (type == 0){
            var msg = messages.warn;
            msg = msg.replace(/%n/ig, nick);
            chatPrivate(id, msg);
        } else if(type == 1){
            var msg = messages.kick;
            msg = msg.replace(/%n/ig, nick);
            kickServer(id, msg);
        } else {
            var msg = messages.warn;
            msg = msg.replace(/%n/ig, nick).replace(/%d/ig, kickDelay.toString() + ' sec.');
            chatPrivate(id, msg);
            delayed[id] = {uuid: uuid, nick: nick, time: Date.now()};
        }
    }
    
    var getClient = function (id){
        var channels = getChannels();
        var channel, clients, client;
        for (var i = 0; i<channels.length; i++){
            channel = channels[i];
            if(!channel.clients) continue;
            clients = channel.clients;
            for (var j = 0; j < clients.lengtj; j++){
                client = clients[j];
                if (client.id != id) continue;
                return client;
            }
        }
        return false;
    }
    
    sinusbot.on('clientMove', function(ev){
        if(ev.oldChannel == 0){
            checkClient(ev.clientId, ev.clientUid, ev.clientNick);
        }
    });
    
    sinusbot.on('nick', function(ev){
        checkClient(ev.clientId, ev.clientUid, ev.clientNick);
    });
    
    var checkAllClients = function(){
        var channels = getChannels(), channel, clients, client;
        for(var i = 0; i<channels.length; i++){
            channel = channels[i];
            if(!channel.clients) continue;
            clients = channel.clients;
            for(var j = 0; j<clients.length; j++){
                client = clients[j];
                checkClient(client.id, client.uid, client.nick);
            }
        }
    }
    
    sinusbot.on('connect', function(){
        checkAllClients();
    });
    
    if(type == 2){
        var ctr = -1, time, client;
        sinusbot.on('timer', function(){
            ctr++;
            if((ctr % 5) != 0) return;        
            time = Date.now();
            for (var id in delayed){
                if (delayed[id].time + kickDelay * 1000 > time) continue;
                client = getClient(id);
                if (!checkName(id, client.uid, client.nick)) delete delayed[id]; 
                var msg = messages.kick;
                msg = msg.replace(/%n/ig, delayed[id].nick);
                kickServer(id, msg);
                delete delayed[id];
            }
        });
    }
    
    checkAllClients();
    log('[Bad Usernames] Initialized script.');
    
});