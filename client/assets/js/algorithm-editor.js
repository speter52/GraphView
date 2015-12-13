socket.emit('getNetworkLayouts','request');
document.getElementById('runButton').onclick = sendCode;
document.getElementById('run-name').value = getCurrentTime();

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

socket.on('sentNetworkLayouts', function(msg){
    var layoutDropdown = document.getElementById('layout-dropdown');

    // TODO: Temporary, move this logic into controller for page
    layoutDropdown.innerHTML = '';

    for(var i = 0; i < msg.length; i++)
    {
        var option = document.createElement('option');

        option.text = option.value = msg[i];

        layoutDropdown.appendChild(option);
    }
})

/**
 * Grab value of input algorithm from code box and send to server. Then load the ball animation.
 */
function sendCode(){
    // TODO: Figure out how to properly blur button?
    this.blur();
    // TODO: Create and destroy ball instead of hiding and unhiding
    document.getElementById('output-panel').style.display = 'block';
    document.getElementById('ball').style.display = 'block';
    window.scrollTo(0, document.body.scrollHeight);
    document.getElementById('console-output').style.display = 'none';
    document.getElementById('console-output').value = '';

    var algorithmParameters = {};

    var layoutDropdown = document.getElementById('layout-dropdown');
    algorithmParameters['InputLayout'] = layoutDropdown.options[layoutDropdown.selectedIndex].value;

    var numOfPartitions = document.getElementById('numOfIterations').value;
    algorithmParameters['NumberOfIterations'] = numOfPartitions;

    algorithmParameters['CustomNodeCode'] = editor.getValue();

    algorithmParameters['RunName'] = document.getElementById('run-name').value;

    socket.emit('runAlgorithm', algorithmParameters)
}

socket.on('consoleOutput', function(msg){
    var consoleOutputBox = document.getElementById('console-output');

    consoleOutputBox.scrollTop = consoleOutputBox.scrollHeight;
    consoleOutputBox.value = '';
    consoleOutputBox.value += msg;


    document.getElementById('ball').style.display = 'none';
    document.getElementById('console-output').style.display = 'block';

    consoleOutputBox.scrollTop = consoleOutputBox.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
})
