var app = require('./app.js');
var io = app.io;

io.on('connection', function(socket){
    socket.on('createInputFile', function(msg){
        var fs = require("fs");
        var pathToCore = require('./config/core-info.js');

        fs.readFile(__dirname + '/InputGeneratorSkeleton.txt', "utf-8", function(err, data) {
            if (err) throw err;

            var customInputCode = data.replace(/\r?\n|\r/g,'') + msg['stateValueFunction'] + '}';

            var pathToInputClass = pathToCore + 'Tools/InputGenerator/NodeDataGenerator.java';

            fs.writeFile(pathToInputClass, customInputCode, function(err) {
                if (err) throw err;

                console.log("Building generator.");

                var args = [];

                args.push('run_input_generator.sh');
                args.push(msg['numOfNodes']);
                args.push(msg['numOfPartitions']);
                args.push(msg['numOfNeighbors']);

                var stateVariables = msg['stateVariables'];

                for(i=0; i<stateVariables.length; i++)
                {
                    args.push(stateVariables[i])
                }

                var spawn = require('child_process').spawn,
                    buildAndRun = spawn('sh', args, {cwd:pathToCore});


                buildAndRun.stdout.on('end', function (data) {
                    var pathToInputFile = pathToCore + 'Tools/InputGenerator/GraphInput.yml'

                    fs.readFile(pathToInputFile, "utf-8", function(err, data) {
                        if (err) throw err;

                        io.to(socket.id).emit('inputGenerated', data);

                        console.log("Sent results to client.")
                    });
                });
            });
        });
    });
});
