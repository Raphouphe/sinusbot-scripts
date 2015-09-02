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
 * @author Raphael Touet <raphi@bypit.de>
 * 
 */
registerPlugin({
    name: 'Join-Greeting',
    version: '2.0',
    description: 'This plugin will let the bot greet everyone who joins the channel.',
    author: 'Raphael Touet <raphi@bypit.de>',
    vars: {
        message: {
            title: 'The message that should be displayed or sayed. (%n = nickname)',
            type: 'string',
            placeholder: 'Welcome %n'
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
            title: 'The locale used if \'type\' is set to \'say\'.',
            type: 'string',
            placeholder: 'en'
        }
    }
}, function(sinusbot, config){
    log("[J-Greet] Join-Greeting v2.0 by Raphael Touet");
    
    if(!config.message) {log('[J-Greet] Invalid message');return;}
    if(!config.type) {log('[J-Greet] Invalid type');return;}
    
    var type = config.type;
    if(typeof type != 'number'){
        type = parseInt(config.type, 10);
    }
    
    if(type == 3){
        if(!config.locale) {log('[J-Greet] Invalid locale');return;}
        if(!config.locale.match(/^utf-8$|^[a-z]{2}(?:-[a-z]{2})?$/i)) {log('[J-Greet] Invalid locale');return;}
    }
    
    
    sinusbot.on('clientJoin', function(ev){        
        var msg = config.message;
        msg = msg.replace(/%n/g, ev.clientNick);
        if(type != 3){
            msg = msg.replace(/(?:[url=.{1,}])?((https?:\/\/(?:www\.)?[a-zA-Z0-9._\/-]+\.[a-zA-Z]{2,63})([\/?\#](?:.){0,})?)(?:[/url])?/gi, '[url=$1]$1[/url]');
        } else {
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
    
    log('[J-Greet] Initialized script.');
});
