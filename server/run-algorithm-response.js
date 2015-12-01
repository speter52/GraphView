var app = require('./app.js');
var io = app.io;
/**
 * Gets the current date and time as a string used to create the MySQL table where the results are stored.
 * @returns {string}
 */
function getCurrentTime(){
    var currentTime = new Date();

    var algorithmRunName = 'd' + (currentTime.getMonth()+1) +
        currentTime.getDate() +
        currentTime.getFullYear() + 't' +
        currentTime.getHours() +
        currentTime.getMinutes() +
        currentTime.getSeconds();

    return algorithmRunName
}

/**
 * Transform the SQL results array so Dygraphs receives a list of pairs where each pair represents a point.
 * @param sqlResults
 * @returns {Array}
 */
function transformSQLResultsForGraph(sqlResults)
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

        var pathToCore = require('./config/core-info.js');
        var pathToConfigFile = pathToCore + 'config.yml';

        yaml.load(pathToConfigFile, function(result){
            var algorithmRunName = getCurrentTime();

            result.database_table = algorithmRunName;

            var newConfigString = yaml.stringify(result,4);

            fs.writeFile(pathToConfigFile, newConfigString, function(err){
                if(err) console.log("Couldn't write config file.")

                // Read in setup code for node class
                fs.readFile(__dirname + '/AlgorithmSkeleton.txt', "utf-8", function(err, data){
                    if(err) throw err;

                    // Append the user inputted code to the node class
                    var customNodeCode = data.replace(/\r?\n|\r/g,'') + msg + '}';

                    var pathToNodeClass = pathToCore + 'src/com/Network/CustomNode.java';
                    // Write new CustomNode class to file
                    fs.writeFile(pathToNodeClass, customNodeCode, function(err){
                        if(err) throw err;

                        // Build and run the java project
                        var spawn = require('child_process').spawn,
                            buildAndRun = spawn('sh',['build_and_run.sh', 'GraphInputs/Lili-InputGraph.yml'], {cwd:pathToCore});

                        // TODO: Use later to print console output to gui?
                        buildAndRun.stdout.on('data', function (data) {
                            console.log('stdout: ' + data);
                        });

                        // Once the algorithm finishes, pull the results from the database and push it to the client
                        buildAndRun.stdout.on('end', function(){
                            console.log("Algorithm finished.");

                            var connection = require('./config/database-info.js');

                            // Configure later by user
                            var nodeid = 0;
                            var statevariable = "x";

                            var selectStatement = "SELECT IterationNumber, Value FROM " + algorithmRunName +
                                " WHERE (Node=" +nodeid+" and StateVariable='"+statevariable+"') " +
                                "ORDER BY IterationNumber";

                            connection.query(selectStatement, function(err, rows){
                                if(err) console.log("Error in retrieving results from database.");

                                var transformedRows = transformSQLResultsForGraph(rows);

                                io.to(socket.id).emit('runComplete', transformedRows);

                                console.log("Sent results to client.")
                            })
                        })
                    })
                })
            })
        });
    });
});
