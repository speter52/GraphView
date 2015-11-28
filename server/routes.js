var path = require('path');
var app = require('./app.js');

app.get('/',function(req, res) {
    res.redirect('runalgorithm');
});

app.get('/graphview',function(req, res) {
    console.log("in graphview");
    res.sendFile(path.resolve('client/graphview.html'));
});

app.get('/graphcreator',function(req, res) {
    res.sendFile(path.resolve('client/graphcreator.html'));
});

app.get('/test',function(req, res) {
    res.sendFile(path.resolve('client/test.html'));
});

// TODO: Ideally the following route would be used to pass parameters to the angular routing module, but
// TODO: having issues with loading the partial templates.
app.get('/*',function(req, res) {
    console.log("going to angular");
    res.sendFile(path.resolve('client/index.html'));
});
