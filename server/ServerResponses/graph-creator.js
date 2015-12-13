var app = require('./../app.js');
var io = app.io;
var connection = require('./../config/database-info.js');

/**
 * Return list of algorithm runs to client.
 */
io.on('connection', function(socket){
    socket.on('getAlgorithmRuns', function(msg){
        var getAlgRunsStatement = "SELECT DISTINCT RunName FROM RunResults;";

        connection.query(getAlgRunsStatement, function(err, rows){
            if(err)
            {
                console.log("RunResults table doesn't exist.");

                return;
            }

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
/**
 * Return list of nodes for the selected algorithm runs to the client.
 */
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

/**
 * Return a formatted string given State Variable, Node ID, and the Run Name.
 */
function createLabel(stateVariable, nodeID, runName)
{
    return stateVariable + ' - ' + nodeID + ' - ' + runName;
}

/**
 * Return list of state variables for all the selected nodes to the client.
 */
io.on('connection', function(socket){
    socket.on('getStateVariables', function(msg){
        var getStateVarsStatement = "SELECT DISTINCT RunName,Node,StateVariable FROM RunResults WHERE ;";

        for(var i = 0; i < msg.length; i++)
        {
            var nodeEntry = JSON.parse(msg[i]);

            getStateVarsStatement = getStateVarsStatement.slice(0, -1);

            if(i > 0) getStateVarsStatement += " OR ";

            var currentWhere = '(RunName = "' + nodeEntry.RunName + '" AND Node=' + nodeEntry.Node + ')';

            getStateVarsStatement += currentWhere + ";";
        }

        connection.query(getStateVarsStatement, function(err, stateVarsResults){
            if(err) throw err;

            io.to(socket.id).emit('sentStateVariables', stateVarsResults);
        })
    })
})

/**
 * Transform the SQL Run Results to 2-dimensional array that can be processed by DyGraphs. The first column represents
 * the values of the x-axis (Iteration Number), and the following columns represent the data from different nodes.
 * While transforming the results, the list of labels for the data is also created.
 * @returns {{data: Array, labels: *[]}}
 */
function getRowsAndLabelsForGraph(sqlRunResults){
    var transformedRunResults = [];

    var currentColumn = 1;
    var currentRow = 0;
    // TODO: Make sure client doesn't send non-null results; better way to initialize for loop?
    var currentEntryName = createLabel(sqlRunResults[0].StateVariable, sqlRunResults[0].Node, sqlRunResults[0].RunName);

    var labels = ["Iteration Number", currentEntryName];

    for(var i = 0; i < sqlRunResults.length; i++)
    {
        var currentResult = sqlRunResults[i];

        var latestEntryName = createLabel(currentResult.StateVariable, currentResult.Node, currentResult.RunName);

        if(currentEntryName != latestEntryName)
        {
            currentRow = 0;

            currentColumn++;

            currentEntryName = latestEntryName;

            labels.push(currentEntryName);
        }

        // TODO: Figure out logic for data sets of different sizes
        if(currentColumn == 1 ) transformedRunResults.push([currentRow]);

        transformedRunResults[currentRow].push(currentResult.Value);

        currentRow++;
    }

    return {'labels': labels, 'data': transformedRunResults};
}


/**
 * Return the data for the selected runs to the client for graphing.
 */
io.on('connection', function(socket){
    socket.on('getRunResults', function(msg){
        var getRunResultsStatement = "SELECT * FROM RunResults WHERE ";

        for(var i = 0; i < msg.length; i++)
        {
           var stateVarEntry = JSON.parse(msg[i]);


           if(i > 0) getRunResultsStatement += " OR ";

           var currentWhere = '(RunName = "' + stateVarEntry.RunName + '" AND Node = ' + stateVarEntry.Node +
                                ' AND StateVariable = "' +stateVarEntry.StateVariable +'")';

           getRunResultsStatement += currentWhere;
        }

        getRunResultsStatement += "ORDER BY RunName, Node, StateVariable, IterationNumber;";

        connection.query(getRunResultsStatement, function(err, runResults)
        {
            if(err) throw err;

            var transformedRunResults = getRowsAndLabelsForGraph(runResults);

            var resultsToGraph = {}

            resultsToGraph['labels'] = transformedRunResults.labels;

            resultsToGraph['data'] = transformedRunResults.data;

            io.to(socket.id).emit('sentRunResults', resultsToGraph);
        })
    })
})
