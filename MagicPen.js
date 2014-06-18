(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        factory();
    }
}(this, function () {
    function getKeys(obj) {
        var result = [];

        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                result.push(i);
            }
        }

        return result;
    }

    function forEach(arr, callback, that) {
        for (var i = 0, n = arr.length; i < n; i += 1)
            if (i in arr)
                callback.call(that, arr[i], i, arr);
    }

    function extend(target) {
        var sources = Array.prototype.slice.call(arguments, 1);
        forEach(sources, function (source) {
            forEach(getKeys(source), function (key) {
                target[key] = source[key];
            });
        });
        return target;
    }

    var defaults = {
        mode: 'plain',
        styles: {},
        modes: {}
    };

    function addStyle(target, mode, style, handler) {
        if (mode) {
            target.modes[mode] = target.modes[mode] || {};
            target.modes[mode][style] = handler;
        } else {
            target.styles[style] = handler;
        }
    }

    addStyle(defaults, 'ansi', 'red', function (text) {
        return '\x1B[31m' + text + '\x1B[39m';
    });

    addStyle(defaults, 'ansi', 'green', function (text) {
        return '\x1B[32m' + text + '\x1B[39m';
    });

    function MagicPen(mode) {
        extend(this, defaults, {
            output: '',
            mode: mode
        });
    }

    MagicPen.prototype.write = function (style, text) {
        if (typeof text === 'undefined') {
            text = style;
            style = null;
        }

        if (this.mode in this.modes && style in this.modes[this.mode]) {
            text = this.modes[this.mode][style](text);
        } else if (style in this.styles) {
            text = this.styles[style](text);
        }
        this.output += text;
    };

    MagicPen.prototype.addStyle = function (mode, style, handler) {
        if (typeof handler === 'undefined') {
            handler = style;
            style = mode;
            mode = null;
        }

        addStyle(this, mode, style, handler);
    };

    MagicPen.prototype.toString = function () {
        return this.output;
    };

    return MagicPen;
}));
