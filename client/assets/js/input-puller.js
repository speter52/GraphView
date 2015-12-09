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


socket.emit('getNetworkLayouts','request');

document.getElementById('run-name').value = getCurrentTime();

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
