/**
* Node Commandline
* @author Loreto Parisi (loreto at gmail dot com)
* @2015-2016 Loreto Parisi
*/
(function() {

var CommandLine
    , cmd
    , commandItemsArray;

CommandLine = require('../lib/index');

cmd = new CommandLine({ 
    debug : true, 
    error : true, 
    delay : true });

commandItemsArray=[
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

// commandItemsArray is a list of commands list, command options, command arguments
commandItemsArray = [ ['ls','-l','./'], ['ls','-a','./'] ];
cmd.executeCommands( commandItemsArray
, function(results) {
    console.log( results );
}
, function(error) {
    console.log( error );
});



}).call(this);