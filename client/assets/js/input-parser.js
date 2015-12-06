document.getElementById('generateButton').onclick = sendParameters;

/**
 * Grab input parameters from web page and send them to server to generate input file.
 */
function sendParameters(){
    this.blur();

    var numOfNodes = document.getElementById('numOfNodes').value;
    var numOfPartitions = document.getElementById('numOfPartitions').value;
    var numOfNeighbors = document.getElementById('numOfNeighbors').value;

    var stateVariables = document.getElementById('stateVariables').value;
    var stateVariables = stateVariables.split(",");

    var stateValueFunction = valueFunctionEditor.getValue();

    var inputParameters = {};

    inputParameters["numOfNodes"] = numOfNodes;
    inputParameters["numOfPartitions"] = numOfPartitions;
    inputParameters["numOfNeighbors"] = numOfNeighbors;
    inputParameters["stateVariables"] = stateVariables;
    inputParameters["stateValueFunction"] = stateValueFunction;

    socket.emit('createInputFile', inputParameters);
}

socket.on('inputGenerated', function(msg){
    inputFileEditor.setValue(msg);
});
