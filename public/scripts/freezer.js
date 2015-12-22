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
    name: 'Freezer',
    version: '1.0',
    description: 'This script will be able to freeze a user. (Help: https://github.com/Raphouphe/sinusbot-scripts)',
    author: 'Raphael Touet <raphraph@raphraph.de>',
    vars: {
        permissions: {
            title: 'Permission: ClientUIDs / ServergroupIDs',
            type: 'string',
            placeholder: 'JmVEkJ8Zt27E5ANPRFTTNwtqrl0= , 50'
        },
        del_data: {
            title: 'Delete stored data',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
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
    log(info.name + ' v' + info.version + ' by ' + author + ' for SinusBot v0.9.9-??? (and above)');
    
    var permissions = [];
    if (typeof config.permissions != "undefined") {
        permissions = config.permissions.split(",").map(function(e,i,a){
            return e.trim();
        });
    }
    if (typeof config.del_data == "undefined") {config.del_data = 0;}
    else {
        if (config.del_data == 1) {
            unset('freezer_freezed');
            config.del_data = 0;
        }
    }
    
    var freezed = get('freezer_freezed');
    if (typeof freezed == "undefined") freezed = {};
    
    var freeze = function(uid, until, channel_id) {
        freezed[uid] = {uid: uid, until: until, channel_id: channel_id};
        set('freezer_freezed', freezed);
    };
    
    var unfreeze = function() {
        
    };
    
    // -- Information --
    log('Loaded !');
    log('');
});