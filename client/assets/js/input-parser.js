document.getElementById('generateButton').onclick = sendParameters;
document.getElementById('saveButton').onclick = sendInputToSave;

/**
 * Grab input parameters from web page and send them to server to generate input file.
 */
function sendParameters(){
    this.blur();

    document.getElementById('codebox').style.display = "none";
    document.getElementById('flipper').style.display = "block";

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

/**
 * Display input file in code box and enable save file fields.
 */
socket.on('inputGenerated', function(msg){
    document.getElementById('flipper').style.display = "none";
    document.getElementById('codebox').style.display = "block";

    inputFileEditor.setValue(msg['inputFile']);

    var fileNameInput = document.getElementById('input-name');
    var fileNameFields = document.getElementById('save-input-fields');

    fileNameInput.value = msg['inputName'];
    fileNameFields.disabled = false;
});

/**
 * Send edited input file and updated file name to server to save.
 */
function sendInputToSave(){
    this.blur();

    var fileNameInput = document.getElementById('input-name');

    var savedInput = {};

    savedInput['inputName'] = fileNameInput.value;
    savedInput['inputFile'] = inputFileEditor.getValue();

    socket.emit('saveInputFile', savedInput);
}
