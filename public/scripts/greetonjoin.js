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
    
    if(typeof config.message == 'undefined') {log('Invalid message');return;}
    if(typeof config.type == 'undefined') {log('Invalid type');return;}
    
    var type = config.type;
    
    if(type == 3){
        if(!config.locale) {log('Invalid locale');return;}
        if(!config.locale.match(/^utf-8$|^[a-z]{2}(?:-[a-z]{2})?$/i)) {log('Invalid locale');return;}
    }
    
    
    sinusbot.on('clientJoin', function(ev){        
        var msg = config.message;
        msg = msg.replace(/%n/g, ev.clientNick);
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
