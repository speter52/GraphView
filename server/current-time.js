var exports = module.exports;

/**
 * Gets the current date and time as a string used to create the MySQL table where the results are stored.
 * @returns {string}
 */
exports.getCurrentTime = function(){
    var currentTime = new Date();

    var algorithmRunName = 'd' + (currentTime.getMonth()+1) +
        currentTime.getDate() +
        currentTime.getFullYear() + 't' +
        currentTime.getHours() +
        currentTime.getMinutes() +
        currentTime.getSeconds();

    return algorithmRunName
}

