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
    socket.on('getStateVariables', function(msg){
        var runsSelected = msg;

        // TODO: TEMPORARY MESSY
        var getStateVarStatement = "SELECT DISTINCT RunName,StateVariable FROM RunResults WHERE ;";

        for(var i = 0; i < runsSelected.length; i++)
        {
            getStateVarStatement = getStateVarStatement.slice(0, -1);

            if(i > 0) getStateVarStatement += " OR ";

            getStateVarStatement += 'RunName="' + runsSelected[i] +'";';
        }

        connection.query(getStateVarStatement, function(err, stateVariableResults){
            if(err) throw err;

            console.log(stateVariableResults);
            io.to(socket.id).emit('sentStateVariables', stateVariableResults);
        })
    })
})
