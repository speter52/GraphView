var app = require('./../app.js');
var io = app.io;

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
                    })
                })
            })
        });
    });
});

// TODO: Move to controller?
/**
 * Send the list of network layout files to the client.
 */
io.on('connection', function(socket){
    socket.on('getNetworkLayouts', function(msg){
        var connection = require('./../config/database-info.js');

        var selectStatement = "SELECT FileName FROM InputFiles;"

        connection.query(selectStatement, function(err, rows){
            if(err)
            {
                console.log("No input files in database.");

                return;
            }

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
