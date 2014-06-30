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

    function map(arr, callback, that) {
        var result = [];
        for (var i = 0, n = arr.length; i < n; i += 1)
            if (i in arr)
                result.push(callback.call(that, arr[i], i, arr));
        return result;
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

    var requireStyles = ['lines', 'text', 'space', 'red', 'green', 'bold'];

    function Line(indentation) {
        this.indentation = indentation;
        this.content = [];
    }

    Line.prototype.push = function () {
        this.content.push.apply(this.content, arguments);
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

    Serializer.prototype.serialize = function (lines) {
        return this.serializeLines(lines);
    };

    Serializer.prototype.serializeLines = function (lines) {
        return this.styles.lines(map(lines, function (line) {
            return {
                indentation: line.indentation,
                content: this.serializeLineContent(line.content)
            };
        }, this));
    };

    Serializer.prototype.serializeLineContent = function (content) {
        return map(content, this.serializeEntry, this).join('');
    };

    function isOutputEntry(obj) {
        return typeof obj === 'object' && 'style' in obj && 'args' in obj;
    }

    Serializer.prototype.serializeEntry = function (entry) {
        var that = this;
        if (entry.style in this.styles) {
            var serializedArgs = [];
            forEach(entry.args, function (arg) {
                if (isOutputEntry(arg)) {
                    serializedArgs.push(that.serializeEntry(arg));
                } else {
                    serializedArgs.push(arg);
                }
            });

            return this.styles[entry.style].apply(this, serializedArgs);
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

    function duplicateText(text, times) {
        var result = '';
        for (var i = 0; i < times; i += 1) {
            result += text;
        }
        return result;
    }

    var PlainSerializer = createSerializer({
        text: function (text) {
            return text;
        },
        lines: function (lines) {
            return map(lines, function (line) {
                return duplicateText('  ', line.indentation) + line.content;
            }).join('\n');
        },
        space: function () {
            return ' ';
        },
        red: function (text) {
            return text;
        },
        green: function (text) {
            return text;
        },
        bold: function (text) {
            return text;
        }
    });

    var AnsiSerializer = createSerializer({
        text: function (text) {
            return text;
        },
        lines: function (lines) {
            return map(lines, function (line) {
                return duplicateText('  ', line.indentation) + line.content;

            }).join('\n');
        },
        space: function () {
            return ' ';
        },
        red: function (text) {
            return '\x1B[31m' + text + '\x1B[39m';
        },
        green: function (text) {
            return '\x1B[32m' + text + '\x1B[39m';
        },
        bold: function (text) {
            return '\x1B[1m' + text + '\x1B[22m';
        }
    });

    var HtmlSerializer = createSerializer({
        text: function (text) {
            return (text || '')
                .replace(/&/g, '&amp;')
                .replace(/ /g, '&nbsp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        },
        lines: function (lines) {
            return map(lines, function (line) {
                var styling = '';
                if (line.indentation) {
                    styling = ' style="padding-left: ' + (line.indentation * 10) + 'px"';
                }
                return '<div' + styling + '>' + line.content + '</div>';
            }).join('\n');
        },
        space: function () {
            return '&nbsp;';
        },
        red: function (text) {
            return '<span style="color: red">' + text + '</span>';
        },
        green: function (text) {
            return '<span style="color: green">' + text + '</span>';
        },
        bold: function (text) {
            return '<span style="font-weight: bold">' + text + '</span>';
        }
    });

    var defaults = {
        mode: 'plain'
    };

    function MagicPen(mode) {
        var that = this;

        extend(this, defaults, {
            indentation: 0,
            output: [],
            styles: {},
            modes: {}
        });

        this.mode = mode || this.mode;
        this.serializer = new MagicPen.serializers[this.mode]();

        forEach(getKeys(this.serializer.styles), function (style) {
            if (!that[style]) {
                that[style] = function () {
                    var args = Array.prototype.slice.call(arguments);
                    return this.write.call(this, { style: style, args: args });
                };
            }
        });
    }

    MagicPen.prototype.newline = MagicPen.prototype.nl = function () {
        this.output.push(new Line(this.indentation));
        return this;
    };

    MagicPen.serializers = {
        plain: PlainSerializer,
        ansi: AnsiSerializer,
        html: HtmlSerializer
    };

    function createOutputEntry(styles, args) {
        if (styles.length === 1) {
            var style = styles.shift();
            if (!style || style === 'text') {
                return {
                    style: 'text',
                    args: args
                };
            } else {
                return {
                    style: style,
                    args: map(args, function (arg) {
                        if (typeof arg === 'string') {
                            return {
                                style: 'text',
                                args: [arg]
                            };
                        } else {
                            return arg;
                        }
                    })
                };
            }
        } else {
            return {
                style: styles.shift(),
                args: [createOutputEntry(styles, args)]
            };
        }
    }

    MagicPen.prototype.write = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length === 0) {
            return this;
        } else if (args.length === 1 && isOutputEntry(args[0])) {
            var styleString = args[0].style;
            var styles = (styleString && styleString.indexOf(',') !== -1) ?
                styleString.split(/\s*,\s*/) : [styleString];

            var entry = createOutputEntry(styles, args[0].args);

            if (this.output.length === 0) {
                this.output.push(new Line(0));
            }

            this.output[this.output.length - 1].push(entry);
            return this;
        } else if (args.length === 1) {
            return this.write({ style: null, args: args });
        } else {
            return this.write({ style: args[0], args: args.slice(1) });
        }
    };

    MagicPen.prototype.indent = function () {
        this.indentation += 1;
        this.newline();
        return this;
    };

    MagicPen.prototype.outdent = function () {
        this.indentation = Math.max(0, this.indentation - 1);
        this.newline();
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
