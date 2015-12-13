var app = require('./../app.js');
var io = app.io;

/**
 * Transform the SQL results array so Dygraphs receives a list of pairs where each pair represents a point.
 * @param sqlResults
 * @returns {Array}
 */
function transformRunResultsForClient(sqlResults)
{
    var transformedRows = [];
    // TODO: Perhaps push off transforming to client? Not sure if I'd be revealing too much of the db schema
    for(var i = 0; i < sqlResults.length; i++)
    {
        var iterationNumber = sqlResults[i].IterationNumber;
        var stateValue = sqlResults[i].Value;
        transformedRows.push([iterationNumber, stateValue]);
    }

    return transformedRows;
}

/**
 * Upon receiving the user-inputed algorithm, the server compiles the code against the GraphSim project. If it
 * compiles, the project is run until all the iterations are complete, after which the results are pushed to
 * the MySQL database. Then the server pull the results from the database and pushed it to the client.
 */
io.on('connection', function(socket){
    socket.on('runAlgorithm', function(msg){
        var fs = require("fs");
        var yaml = require('yamljs');
        var time = require('./../current-time.js');

        var pathToCore = require('./../config/core-info.js');
        var pathToConfigFile = pathToCore + 'config.yml';

        yaml.load(pathToConfigFile, function(result){

            var algorithmRunName = msg['RunName'];

            result.database_table = algorithmRunName;

            var newConfigString = yaml.stringify(result,4);

            fs.writeFile(pathToConfigFile, newConfigString, function(err){
                if(err) console.log("Couldn't write config file.")

                // Read in setup code for node class
                fs.readFile(__dirname + '/../CodeTemplates/AlgorithmTemplate.txt', "utf-8", function(err, data){
                    if(err) throw err;

                    // Append the user inputted code to the node class
                    var customNodeCode = data.replace(/\r?\n|\r/g,'') + msg['CustomNodeCode'] + '}';

                    var pathToNodeClass = pathToCore + 'src/com/Network/CustomNode.java';
                    // Write new CustomNode class to file
                    fs.writeFile(pathToNodeClass, customNodeCode, function(err){
                        if(err) throw err;

                        var inputFilePath = __dirname + '/../NetworkLayouts/' + msg['InputLayout'] + '.yml';

                        // Build and run the java project
                        var spawn = require('child_process').spawn,
                            buildAndRun = spawn('sh',['build_and_run.sh', inputFilePath, msg['NumberOfIterations']],
                                                {cwd:pathToCore});

                        var stdout = '';
                        // TODO: Use later to print console output to gui?
                        buildAndRun.stdout.on('data', function (data) {
                            console.log('stdout: ' + data);

                            stdout += data;
                        });

                        buildAndRun.stdout.on('end', function(){
                            io.to(socket.id).emit('consoleOutput', stdout);
                        })

                        /*
                        // Once the algorithm finishes, pull the results from the database and push it to the client
                        buildAndRun.stdout.on('end', function(){
                            console.log("Algorithm finished.");

                            var connection = require('./config/database-info.js');

                            // Configure later by user
                            var nodeid = 0;
                            var statevariable = "x";

                            // TODO: Use SQL builder library for SQL commands
                            var selectStatement = 'SELECT IterationNumber, Value FROM RunResults' +
                                ' WHERE (RunName="' + algorithmRunName + '"  AND Node=' +nodeid+' AND StateVariable="'+statevariable+'") ' +
                                'ORDER BY IterationNumber';

                            connection.query(selectStatement, function(err, rows){
                                if(err) throw err;

                                var transformedRows = transformRunResultsForClient(rows);

                                io.to(socket.id).emit('runComplete', transformedRows);

                                console.log("Sent run results to client.")
                            })
                        })
                        */
                    })
                })
            })
        });
    });
});


io.on('connection', function(socket){
    socket.on('getNetworkLayouts', function(msg){
        var connection = require('./../config/database-info.js');

        var selectStatement = "SELECT FileName FROM InputFiles;"

        connection.query(selectStatement, function(err, rows){
            if(err) throw err;

            var transformedInputList = [];

            for(var i = 0; i< rows.length; i++)
            {
                transformedInputList.push(rows[i].FileName);
            }

            io.to(socket.id).emit('sentNetworkLayouts', transformedInputList);

            console.log("Sent network layouts to client.")
        })
    });
});
