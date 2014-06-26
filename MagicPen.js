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

    var requireStyles = ['space', 'red', 'green'];

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

    function Serializer(styles) {
        forEach(requireStyles, function (style) {
            if (!styles[style]) {
                throw new Error("Required style '" + style + "' is missing");
            }
        });
        this.styles = styles;

        // Alias space as sp
        this.styles.sp = this.styles.space;
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
        if (entry.style in this.styles) {
            return this.styles[entry.style].apply(this, entry.args);
        } else {
            return entry.args.join('');
        }
    };

    function createSerializer(styles) {
        function CustomSerializer() {
        }
        CustomSerializer.prototype = new Serializer(styles);
        return CustomSerializer;
    }

    var PlainSerializer = createSerializer({
        space: function () {
            return ' ';
        },
        red: function (text) {
            return text;
        },
        green: function (text) {
            return text;
        }
    });

    var AnsiSerializer = createSerializer({
        space: function () {
            return ' ';
        },
        red: function (text) {
            return '\x1B[31m' + text + '\x1B[39m';
        },
        green: function (text) {
            return '\x1B[32m' + text + '\x1B[39m';
        }
    });

    var HtmlSerializer = createSerializer({
        space: function () {
            return '&nbsp;';
        },
        red: function (text) {
            return '<span style="color: red">' + text + '</span>';
        },
        green: function (text) {
            return '<span style="color: green">' + text + '</span>';
        }
    });

    function MagicPen(mode) {
        var that = this;
        extend(this, defaults, {
            output: []
        });

        this.mode = mode || this.mode;
        this.serializer = new MagicPen.serializers[this.mode]();

        forEach(getKeys(this.serializer.styles), function (style) {
            if (!that[style]) {
                that[style] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    this.output.push({
                        style: style,
                        args: args
                    });
                    return this;
                };
            }
        });
    }

    MagicPen.serializers = {
        plain: PlainSerializer,
        ansi: AnsiSerializer,
        html: HtmlSerializer
    };

    MagicPen.prototype.write = function (style) {
        var args;
        if (arguments.length > 1) {
            args = Array.prototype.slice.call(arguments, 1);
        } else {
            args = Array.prototype.slice.call(arguments);
            style = null;
        }

        this.output.push({
            style: style,
            args: args
        });

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
        return this.serializer.serialize(this.output);
    };

    return MagicPen;
}));
