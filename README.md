SinusBot Scripts. JavaScript Scripts by Raphael Touet for the SinusBot by flyth (https://frie.se)
Copyright (C) 2015 Raphael Touet (@Raphouphe)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

You can find a copy of the GNU General Public Licence in the [LICENCE](LICENCE) file.

### SinusBot Scripts
<blockquote><h4><em>Scripts for the SinusBot (http://sinusbot.com)</em></h4></blockquote>
<br />

#### How do I know if I can use these scripts?
If you use a version, in which the script-fetaure is already implemented, you will find a `Scripts` section in your `Settings`.

#### How do I "install" these scripts?
You will need access on the SinusBot files. There is a folder named `scripts`. You will have to download the script-file and moved it into this directory. <br/>
Then you just have to restart your bot, and they will appear in sour `Scripts` section.
<br />
<br />
#### Scripts

<blockquote>
<h4>Idle Mover (idle.js)</h4>
Author: <a href="https://github.com/Raphouphe">Raphraph</a> (raphraph@raphraph.de) & <a href="https://github.com/flyth">flyth</a><br />
Description: This script will move all idling clients to a defined channel.
Tested with version: --
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
<br />

<blockquote>
<h4>Advertising (advertising.js)</h4>
Author: <a href="https://github.com/Raphouphe">Raphraph</a> (raphraph@raphraph.de) & <a href="https://github.com/flyth">flyth</a><br />
Description: This script will announce one of the configured lines every x seconds.
Tested with version: --
</blockquote>
<hr />
<blockquote><h5>Settings</h5></blockquote>
<table>
<tr><th>Setting</th><th>Description</th><th>Values</th></tr>
<tr><td>Ads</td><td>Multiple lines which defines the sent ads. BBCodes are supported!<br />Normally urls starting with <code>http://</code> or <code>https://</code> are automatically converted into a clickable url.</td><td>One ad per line</td></tr>
<tr><td>Interval</td><td>The time in SECONDS between each ad is sent.</td><td>A valid number of seconds</td></tr>
<tr><td>Order</td><td>Either the ads should be sent randomly or line by line.</td><td></td></tr>
<tr><td>Broadcast-Type</td><td>Either the ads should be sent in the server-chat, channel-chat or to each client privatly (not recommended).</td><td></td></tr>
</table>
<br />

<blockquote>
<h4>Bad Channel Names (badchan.js)</h4>
Author: <a href="https://github.com/Raphouphe">Raphraph</a> (raphraph@raphraph.de) & <a href="https://github.com/flyth">flyth</a><br />
Description: This script will remove all channels matching some userdefined names.
Tested with version: SinusBot v0.9.9-6fb4fe2
</blockquote>
<hr />
<blockquote><h5>Settings</h5></blockquote>
<table>
<tr><th>Setting</th><th>Description</th><th>Values</th></tr>
<tr><td>Forbidden channels</td><td>List of forbidden names or regex (one per line).</td><td>One chnnale-name or regex expression per line</td></tr>
<tr><td>Ignored channels</td><td>Comma-separated list of ignored channel-ids.</td><td>Comma-separated list of valid numbers</td></tr>
</table>
<br />

<blockquote>
<h4>Bad Usernames (badusername.js)</h4>
Author: <a href="https://github.com/Raphouphe">Raphraph</a> (raphraph@raphraph.de) & <a href="https://github.com/flyth">flyth</a><br />
Description: This script will remove all channels matching some userdefined names.
Tested with version: --
</blockquote>
<hr />
<blockquote><h5>Settings</h5></blockquote>
<table>
<tr><th>Setting</th><th>Description</th><th>Values</th></tr>
<tr><th>Forbidden names/regex</th><th>The names or regular expressions defining which channel isn't allowed.</th><th>A name or Regular Expression ecach line</th></tr>
<tr><th>Ignored client ids/uuids</th><th>The ids or uuids of the clients which will be ignored by the script.</th><th>A comma seperated list withc ids and uuids</th></tr>
<tr><th>Warn/Kick/Both</th><th>Which action should be performed on the client.</th><th><em>Just select one of the given options.</em></th></tr>
<tr><th>Messages</th><th>The messages sent to the client</th><th>First line: warn message<br />Second line: kick message</th></tr>
<tr><th>Check-delay</th><th>The delay (in seconds) before the name of the client is checked again, and if it\'s a bad name the client get kicked.</th><th>A number</th></tr>
</table>
<br />

<blockquote>
<h4>Greet On Join (greetonojoin.js)</h4>
</blockquote>
<hr />
<blockquote><h5>Settings</h5></blockquote>
<table>
<tr><th>Setting</th><th>Description</th><th>Values</th></tr>
</table>
<br />

<blockquote>
<h4>No Recording (norecording.js)</h4>
</blockquote>
<hr />
<blockquote><h5>Settings</h5></blockquote>
<table>
<tr><th>Setting</th><th>Description</th><th>Values</th></tr>
</table>

<blockquote>
<h4>Keyword Message (keywordmessage.js)</h4>
Author: <a href="https://forum.sinusbot.com/members/am4n.18/">Am4n</a> (am4n.ar@gmail.com) & <a href="https://github.com/Raphouphe">Raphraph</a> (raphraph@raphraph.de)<br />
Description: This script will response to some defined keywords.
Tested with version: SinusBot v0.9.9-6fb4fe2
</blockquote>
<hr />
<blockquote><h5>Settings</h5></blockquote>
<table>
<tr><th>Setting</th><th>Description</th><th>Values</th></tr>
<tr><td>Keyword/Command/Regex: Output</td><td>The combinations of keyword and output. A valid combination is build like this: <code>key: output</code>. <code>key</code> should be replaced either by a word, by multiple words, by a regular expression (using the slash <code>/</code> as seperator) or by a command (starting with a dot). <code>output</code> should be replaced by a message. BBCodes are supported.</td><td>One valid combination each line.</td></tr>
<tr><td>Respond on server-chat.</td><td>If the bot should respond to messages got in the server-chat or not.</td><td><em>Just select one of the given options.</em></td></tr>
<tr><td>Respond on channel-chat.</td><td>If the bot should respond to messages got in the channel-chat or not.</td><td><em>Just select one of the given options.</em></td></tr>
<tr><td>Respond on private-chat.</td><td>If the bot should respond to messages got in the private-chat or not.</td><td><em>Just select one of the given options.</em></td></tr>
</table>
