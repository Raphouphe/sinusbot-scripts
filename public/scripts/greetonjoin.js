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
    name: 'Join-Greeting',
    version: '2.1',
    description: 'This script will let the bot greet everyone who joins the channel.',
    author: 'Raphael Touet <raphraph@raphraph.de>',
    vars: {
        message: {
            title: 'Message (%n = nickname)',
            type: 'string',
            placeholder: 'f.e. Welcome %n'
        },
        type: {
            title: 'Message-Type',
            type: 'select',
            options: [
                'Private chat',
                'Channel chat',
                'Poke',
                'Say'
            ]
        },
        locale: {
            title: 'Locale (used if \'Message-Type\' is set to \'Say\')',
            type: 'string',
            placeholder: 'f.e. en'
        },
        reformat_nick: {
            title: 'Reformat nickname',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        },
        reformat_string: {
            title: 'Reformat nickname - format',
            type: 'string',
            placeholder: '/^.* | .*$/i'
        },
        reformat_info: {
            title: 'Reformat nickname - details',
            type: 'multiline'
            // split: |
            // pos: 1
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
    
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
    
    if(typeof config.message == 'undefined') {log('Invalid message');return;}
    if(typeof config.type == 'undefined') {log('Invalid type');return;}
    
    var rf_nick_pos, rf_sep;
    if(typeof config.reformat_nick == 'undefined') {config.reformat_nick = 0;}
    if(config.reformat_nick == 1) {
        // if(typeof config.reformat_string == 'undefined') {log('Please define a reformat format! Disabled reformating feature.'); config.reformat_nick = 0;}
        if (typeof config.reformat_info == 'undefined') {log('Please define some reformat details! Disabled reformating feature.'); config.reformat_nick = 0;}
        else {
            var v = config.reformat_info.split('\n').map(function(e) {
                return e.trim();
            });
            for (var i = 0; i < v.length; i++) {
                if (v[i].startsWith('split:')) {
                    rf_sep = v[i].replace('split:', '').trim();
                } else if (v[i].startsWith('pos:')) {
                    rf_nick_pos = parseInt(v[i].replace('pos:', '').trim());
                    if (isNaN(rf_nick_pos)) {
                        log('The reformat detail \'pos\' has to be a number! Disabled reformating feature.');
                        config.reformat_nick = 0;
                    }
                }
            }
        }
    } 
    
    var type = config.type;
    
    if(type == 3){
        if(!config.locale) {log('Invalid locale');return;}
        if(!config.locale.match(/^utf-8$|^[a-z]{2}(?:-[a-z]{2})?$/i)) {log('Invalid locale');return;}
    }
    
    
    sinusbot.on('clientJoin', function(ev){        
        var msg = config.message;
        var nick = ev.clientNick;
        if (config.reformat_nick == 1) {
            if (nick.toLowerCase().indexOf(rf_sep.toLowerCase()) != -1) {
                var s = nick.split(rf_sep);
                if (s[rf_nick_pos] != 'undefined') {
                    nick = s[rf_nick_pos];
                }
            }
        }
        msg = msg.replace(/%n/g, nick);
        if(type == 3){
            msg = msg.replace(/\[.\](.{0,})\[\/.\]/i, '$1');
            msg = msg.replace(/<.>(.{0,})<\/.>/i, '$1');
        } 
       
        if(type == 0){
            chatPrivate(ev.clientId, msg);
        } else if(type == 1){
            log('channel');
            chatChannel(msg);
        } else if(type == 2){
            poke(ev.clientId, msg);
        } else if(type == 3){
            say(msg, config.locale);
        }
       
    });
    
    // -- Information --
    log('Loaded !');
    log('');
});
