/**
* Node Commandline
* @author Loreto Parisi (loreto at gmail dot com)
* @2015-2016 Loreto Parisi
*/
(function() {

  var CommandLine;
  CommandLine = (function() {

    var cp = require('child_process');

    /**
     * Command line helper module
     * This module is standalone
     */
    function CommandLine(options,logger) {
      var self=this;

      // defaults
      this._options = {
        // true to debug
        debug : false,
        // true to show errors
        error : false,
        // true to use delays
        delay : false
      };

      // override defaults
      for (var attrname in options) { this._options[attrname] = options[attrname]; }

      /**
       * Wrappar around Promise.all
       */
      this.PromiseAll = function(items, block, done, fail, waitTimes) {
        var self=this;
        var promises = [], index=0;
        items.forEach(function(item) {
          promises.push( function(item,i) {
              return new Promise(function(resolve, reject) {
                if(block) {
                  if(waitTimes&&i<waitTimes.length+1) {
                    console.log("sleep %d for %d", i, waitTimes[i-1])
                    self.sleep(waitTimes[i-1], function() { // index starts from 1
                      block.apply(this,[item,index,resolve,reject]);
                    })
                  }
                  else block.apply(this,[item,index,resolve,reject]);
                }
              });
            }(item,++index))
        });
        Promise.all(promises).then(function AcceptHandler(results) {
          if(done) done( results );
        }, function ErrorHandler(error) {
          if(fail) fail( error );
        });
      } //promiseAll

      /**
       * Create random array of lenght based on function map
       * @param num the number or items
       */
      this.arrayRangeMap = function(a,block){c=[];while(a--) c[a]=block() ; return c}, //length,map

      /**
       * Returns a random number between min (inclusive) and max (exclusive)
       */
       this.getRandomArbitrary = function(min, max, fixed) {
          fixed=fixed=10;
          return (Math.random() * (max - min) + min).toFixed(fixed);
      }

      /**
       * Sleep for time [msec]
       * @param block Block Delayed block
       * @usage
          sleep( 5 * 1000, function() {
            // executes after 5 seconds, and blocks the (main) thread
          });
       */
      this.sleep = function(time, block) {
        var stop = new Date().getTime();
        while(new Date().getTime() < stop + time) {
            ;
        }
        block();
      }

    }

    /**
     * Execute a list of commands
     * @param commands Array of command array of of command, options, arguments
     * @example [ ['ls','-l','./'], ['ls', '-a', './'] ]
     * @param resolve Block success block
     * @param reject Block rejection block
     */
    CommandLine.prototype.executeCommands = function(commands, resolve, reject) {
      var self=this;
      resolve = resolve || function(results) {};
      reject = reject || function(error) {};

      var waitTimes=self.arrayRangeMap(commands.length,function() {
        // random float between 1 and 3, 3 fix msec
        return self.getRandomArbitrary(0.1,0.3,3) * 1000;
      });
      /**
       * Execution block handler
       */
      var ExecutionBlock = function(item, index, _resolve, _reject) {

        var executable = item[0]; // first elem is command
        var cli = item.join(' ');
        var options = item.splice(1,item.length);

        if(self._options.debug) {
          console.log( item );
          console.log( executable, options.join(' ') );
        }

        var data = { data : new Buffer("",'utf-8') };
        // LP: now spawn the power!
        var child = cp.spawn(executable, options);
        // Listen for an exit event:
        child.on('exit', function(exitCode) {
          data.exitCode=exitCode;
        });
        child.on('close', function(exitCode) {
          return _resolve( data );
        });
        // Listen for stdout data
        child.stdout.on('data', function(_data) {
          if(self._options.debug) {
            console.log( ( new Buffer(_data)).toString() );
          }
          // set buffer
          data.data=_data.toString('utf-8').replace(/\n/,'');
          data.cli=cli;
        });
        // child error
        child.stderr.on('data',
            function(data) {
              if(self._options.error) {
                console.log('err data: ' + data);
              }
              // on error, kill this child
              child.kill();
              return _reject(new Error(data.toString()));
            }
        );

      } //ExecutionBlock
      self.PromiseAll(commands
        , function(item, index, _resolve, _reject) {
          ExecutionBlock(item, index, _resolve, _reject);
        }
        , function(results) { // aggregated results
          // all execution done here. The process exitCodes will be returned
            // array index is the index of the processed that exited
            return resolve(results);
          }
        , function(error) { // error
            return reject(error);
        }, (self._options.delay?waitTimes:null) );

    } //executeCommands

    return CommandLine;

  })();

  module.exports = CommandLine;

}).call(this);
