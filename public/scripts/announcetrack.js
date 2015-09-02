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
    name: 'Announce Track',
    version: '1.0',
    description: 'This script will announce (say) the specified message, each time a track is played. (Help: https://github.com/Raphouphe/sinusbot-scripts )',
    author: 'Raphael Touet <raphi@bypit.de>',
    vars: {
        message: {
            title: 'Announcing message',
            type: 'string',
            placeholder: 'Now playing: %t by %a'
        },
        locale: {
            title: 'Locale',
            type: 'string',
            placeholder: 'en'
        }
    }
}, function(sinusbot, config){
    log("[Ann. Track] Announce Tracks v1.0 by Raphael Touet");
    
    var msg = config.message, message;
    var locale = config.locale;
    
    if(!config.message) {log('[Ann. Track] Message not defined.');return;}
    if(!config.locale) {log('[Ann. Track] No locale defined. Using \'en\' !');locale = 'en';}
    
    if(!locale.match(/^utf-8$|^[a-z]{2}(?:-[a-z]{2})?$/i)) {log('[Ann. Track] Invalid locale.');return;}
    
    sinusbot.on('track', function (ev){
        message = msg;
        message = message.replace(/%ala/gi,((typeof ev.albumArtist !== 'undefined' && ev.albumArtist !== '') ? ev.albumArtist : ''));
        if(typeof ev.tempArtist !== 'undefined' && ev.tempArtist !== '') message = message.replace(/%ta/gi,ev.tempArtist);
        if(typeof ev.tempTitle !== 'undefined' && ev.tempTitle !== '') message = message.replace(/%tt/gi,ev.tempTitle);
        message = message.replace(/%al/gi,((typeof ev.album !== 'undefined' && ev.album !== '') ? ev.album : ''));
        message = message.replace(/%a/gi,((typeof ev.artist !== 'undefined' && ev.artist !== '') ? ev.artist : ''))
                .replace(/%t/gi,((typeof ev.title !== 'undefined' && ev.title !== '') ? ev.title : ''))
                .replace(/%d/gi,((typeof ev.duration !== 'undefined' && ev.duration > 0) ? ev.duration : ''));
        say(message,locale);   
    });
    
    log('[Ann. Track] Initialized script.');
    
});
