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
 * @author Am4n <am4n.ar@gmail.com>
 * @author Raphael Touet <raphraph@raphraph.de>
 * 
 */

registerPlugin({
    name: 'Keyword Message',
    version: '3.1',
    description: 'This script will response to some defined keywords. (Help: https://github.com/Raphouphe/sinusbot-scripts)',
    author: 'Am4n <am4n.ar@gmail.com>, Raphael Touet <raphraph@raphraph.de>',
    vars: {
        combinations:{
            title: 'Keyword/Command/Regex: Output',
            type: 'multiline'
        },
        use_server_chat: {
            title: 'Respond on server-chat',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        },
        use_channel_chat: {
            title: 'Respond on channel-chat',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        },
        use_private_chat: {
            title: 'Respond on private-chat',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        }
    }
}, function(sinusbot, config, info){
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
    
    // -- Checking configuration --
    if(typeof config.combinations == 'undefined') {log('You have to define at least one combination!'); log(''); return;}
    if(typeof config.use_server_chat == 'undefined') {config.use_server_chat = 0;}
    if(typeof config.use_channel_chat == 'undefined') {config.use_channel_chat = 0;}
    if(typeof config.use_private_chat == 'undefined') {config.use_private_chat = 1;}
    
    // -- Checking if an input-chat is selected --
    if(config.use_channel_chat == 0 && config.use_server_chat == 0 && config.use_private_chat == 0){
        log('Disabled script. You have to select an input-chat.');
        log('');
        return;
    }
    
    // -- Information about which input-chat has been chosen --
    log("");
    log('The bot is now responding on messages from:');
    if (config.use_server_chat == 1) log("- server chat");
    if (config.use_channel_chat == 1) log("- channel chat");
    if (config.use_private_chat == 1) log("- private chat");
    
    // -- Recreating "startsWith()" function which isn't included in ECMAScript 5 --
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };  
    }
    
    // -- Function to convert a string to a regular expression --
    var convertToRegex = function(string) {
        string = string.substr(1);
        var arr = string.split("/");
        return new RegExp(arr[0],arr[1]);
    };
    
    // -- Converting multiline combinations setting into an array of objects --
    var failed = [], type, key, output, e, cs = config.combinations.split('\n');
    var combinations = [];
    for(var i = 0; i<cs.length; i++){
        e = cs[i];
        if(e.match(/^.{3,}:.{3,}$/)){
            key = e.split(':')[0].trim();
            output = e.split(":");
            output = output.slice(1,output.length).join(":").trim();
            if(key.match(/^\/.*\/.*$/) != null){
                type = "regex";
                key = convertToRegex(key);
            } else if(key.match(/\..{1,}/i) != null){
                type = "command";
                key = key.toLowerCase();
            } else {
                type = "string";
                key = key.toLowerCase();
            }
            combinations.push({key: key, output: output, type: type});
        } else {
            failed.push(e);
        }
    }
    
    // -- Information about which combination isn't valid --
    if(failed.length != 0){
        log("");
        log("Found some invalid cs: ");
        failed.forEach(function(e){
            log("- "+e);
        });
        log("A combination is build like this: 'keyword : output'. The keyword can either be a regular expression, one or more words, or a command (starting with a dot). Each the keyword and the ouput has to be at least 3 characters long!");
        log("");
    }
    
    // -- Function to check if the bot has to reply to the given message --
    var output, combi, checkMessage = function(message, mode, id, nick) {
        for(var i = 0; i<combinations.length; i++){
            combi = combinations[i];
            if(combi.type == 'regex'){
                if(message.match(combi.key) == null || typeof message.match(combi.key) == 'undefined'){
                    continue;
                }
            } else if(combi.type == 'command'){
                if(message.toLowerCase().startsWith(combi.key) == false){
                    continue;
                }
            } else {
                if(message.toLowerCase().indexOf(combi.key) == -1){
                    continue;
                }
            }
            output = combi.output.replace("%n", nick);
            if(mode == 1){
                chatPrivate(id, output);
            } else if(mode == 2){
                chatChannel(output);
            } else {
                chatServer(output);
            }
        }
    };
    
    // -- Checks whenever a client sends a message --
    var self;
    sinusbot.on('chat', function(ev) {        
        self = getBotId();
        if(ev.clientId == self){
            return;
        }
        
        switch (ev.mode) {
            case 1:
                if(config.use_private_chat == 0) return;
                break;
            case 2:
                if(config.use_channel_chat == 0) return;
                break;
            case 3:
                if(config.use_server_chat == 0) return;
                break;
        }

        checkMessage(ev.msg, ev.mode, ev.clientId, ev.clientNick);

    });
    
    // -- Information --
    log('Loaded !');
    log('');
});