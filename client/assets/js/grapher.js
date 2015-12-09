document.getElementById('runButton').onclick = sendCode;

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

/**
 * Use the algorithm results to generate a DyGraph. Remove the ball animation.
 */
socket.on('runComplete', function(msg){
    /*
    document.getElementById('ball').style.display = 'none';
    document.getElementById('output-graph').style.display = 'block';
    */
    console.log("algorithm complete");


    g = new Dygraph(
        // containing div
        document.getElementById("output-graph"),

        msg
        ,
        {
            labels: ['Iteration Number', 'State Value'],
            xlabel: 'Iteration Number',
            ylabel: 'State Value',
            title: 'Algorithm Consensus',
            animatedZooms : true,
        }
    );
});

socket.on('consoleOutput', function(msg){
    var consoleOutputBox = document.getElementById('console-output');

    consoleOutputBox.scrollTop = consoleOutputBox.scrollHeight;
    consoleOutputBox.value += msg;


    document.getElementById('ball').style.display = 'none';
    document.getElementById('console-output').style.display = 'block';

    consoleOutputBox.scrollTop = consoleOutputBox.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
})
