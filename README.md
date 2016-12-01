# commandline
Commandline packages simplifies the asynchronous binary execution from Node

# How to install
You can install this module throught git

```
git clone https://github.com/loretoparisi/commandline.git
cd commandline/
npm install
node tests/example
```

or through npm package manager

```
var CommandLine = require('node-commander');
```

# How to use
Define a list of commands by executable name, parameters in a array like

```javascript
var commandItemsArray = [ ['ls','-l','./'], ['ls','-a','./'] ];
```

that is `ls -s ./`, `ls -a ./`.

Create an new `Commandline` instance

```javascript
var cmd = new CommandLine({ 
    debug : true, 
    error : true, 
    delay : false });
```

Run the commands by queueing execution in the `Commandline`

```javascript
cmd.executeCommands(commandItemsArray
, function(results) {
    console.log(results);
}
, function(error) {
    console.log(error);
});
```

# How it works
`Commandline` uses `Promise` and `Promise.all` to queue binaries/script execution, and join each child process when it ends. 

# What can be executed
All binaries that write to or can be piped to `stdout` can be queued.

# Examples
Get now playing track info from Spotify
```
var cmd = new CommandLine({ 
    debug : true, 
    error : true, 
    delay : true });
var commandItemsArray=[
    ['osascript', '-e', 'tell application "Spotify" to player position as string'],
    ['osascript', '-e', 'tell application "Spotify" to artist of current track as string'],
    ['osascript', '-e', 'tell application "Spotify" to name of current track as string']
];
cmd.executeCommands(commandItemsArray
, function(results) {
    console.log(results);
}
, function(error) {
    console.log(error);
});
```

will return

```
[ { data: '119,833000183105',
    exitCode: 0,
    cli: 'osascript -e tell application "Spotify" to player position as string' },
  { data: 'Enforcer',
    exitCode: 0,
    cli: 'osascript -e tell application "Spotify" to artist of current track as string' },
  { data: 'Midnight Vice',
    exitCode: 0,
    cli: 'osascript -e tell application "Spotify" to name of current track as string' } ]
```
