socket.emit('getNetworkLayouts','request');

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
