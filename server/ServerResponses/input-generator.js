var app = require('./../app.js');
var io = app.io;

/**
 * Use parameters selected by client to build the argument array to run the Input Generator.
 * @param msg
 * @returns {Array}
 */
function buildArgsForInputGenerator(msg){
    var args = [];

    args.push('run_input_generator.sh');
    args.push(msg['numOfNodes']);
    args.push(msg['numOfPartitions']);
    args.push(msg['numOfNeighbors']);

    var stateVariables = msg['stateVariables'];

    for(var i=0; i<stateVariables.length; i++)
    {
        args.push(stateVariables[i])
    }

    return args;
}

/**
 * Use the selected parameters to run the InputGenerator to create an input layout file for the network. Then
 * send the generated YAML to the client.
 */
io.on('connection', function(socket){
    socket.on('createInputFile', function(msg){
        var fs = require("fs");
        var pathToCore = require('./../config/core-info.js');

        fs.readFile(__dirname + '/../CodeTemplates/InputGeneratorTemplate.txt', "utf-8", function(err, data) {
            if (err) throw err;

            var customInputCode = data.replace(/\r?\n|\r/g,'') + msg['stateValueFunction'] + '}';

            var pathToInputClass = pathToCore + 'Tools/InputGenerator/src/NodeDataGenerator.java';

            fs.writeFile(pathToInputClass, customInputCode, function(err) {
                if (err) throw err;

                console.log("Building generator...");

                var inputArgs = buildArgsForInputGenerator(msg);

                var spawn = require('child_process').spawn,
                    buildAndRun = spawn('sh', inputArgs, {cwd:pathToCore});

                buildAndRun.stdout.on('end', function (data) {
                    var pathToInputFile = pathToCore + 'Tools/InputGenerator/GraphInput.yml'

                    // TODO: Try to send input yml directly to client instead of temporarily writing to disk and reading it
                    fs.readFile(pathToInputFile, "utf-8", function(err, data) {
                        if (err) throw err;

                        var time = require('./../current-time.js');
                        var inputResults = {};

                        inputResults['inputName'] = time.getCurrentTime();
                        inputResults['inputFile'] = data;

                        io.to(socket.id).emit('inputGenerated', inputResults);

                        console.log("Sent results to client.")

                        fs.unlink(pathToInputFile, function(err){
                            if(err) throw err;
                        })
                    });
                });
            });
        });
    });
});

io.on('connection', function(socket){
    socket.on('saveInputFile', function(msg){
        console.log("Received input file to save.");

        var fs = require("fs");
        // TODO: Specify absolute path to save in database
        var pathToOutputFolder = __dirname + "/../NetworkLayouts/";

        var fileName = msg['inputName'];

        var pathToFile = pathToOutputFolder + fileName + '.yml';

        var inputFile = msg['inputFile'];

        fs.writeFile(pathToFile, inputFile, function(err){
            if(err) throw err;

            console.log("Wrote file to disk.");

            var connection = require('./../config/database-info.js');

            var createTableStatement = "CREATE TABLE IF NOT EXISTS InputFiles(FileName varchar(255));";

            var insertInputStatement = 'INSERT INTO InputFiles (FileName) VALUES ("' +
                                        fileName + '");';

            connection.query(createTableStatement + insertInputStatement, function(err){
                if (err) throw err;

                console.log("Successfully saved file to database.");
            })
        })
    })
})
