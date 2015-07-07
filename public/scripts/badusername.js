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
 * @author Raphael Touet <raphi@bypit.de>
 * 
 */

registerPlugin({
    name: 'Bad Usernames',
    version: '0.1 ALPHA',
    description: 'This script will warn / kick / warn and kick all users matching some userdefined names or regex expressions.',
    author: 'Raphael Touet <raphi@bypit.de>',
    vars: {
        expressions: {
            title: 'List of forbidden names or regex expressions (one per line)',
            type: 'multiline'
        },
        ignoredClients: {
            title: 'Comma-separated list of ignored client ids or uuids',
            type: 'string'
        },
        type: {
            title: 'If the client has to be warned / kicked or both',
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
            title: 'The delay (in seconds) before the name of the client is checked again, and if it\'s a bad name the client get kicked. (cannot be lower than 30)',
            type: 'number',
            placeholder: '30'
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
    
    if(!config.messages) {log('[Bad Usernames] No messages defined');return;}
    var messages = {};
    var m = config.expressions.split('\n').map(function(e) { return e.trim().replace(/\r/g, '')
            .replace(/(?:[url=.{1,}])?((https?:\/\/(?:www\.)?[a-zA-Z0-9._\/-]+\.[a-zA-Z]{2,63})([\/?\#](?:.){0,})?)(?:[/url])/gi,'[url=$1]$1[/url]'); });
    messages['warn'] = m[0];
    messages['kick'] = m[1];
    
    if(config.type == 2){
        if(!config.kickDelay || config.kickDelay < 30) {log('[Bad Usernames] Invalid kick-delay. Using 30 seconds.');config.kickDelay=30;}
    }
    
    var delayed = {};
    
    var logFunc = function(what, params){
        if(what == 'badUsername'){
            log('[Bad Usernames] ' + ((config.type == 0 || config.type == 2) ? "Warning" : "Kicking" ) + ' \'' + params['client'] + '\' with id \'' + 
                    params['id'] + '\' and uuid \'' + params['uuid'] +'\' (matches: ' + params['match'] +')');
        }
    }
    
    var checkName = function(id, uuid, name){
        if(ignoredClients.indexOf(id.toString()) >= 0 || ignoredClients.indexOf(uuid) >= 0) return false;
        var expression, reg;
        for(var i = 0; i < expressions.length; i++){
            expression = expressions[i];
            if(expression.match(/^\/.*\/$/)){
                reg = new RegExp(expression);
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
        if (config.type == 0){
            var msg = messages.warn;
            msg = msg.replace(/%n/ig, nick);
            chatPrivate(id, msg);
        } else if(config.type == 1){
            var msg = messages.kick;
            msg = msg.replace(/%n/ig, nick);
            kickServer(id, msg);
        } else {
            var msg = messages.warn;
            msg = msg.replace(/%n/ig, nick).replace(/%d/ig, config.kickDelay.toString() + ' sec.');
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
    
    if(config.type == 2){
        var ctr = -1, time;
        sinusbot.on('timer', function (ev){
            ctr++;
            if((counter % 5) != 0) return;        
            time = Date.now();
            for (var id in delayed){
                if (delayed[id].time + config.kickDelay > time) continue;
                if (!checkName(id, delayed[id].uuid, delayed[id].nick)) delete delayed[id]; 
                var msg = messages.kick;
                msg = msg.replace(/%n/ig, delayed[id].nick);
                kickServer(id, msg);
                delete delayed[id];
            }
        });
    }
    
    log('[Bad Usernames] Initiated script. Now works :)');
    
});