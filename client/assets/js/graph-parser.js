socket.emit('getAlgorithmRuns', 'request');
document.getElementById('algorithm-runs').onchange = getStateVariables;

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

function getStateVariables(){
    var algorithmRunBox = document.getElementById('algorithm-runs');

    var runsSelected = getSelectedOptions(algorithmRunBox);

    socket.emit('getStateVariables', runsSelected);
}

socket.on('sentStateVariables', function(msg){
    var stateVariableBox = document.getElementById('state-variables');

    stateVariableBox.innerHTML = '';

    for(var i = 0; i < msg.length; i++)
    {
        var option = document.createElement('option');

        var stateVariable = msg[i];

        option.text = stateVariable.StateVariable + '-' + stateVariable.RunName;

        option.value = JSON.stringify(stateVariable);

        stateVariableBox.appendChild(option);
    }
})