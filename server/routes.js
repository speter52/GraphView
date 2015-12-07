var path = require('path');
var app = require('./app.js');

app.get('/',function(req, res) {
    res.redirect('runalgorithm');
});

app.get('/*',function(req, res) {
    res.sendFile(path.resolve('client/index.html'));
});
