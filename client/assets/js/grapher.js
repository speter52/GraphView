document.getElementById('runButton').onclick = sendCode;

/**
 * Grab value of input algorithm from code box and send to server. Then load the ball animation.
 */
function sendCode(){
    // TODO: Figure out how to properly blur button?
    this.blur();
    // TODO: Create and destroy ball instead of hiding and unhiding
    document.getElementById('ball').style.display = 'block';
    document.getElementById('output-graph').style.display = 'none';
    socket.emit('runAlgorithm', editor.getValue())
}

/**
 * Use the algorithm results to generate a DyGraph. Remove the ball animation.
 */
socket.on('runComplete', function(msg){
    document.getElementById('ball').style.display = 'none';
    document.getElementById('output-graph').style.display = 'block';
    console.log("algorithm complete");

    g = new Dygraph(
        // containing div
        document.getElementById("output-graph"),

        msg,
        {
            labels: ['Iteration Number', 'State Value'],
            xlabel: 'Iteration Number',
            ylabel: 'State Value',
            title: 'Algorithm Consensus',
            animatedZooms : true
        }

    );
});
