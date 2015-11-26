var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');

var app = express();

/////////////Inserted
var debug = require('debug')('GraphView:server');
var http = require('http');

var port = '3000'
app.set('port', port);

var server = http.createServer(app);

var io = require('socket.io').listen(server);

server.listen(port);
//server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
///////////Inserted ^^^

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /assets
//app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));

console.log(__dirname)

app.use('*', routes);

var fs = require("fs");

io.on('connection', function(socket){
  socket.on('runAlgorithm', function(msg){
    fs.readFile(__dirname + '/AlgorithmSkeleton.txt', "utf-8", function(err, data){
      if(err) throw err;

      var customNodeCode = data.replace(/\r?\n|\r/g,'') + msg + '}';

      var pathToProject = '/home/speter-toshiba/Data/CS/cs499-Thesis/SeniorThesis/';
      var pathToNodeClass = pathToProject + 'src/com/Network/CustomNode.java';

      fs.unlink(pathToNodeClass, function(err){
        if(err) console.log("Couldn't delete Custom Node file.");

        fs.writeFile(pathToNodeClass, customNodeCode, function(err){
          if(err) throw err;

          var spawn = require('child_process').spawn,
              buildAndRun = spawn('sh',['build_and_run.sh', 'GraphInputs/Lili-InputGraph.yml'], {cwd:pathToProject});

          // Use later to print console output to gui?
          buildAndRun.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
          });

          buildAndRun.stdout.on('end', function(){
            console.log("Received end");

            var connection = require('./database.js');

            connection.query("SELECT * FROM StateValues ORDER BY IterationNumber", function(err, rows){
              var transformedRows = [];
              // TODO: Perhaps push off transforming to client? Not sure if I'd be revealing too much of the db schema
              for(var i = 0; i < rows.length; i++)
              {
                var iterationNumber = rows[i].IterationNumber;
                var stateValue = rows[i].Val;
                transformedRows.push([iterationNumber, stateValue]);
              }

              io.to(socket.id).emit('runComplete', transformedRows);
            })
          })
        })
      })
    })
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
