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
 * @author Michael Friese <michael@sinusbot.com>
 * @author Raphael Touet <raphi@bypit.de>
 * 
 */

registerPlugin({
    name: 'Bad Channel Names',
    version: '1.1',
    description: 'This script will remove all channels matching some userdefined names.',
    author: 'Michael Friese <michael@sinusbot.com>, Raphael Touet <raphi@bypit.de>',
    vars: {
        names: {
            title: 'Comma-separated list of forbidden names',
            type: 'string'
        }
    }
}, function(sinusbot, config) {
    var names = config.names.split(',').map(function(e) { return e.trim() });
    sinusbot.on('channelCreate', function(ev) {
        if (!ev.name) return; // should not happen
        for (var i = 0; i < names.length; i++) {
            if (ev.name.toLowerCase().indexOf(names[i].toLowerCase()) >= 0) {
                log('Deleting channel ' + ev.name);
                channelDelete(ev.id, true);
                return;
            }
        }
    });
});

