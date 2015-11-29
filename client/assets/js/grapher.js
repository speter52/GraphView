document.getElementById('runButton').onclick = sendCode;

function sendCode(){
    // TODO: Figure out how to properly blur button?
    this.blur();
    // TODO: Create and destroy ball instead of hiding and unhiding
    document.getElementById('ball').style.display = 'block';
    document.getElementById('output-graph').style.display = 'none';
    socket.emit('runAlgorithm', editor.getValue())
}

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
