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

    var requireStyles = ['lines', 'text', 'space', 'block', 'red', 'green', 'bold'];

    function Line() {
        this.content = [];
    }

    Line.prototype.push = function () {
        this.content.push.apply(this.content, arguments);
    };

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
        return map(content, this.serializeEntry, this);
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
            function serializeLine(line) {
                var serializedLines = [''];

                forEach(line.content, function (inlineBlock, blockIndex) {
                    var blockLines = inlineBlock.split('\n');
                    var longestBlockLine = 0;
                    forEach(blockLines, function (blockLine) {
                        longestBlockLine = Math.max(longestBlockLine, blockLine.length);
                    });

                    var blockStartIndex = serializedLines[0].length;
                    serializedLines[0] += blockLines[0];
                    if (blockLines.length > 1 && blockIndex < line.content.length - 1) {
                        serializedLines[0] += duplicateText(' ', longestBlockLine - blockLines[0].length);
                    }


                    forEach(blockLines.slice(1), function (blockLine, index) {
                        var lineIndex = index + 1;
                        serializedLines[lineIndex] = serializedLines[lineIndex] || '';
                        var padding = duplicateText(' ', blockStartIndex - serializedLines[lineIndex].length);
                        serializedLines[lineIndex] += padding + blockLine;
                    });
                });

                return serializedLines.join('\n');
            }

            return map(lines, serializeLine).join('\n');
        },
        space: function () {
            return ' ';
        },
        block: function (pen) {
            return pen.toString();
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

    var AnsiSerializer = createSerializer(extend({}, PlainSerializer.prototype.styles, {
        red: function (text) {
            return '\x1B[31m' + text + '\x1B[39m';
        },
        green: function (text) {
            return '\x1B[32m' + text + '\x1B[39m';
        },
        bold: function (text) {
            return '\x1B[1m' + text + '\x1B[22m';
        }
    }));

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
            return '<code>\n' +
                map(lines, function (line) {
                    return '  <div>' + line.content.join('') + '</div>';
                }).join('\n') + '\n' +
                '</code>';
        },
        block: function (pen) {
            return pen.toString();
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
            indentationLevel: 0,
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
        this.output.push(new Line(0));
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
            if (this.styles[styleString]) {
                this.styles[styleString].apply(this, args[0].args);
                return this;
            }

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
        this.indentationLevel += 1;
        this.newline();
        return this;
    };

    MagicPen.prototype.indentation = function () {
        for (var i = 0; i < this.indentationLevel; i += 1) {
            this.space().space();
        }
        return this;
    };

    MagicPen.prototype.outdent = function () {
        this.indentationLevel = Math.max(0, this.indentationLevel - 1);
        this.newline();
        return this;
    };

    MagicPen.prototype.addStyle = function (style, handler) {
        var that = this;
        this.styles[style] = handler;
        if (!this[style]) {
            this[style] = function () {
                handler.apply(that, arguments);
                return that;
            };
        }
        return this;
    };

    MagicPen.prototype.toString = function () {
        return this.serializer.serialize(this.output);
    };

    return MagicPen;
}));
