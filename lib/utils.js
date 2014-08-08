var shim = require('./shim');

var forEach = shim.forEach;
var getKeys = shim.getKeys;

module.exports = {
    extend: function (target) {
        var sources = Array.prototype.slice.call(arguments, 1);
        forEach(sources, function (source) {
            forEach(getKeys(source), function (key) {
                target[key] = source[key];
            });
        });
        return target;
    }
};
