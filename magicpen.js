(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        factory();
    }
}(this, function () {
    var magicpen = {
        output: '',
        write: function (text) {
            this.output += text;
        },
        toString: function () {
            return this.output;
        }
    };

    return magicpen;
}));
