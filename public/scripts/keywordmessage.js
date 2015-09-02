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

registerPlugin({
    name: 'Keyword Message',
    version: '2.0',
    description: 'This script will response to some defined keywords. (Help: https://github.com/Raphouphe/sinusbot-scripts)',
    author: 'Am4n <am4n.ar@gmail.com>, Raphael Touet <raphraph@raphraph.de>',
    vars: {
        cs:{
            title: 'Keyword/Command/Regex: Output',
            type: 'multiline'
        },
        fs: {
            title: 'Respond on server-chat. (default: no)',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        },
        fc: {
            title: 'Respond on channel-chat. (default: no)',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        },
        fp: {
            title: 'Respond on private-chat. (default: yes)',
            type: 'select',
            options: [
                'No',
                'Yes'
            ]
        }
    }
}, function (sinusbot, config) {
    log("");
    
    if(!config.cs) {log("[Keyword Msg] Please define at least one combination."); return;}
    if(!config.fs) {log("Keyword Msg] You did not select if the bot should respond on messages from the server-chat. Default (: no) is used.");config.fs=0;}
    if(!config.fc) {log("Keyword Msg] You did not select if the bot should respond on messages from the channel-chat. Default (: no) is used.");config.fc=0;}
    if(!config.fp) {log("Keyword Msg] You did not select if the bot should respond on messages from the private-chat. Default (: yes) is used.");config.fp=1;}
 
    var fs = config.fs, fc = config.fc, fp = config.fp, sf = getBotId();
 
    var cTR = function(s) {
        s = s.substr(1);
        var arr = s.split("/");
        return new RegExp(arr[0],arr[1]);
    };
    
    var fls = [], t, k, o, cs = config.cs.split('\n').map(function(e) { 
        if(e.match(/.{3,}:.{3,}/)){
            k = e.split(':')[0].trim();
            if(k.match(/^\/.*\/.*$/) != null){
                t = "regex";
                k = cTR(k);
            } else if(k.match(/\..{1,}/i)){
                t = "command";
                k = k.toLowerCase();
            } else {
                if(k.startsWith("\\")){
                    k = k.substr(0);
                }
                t = "string";
                k = k.toLowerCase();
            }
            o = e.split(":")[1].trim();
            
            return {k: k, o: o, t: t};
        } else {
            fls.push(e);
        }
        return null;
    });
    
    if(fls.length != 0){
        log("[Keyword Msg] Found some invalid cs: ");
        fls.forEach(function(e){
            log("- "+e);
        });
        log("");
        log("[Keyword Msg] A combination is build like this: 'keyword : output'. The keyword can either be a regular expression, one or more words, or a command (starting with a dot). Each the keyword and the ouput has to be at least 3 characters long!");
    }
    
    for(var i = 0; i<cs.length; i++){
        if(cs[i] == null | cs[i] == 'undefined'){
            cs.splice(i, 1);
        }
    }
 
    var o, c, cM = function(me, mo, id, ni){
        for(var i = 0; i<cs.length; i++){
            c = cs[i];
            if(c.t === "regex"){
                if(me.match(c.k) == null || me.match(c.k) == 'undefined'){
                    log("c");
                    continue;
                }
            } else if(c.t === "string"){
                if(me.toLowerCase().indexOf(c.k) === -1){
                    continue;
                }
            } else if(c.t === "command"){
                if(me.toLowerCase().startsWith(c.k) === false){
                    continue;
                }
            }
            o = c.o.replace("%n", ni);
            if(mo === 1){
                chatPrivate(id, o);
            } else if(mo === 2){
                chatChannel(o);
            } else if(mo === 3){
                chatServer(o);
            }
        }
    };
 
    sinusbot.on('chat', function(ev) {
        sf = getBotId();
        if(ev.clientId === sf){
            return;
        }

        if(ev.mode === 1 && fp === 0){
            return;
        } else if(ev.mode === 2 && fc === 0) {
            return;
        } else if(ev.mode === 3 && fs === 0){
            return;
        }

        cM(ev.msg, ev.mode, ev.clientId, ev.clientNick);

    });
    
    log('[Keyword Msg] Initialized Script.');
    log('');
});


