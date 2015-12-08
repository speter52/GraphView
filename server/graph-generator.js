var app = require('./app.js');
var io = app.io;
var connection = require('./config/database-info.js');

io.on('connection', function(socket){
    socket.on('getAlgorithmRuns', function(msg){
        var getAlgRunsStatement = "SELECT DISTINCT RunName FROM RunResults;";

        connection.query(getAlgRunsStatement, function(err, rows){
            if(err) throw err;

            var transformedAlgorithmRuns = [];

            for(var i = 0; i < rows.length; i++)
            {
                transformedAlgorithmRuns.push(rows[i].RunName);
            }

            io.to(socket.id).emit('sentAlgorithmRuns', transformedAlgorithmRuns);
        })
    })
})

//TODO: Use SQL Builder library
io.on('connection', function(socket){
    socket.on('getNodes', function(msg){
        var runsSelected = msg;

        var getNodesStatement = "SELECT DISTINCT RunName,Node FROM RunResults WHERE ;";

        for(var i = 0; i < runsSelected.length; i++)
        {
            getNodesStatement = getNodesStatement.slice(0, -1);

            if(i > 0) getNodesStatement += " OR ";

            getNodesStatement += 'RunName="' + runsSelected[i] +'";';
        }

        connection.query(getNodesStatement, function(err, nodesResults){
            if(err) throw err;

            io.to(socket.id).emit('sentNodes', nodesResults);
        })
    })
})

io.on('connection', function(socket){
    socket.on('getStateVariables', function(msg){
        var getStateVarsStatement = "SELECT DISTINCT RunName,Node,StateVariable FROM RunResults WHERE ;";

        for(var i = 0; i < msg.length; i++)
        {
            var nodeEntry = JSON.parse(msg[i]);

            getStateVarsStatement = getStateVarsStatement.slice(0, -1);

            if(i > 0) getStateVarsStatement += " OR ";

            var currentWhere = '(RunName = "' + nodeEntry.RunName + '" AND Node=' + nodeEntry.Node + ')';

            getStateVarsStatement += currentWhere +';';
        }

        connection.query(getStateVarsStatement, function(err, stateVarsResults){
            if(err) throw err;

            io.to(socket.id).emit('sentStateVariables', stateVarsResults);
        })
    })
})

io.on('connection', function(socket){
    socket.on('getRunResults', function(msg){
        var getRunResultsStatement = "SELECT * FROM RunResults WHERE ;";

        for(var i = 0; i < msg.length; i++)
        {
           var stateVarEntry = JSON.parse(msg[i]);

           getRunResultsStatement = getRunResultsStatement.slice(0, -1);

           if(i > 0) getRunResultsStatement += " OR ";

           var currentWhere = '(RunName = "' + stateVarEntry.RunName + '" AND Node = ' + stateVarEntry.Node +
                                ' AND StateVariable = "' +stateVarEntry.StateVariable +'")';

           getRunResultsStatement += currentWhere +';';
        }

        connection.query(getRunResultsStatement, function(err, runResults)
        {
            if(err) throw err;

            var transformedRunResults = [];

            var currentColumn = 1;
            var currentRow = 0;
            // TODO: Make sure client doesn't send non-null results; better way to initialize for loop?
            var currentRunName = runResults[0].RunName;

            var labels = ["Iteration Number", currentRunName];

            for(var i = 0; i < runResults.length; i++)
            {
                var currentResult = runResults[i];

                if(currentRunName != currentResult.RunName)
                {
                    currentRow = 0;

                    currentColumn++;

                    currentRunName = currentResult.RunName;

                    labels.push(currentRunName);
                }

                // TODO: Figure out logic for data sets of different sizes
                if(currentColumn == 1 || currentRow ) transformedRunResults.push([currentRow]);

                transformedRunResults[currentRow].push(currentResult.Value);

                currentRow++;
            }

            var resultsToGraph = {}

            resultsToGraph['labels'] = labels;

            resultsToGraph['data'] = transformedRunResults;

            io.to(socket.id).emit('sentRunResults', resultsToGraph);
        })
    })
})
