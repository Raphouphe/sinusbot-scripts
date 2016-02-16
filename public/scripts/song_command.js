registerPlugin({
    name: '!Song command',
    version: '1.0',
    description: 'Type !song to display the current track.',
    author: 'Raphael Touet <raphraph@raphraph.de>',
    vars: {
		message: {
			title: 'The message which is displayed',
			type: 'string',
			placeholder: 'Currently playing: %t by %a'
		}
	}
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
		log(info.name + ' v' + info.version + ' by ' + author + ' for SinusBot v0.9.9-50e8ba1 (and above)');
	}
	
	if(typeof config.message == "undefined") {log('You have to define a message in the web-configuration of the script !'); return;}
	
	var cmd, track, msg;
    sinusbot.on('chat', function(ev) {
		if (ev.clientId == getBotId()) return;
		if (ev.mode == 3 || ev.mode == 2) return;
        cmd = ev.msg.trim().split(' ');
		cmd = cmd[0];
		if(cmd != "!song") return;
		track = getTrack();
		if(typeof track.artist != "undefined" && typeof track.title != "undefined") {
			msg = config.message.replace('%a', track.artist).replace('%t', track.title);
		} else {
			msg = config.message.replace('%t', track.filename);
		}
		chatPrivate(ev.clientId, msg);
    });
	
	log('Loaded !');
    log('');
});