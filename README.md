# sinusbot-scripts
Scripts for the SinusBot (http://sinusbot.com)

#### Idle Mover (idle.js)
<blockquote>
Author: <a href="https://github.com/Raphouphe">Raphraph</a> (raphi@bypit.de) + <a href="https://github.com/flyth">flyth</a><br />
Version: 3.0<br />
Description: This script will move all idling clients to a defined channel.
</blockquote>
<hr />
<blockquote><h5>Settings</h5></blockquote>
<table>
<tr><th>Setting</th><th>Description</th><th>Values</th></tr>
<tr><td>Idle time</td><td>Time (in seconds) after which a client is labeled as idling.</td><td>A valid number bigger than 150</td></tr>
<tr><td>Idle channel</td><td>The channel where idling clients are moved to.</td><td>A valid channel name</td></tr>
<tr><td>Exempted channels</td><td>Clients which are in some of these channels, will be ignored by the Bot.</td><td>Each line, one valid channel name.</td></tr>
<tr><td>Send idle message</td><td>Whether to send an idling message or not.</td><td><em>Just select one of the given options.</em></td></tr>
<tr><td>Idle message</td><td>The message which is sent to the clients which are idling, if 'Send idle message' is set to 'Send'.</td><td>A valid message. Supports BBCode. Experimental: should automatically convert links to BBCode.</td></tr>
<tr><td>Checks per minute</td><td>How many times per minute, the bot will check if some clients are idling.</td><td>A valid number lower or equal to 30.</td></tr>
<tr><td>Speakers not disabled</td><td>Whether to ignore or not, clients whose speakers aren't disabled.</td><td><em>Just select one of the given options.</em></td></tr>
</table>
#### Advertising (advertising.js)

#### Bad Channel Names (badchan.js)

#### Bad Usernames (badusername.js)

#### Greet On Join (greetonojoin.js)

#### No Recording (norecording.js)
