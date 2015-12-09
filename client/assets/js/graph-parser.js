socket.emit('getAlgorithmRuns', 'request');
document.getElementById('algorithm-runs').onchange = getNodes;
document.getElementById('nodes').onchange = getStateVariables;
document.getElementById('createGraphButton').onclick = getRunResults;

socket.on('sentAlgorithmRuns', function(msg){
    var algorithmRunBox = document.getElementById('algorithm-runs');

    // TODO: Temporary, move this logic into controller for page
    algorithmRunBox.innerHTML = '';

    for(var i = 0; i < msg.length; i++)
    {
        var option = document.createElement('option');

        option.text = option.value = msg[i];

        algorithmRunBox.appendChild(option);
    }
})

function getSelectedOptions(selectElement){
    var selected = [];

    var options = selectElement.options;

    for(var i = 0; i < options.length; i++)
    {
        if(options[i].selected) selected.push(options[i].value);
    }

    return selected;
}

function getNodes(){
    var algorithmRunBox = document.getElementById('algorithm-runs');

    var runsSelected = getSelectedOptions(algorithmRunBox);

    if(runsSelected == 0)
    {
        var nodesBox = document.getElementById('nodes');

        // TODO: Better way to reset box?
        nodesBox.innerHTML = '';
    }
    else
    {
        socket.emit('getNodes', runsSelected);
    }
}

socket.on('sentNodes', function(msg){
    var nodesBox = document.getElementById('nodes');

    nodesBox.innerHTML = '';

    for(var i = 0; i < msg.length; i++)
    {
        var option = document.createElement('option');

        var nodeEntry = msg[i];

        option.text = nodeEntry.Node + ' - ' + nodeEntry.RunName;

        option.value = JSON.stringify(nodeEntry);

        nodesBox.appendChild(option);
    }
})

function getStateVariables(){
    var nodesBox = document.getElementById('nodes');

    var nodesSelected = getSelectedOptions(nodesBox);

    if(nodesSelected == 0)
    {
        var stateVariablesBox = document.getElementById('state-variables');

        // TODO: Better way to reset box?
        stateVariablesBox.innerHTML = '';
    }
    else
    {
        socket.emit('getStateVariables', nodesSelected);
    }
}

socket.on('sentStateVariables', function(msg){
    var stateVariablesBox = document.getElementById('state-variables');

    stateVariablesBox.innerHTML = '';

    for(var i = 0; i < msg.length; i++)
    {
        var option = document.createElement('option');

        var stateVariableEntry = msg[i];

        option.text = stateVariableEntry.StateVariable + ' - ' + stateVariableEntry.Node +
                        ' - ' + stateVariableEntry.RunName;

        // TODO: Pull parameters from individual boxes instead of storing JSON in value field?
        option.value = JSON.stringify(stateVariableEntry);

        stateVariablesBox.appendChild(option);
    }
})

function getRunResults(){
    this.blur();

    var stateVarsBox = document.getElementById('state-variables');

    var stateVarsSelected = getSelectedOptions(stateVarsBox);

    socket.emit('getRunResults', stateVarsSelected);
}

socket.on('sentRunResults', function(msg){

    g = new Dygraph(
        // containing div
        document.getElementById("output-graph"),

        msg['data']
        ,
        {
            labels: msg['labels'],
            xlabel: 'Iteration Number',
            ylabel: 'State Value',
            title: 'Algorithm Performance',
            animatedZooms : true
        }
    );

    window.scrollTo(0, document.body.scrollHeight);
})
