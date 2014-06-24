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

        if (!(style in target)) {
            target[style] = function (text) {
                this.write(style, text);
                return this;
            };
        }
    }

    addStyle(defaults, null, 'sp', function () {
        return ' ';
    });

    // ansi
    addStyle(defaults, 'ansi', 'red', function (text) {
        return '\x1B[31m' + text + '\x1B[39m';
    });

    addStyle(defaults, 'ansi', 'green', function (text) {
        return '\x1B[32m' + text + '\x1B[39m';
    });

    // html
    addStyle(defaults, 'html', 'red', function (text) {
        return '<span style="color: red">' + text + '</span>';
    });

    addStyle(defaults, 'html', 'green', function (text) {
        return '<span style="color: green">' + text + '</span>';
    });

    addStyle(defaults, 'html', 'sp', function () {
        return '&nbsp;';
    });

    function MagicPen(mode) {
        extend(this, defaults, {
            output: '',
            mode: mode
        });
    }

    function Serializer() {
    }

    Serializer.prototype.serialize = function (formattedOutput) {
        var that = this;
        var serializedEntries = [];
        forEach(formattedOutput, function (entry) {
            serializedEntries.push(that.serializeEntry(entry));
        });
        return serializedEntries.join('');
    };

    Serializer.prototype.serializeEntry = function (entry) {
        if (entry.style in this) {
            return this[entry.style].apply(this, entry.args);
        } else {
            return entry.args.join('');
        }
    };

    // Alias space as sp
    Serializer.prototype.sp = function () {
        return this.space.apply(this, arguments);
    };

    function AnsiSerializer() {
        Serializer.apply(this, arguments);
    }
    extend(AnsiSerializer.prototype, Serializer.prototype);

    AnsiSerializer.prototype.red = function (text) {
        return '\x1B[31m' + text + '\x1B[39m';
    };

    AnsiSerializer.prototype.green = function (text) {
        return '\x1B[32m' + text + '\x1B[39m';
    };

    AnsiSerializer.prototype.space = function (text) {
        return ' ';
    };

    function HtmlSerializer() {
        Serializer.apply(this, arguments);
    }
    extend(HtmlSerializer.prototype, Serializer.prototype);

    HtmlSerializer.prototype.red = function (text) {
        return '<span style="color: red">' + text + '</span>';
    };

    HtmlSerializer.prototype.green = function (text) {
        return '<span style="color: green">' + text + '</span>';
    };

    HtmlSerializer.prototype.space = function (text) {
        return '&nbsp;';
    };

    MagicPen.serializers = {
        ansi: AnsiSerializer,
        html: HtmlSerializer
    };

    MagicPen.prototype.write = function (style, text) {
        if (arguments.length === 1) {
            text = style;
            style = null;
        }

        if (this.mode in this.modes && style in this.modes[this.mode]) {
            text = this.modes[this.mode][style](text);
        } else if (style in this.styles) {
            text = this.styles[style](text);
        }
        this.output += text;
        return this;
    };

    MagicPen.prototype.addStyle = function (mode, style, handler) {
        if (arguments.length === 2) {
            handler = style;
            style = mode;
            mode = null;
        }

        addStyle(this, mode, style, handler);
        return this;
    };

    MagicPen.prototype.toString = function () {
        return this.output;
    };

    return MagicPen;
}));
