registerPlugin({
    name: 'Pause/Resume',
    version: '2.0',
    description: 'Type !pause to pause the current track, and type !resume to resume playback.',
    author: 'Bey0nd_Inf1nite, Raphael Touet <raphraph@raphraph.de>',
    vars: {}
}, function(sinusbot, config, info) {

	// as of included in the SinusBot v0.9.9-a4f6453 , the 'info' variable provides information about the script
	if(typeof info != 'undefined') {
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
	}
	
	var pos, track, accounts, account, priv_playback = 0x00001000, auth = false; // took out the variables
    sinusbot.on('chat', function(ev) {
		if (ev.mode == 3) return; // if the message is send in the server-chat, the bot will not response to avoid some communication errors with other bots
		accounts = getUsers();
		for(var key in accounts) {
			account = accounts[key];
			if(account.tsuid == ev.clientUid) {
				if(!(account.privileges & priv_playback)){
					chatPrivate(ev.clientId, 'You don\'t have permission to do this!');
					return;
				}
				auth = true;
				break;
			}
		}
		if(!auth) {chatPrivate(ev.clientId, 'You don\'t have permission to do this!'); return;}
        if (ev.msg.trim() == '!pause') { // add trim() : removes the whitespaces at the start and the end of the string. So '!pause ' or ' !pause ' will work to.
            track = getTrack();
            if (!track) return;
            pos = getPos();
            set(track.uuid, pos);
            chatChannel(ev.clientNick + ' paused the currently playing track.');
            stop();
        }
        if (ev.msg == '!resume') {
            play(track);
            var track = getTrack();
            if (!track) return;
            var pos = get(track.uuid);
            if (!pos) {
                chatPrivate(ev.clientId, 'No track has been paused.');
                return;
            }
            seek(pos);
            chatChannel(ev.clientNick + ' resumed the track');
        }
    });
});