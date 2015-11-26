var path = require('path');
var app = require('./app.js');

app.get('/graphview',function(req, res) {
    res.sendFile(path.resolve('client/graphview.html'));
});

app.get('/graphcreator',function(req, res) {
    res.sendFile(path.resolve('client/graphcreator.html'));
});

// TODO: Ideally the following route would be used to pass parameters to the angular routing module, but
// TODO: having issues with loading the partial templates.
app.get('/*',function(req, res) {
    res.sendFile(path.resolve('client/index.html'));
});
