var shim = require('./shim-es4');

var prototypes = {
    forEach: Array.prototype.forEach,
    map: Array.prototype.map,
    filter: Array.prototype.filter
};

function createShimMethod(key) {
    shim[key] = function (obj) {
        var args = Array.prototype.slice.call(arguments, 1);
        return prototypes[key].apply(obj, args);
    };
}

for (var key in prototypes) {
    if (prototypes.hasOwnProperty(key) && prototypes[key]) {
        createShimMethod(key);
    }
}

if (Object.keys) {
    shim['getKeys'] = Object.keys;
}

module.exports = shim;
