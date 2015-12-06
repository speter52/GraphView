var mysql = require('mysql');

// Replace with the appropriate credentials for MySQL
var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'java',
  password: 'password',
  database: 'StateValues',
  multipleStatements: true
});

module.exports = connection;
