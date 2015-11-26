var app = require('./app.js');
var io = app.io;

/**
 * Upon receiving the user-inputed algorithm, the server compiles the code against the GraphSim project. If it
 * compiles, the project is run until all the iterations are complete, after which the results are pushed to
 * the MySQL database. Then the server pull the results from the database and pushed it to the client.
 */
io.on('connection', function(socket){
    socket.on('runAlgorithm', function(msg){
        var fs = require("fs");

        // Read in setup code for node class
        fs.readFile(__dirname + '/AlgorithmSkeleton.txt', "utf-8", function(err, data){
            if(err) throw err;

            // Append the user inputted code to the node class
            var customNodeCode = data.replace(/\r?\n|\r/g,'') + msg + '}';

            var pathToProject = '/home/speter-toshiba/Data/CS/cs499-Thesis/SeniorThesis/';
            var pathToNodeClass = pathToProject + 'src/com/Network/CustomNode.java';

            // Delete the old node file and write the latest one
            fs.unlink(pathToNodeClass, function(err){
                if(err) console.log("Couldn't delete Custom Node file.");

                fs.writeFile(pathToNodeClass, customNodeCode, function(err){
                    if(err) throw err;

                    // Build and run the java project
                    var spawn = require('child_process').spawn,
                        buildAndRun = spawn('sh',['build_and_run.sh', 'GraphInputs/Lili-InputGraph.yml'], {cwd:pathToProject});

                    // TODO: Use later to print console output to gui?
                    buildAndRun.stdout.on('data', function (data) {
                        console.log('stdout: ' + data);
                    });

                    // Once the algorithm finishes, pull the results from the database and push it to the client
                    buildAndRun.stdout.on('end', function(){
                        console.log("Algorithm finished.");

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
