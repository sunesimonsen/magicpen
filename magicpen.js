/*global weknowhow:true*/
(function (global, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        weknowhow.magicpen = factory();
    }
}(this, function () {
    var global = this;
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

    function filter(arr, callback, that) {
        var result = [];
        for (var i = 0, n = arr.length; i < n; i += 1)
            if (i in arr && callback.call(that, arr[i], i, arr))
                result.push(arr[i]);
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

    var requireStyles = ['lines', 'text', 'space', 'block'];

    function Serializer(styles) {
        var that = this;
        forEach(requireStyles, function (style) {
            if (!styles[style]) {
                throw new Error("Required style '" + style + "' is missing");
            }
        });
        this.styles = styles;
        this.styles.raw = function (text) {
            return text;
        };

        // Alias space as sp
        this.styles.sp = this.styles.space;

        var textStyles = [
            'bold',
            'dim',
            'italic',
            'underline',
            'inverse',
            'hidden',
            'strikethrough',
            'black',
            'red',
            'green',
            'yellow',
            'blue',
            'magenta',
            'cyan',
            'white',
            'gray',
            'bgBlack',
            'bgRed',
            'bgGreen',
            'bgYellow',
            'bgBlue',
            'bgMagenta',
            'bgCyan',
            'bgWhite'
        ];

        forEach(textStyles, function (textStyle) {
            if (!that.styles[textStyle]) {
                that.styles[textStyle] = function (text) {
                    return this.text.call(that, text, textStyle);
                };
            }
        });
    }

    Serializer.prototype.serialize = function (lines) {
        return this.serializeLines(lines);
    };

    Serializer.prototype.serializeLines = function (lines) {
        return this.styles.lines(map(lines, function (line) {
            return {
                indentation: line.indentation,
                content: this.serializeLineContent(line)
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
            return this.styles[entry.style].apply(this.styles, entry.args);
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

    // copied from https://github.com/sindresorhus/ansi-regex
    // License https://raw.githubusercontent.com/sindresorhus/ansi-regex/master/license
    var ansiRegex = /\u001b\[(?:[0-9]{1,3}(?:;[0-9]{1,3})*)?[m|K]/g;

    var PlainSerializer = createSerializer({
        text: function (text) {
            return text;
        },
        lines: function (lines) {
            function serializeLine(line) {
                var serializedLines = [''];

                forEach(line.content, function (inlineBlock, blockIndex) {
                    var blockLines = map(String(inlineBlock).split('\n'), function (serializedBlockLine) {
                        return {
                            content: serializedBlockLine,
                            length: serializedBlockLine.replace(ansiRegex, '').length
                        };
                    });
                    var longestBlockLine = 0;
                    forEach(blockLines, function (blockLine) {
                        longestBlockLine = Math.max(longestBlockLine, blockLine.length);
                    });

                    var blockStartIndex = serializedLines[0].replace(ansiRegex, '').length;
                    serializedLines[0] += blockLines[0].content;
                    if (blockLines.length > 1 && blockIndex < line.content.length - 1) {
                        serializedLines[0] += duplicateText(' ', longestBlockLine - blockLines[0].length);
                    }

                    forEach(blockLines.slice(1), function (blockLine, index) {
                        var lineIndex = index + 1;
                        serializedLines[lineIndex] = serializedLines[lineIndex] || '';
                        var padding = duplicateText(' ', blockStartIndex - serializedLines[lineIndex].replace(ansiRegex, '').length);
                        serializedLines[lineIndex] += padding + blockLine.content;
                    });
                });

                return serializedLines.join('\n');
            }

            return map(lines, serializeLine).join('\n');
        },
        space: function (count) {
            return duplicateText(' ', count || 1);
        },
        block: function (content) {
            return content;
        }
    });

    var ansiStyles = (function () {
        // Copied from https://github.com/sindresorhus/ansi-styles/
        // License: raw.githubusercontent.com/sindresorhus/ansi-styles/master/license
        var styles = {};

        var codes = {
            bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
            dim: [2, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            hidden: [8, 28],
            strikethrough: [9, 29],

            black: [30, 39],
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            white: [37, 39],
            gray: [90, 39],

            bgBlack: [40, 49],
            bgRed: [41, 49],
            bgGreen: [42, 49],
            bgYellow: [43, 49],
            bgBlue: [44, 49],
            bgMagenta: [45, 49],
            bgCyan: [46, 49],
            bgWhite: [47, 49]
        };

        Object.keys(codes).forEach(function (key) {
            var val = codes[key];
            var style = styles[key] = {};
            style.open = '\x1B[' + val[0] + 'm';
            style.close = '\x1B[' + val[1] + 'm';
        });

        return styles;
    }());

    var AnsiSerializer = createSerializer(extend({}, PlainSerializer.prototype.styles, {
        text: function (text) {
            if (arguments.length > 1) {
                var stylesString = Array.prototype.slice.call(arguments, 1).join(',');
                var styles = stylesString.split(/\s*,\s*/);
                forEach(styles, function (style) {
                    if (ansiStyles[style]) {
                        text = ansiStyles[style].open + text + ansiStyles[style].close;
                    }
                });
            }

            return text;
        }
    }));

    var htmlStyles = {
        bold: 'font-weight: bold',
        dim: 'opacity: 0.7',
        italic: 'font-style: italic',
        underline: 'text-decoration: underline',
        inverse: '-webkit-filter: invert(%100); filter: invert(100%)',
        hidden: 'visibility: hidden',
        strikethrough: 'text-decoration: line-through',

        black: 'color: black',
        red: 'color: red',
        green: 'color: green',
        yellow: 'color: yellow',
        blue: 'color: blue',
        magenta: 'color: magenta',
        cyan: 'color: cyan',
        white: 'color: white',
        gray: 'color: gray',

        bgBlack: 'background-color: black',
        bgRed: 'background-color: red',
        bgGreen: 'background-color: green',
        bgYellow: 'background-color: yellow',
        bgBlue: 'background-color: blue',
        bgMagenta: 'background-color: magenta',
        bgCyan: 'background-color: cyan',
        bgWhite: 'background-color: white'
    };

    var HtmlSerializer = createSerializer({
        text: function (text) {
            text = String(text)
                .replace(/&/g, '&amp;')
                .replace(/ /g, '&nbsp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');

            if (arguments.length > 1) {
                var stylesString = Array.prototype.slice.call(arguments, 1).join(',');
                var styles = filter(stylesString.split(/\s*,\s*/), function (styleName) {
                    return htmlStyles[styleName];
                });

                text = '<span style="' + map(styles, function (styleName) {
                    return htmlStyles[styleName];
                }).join('; ') + '">' + text + '</span>';
            }
            return text;
        },
        lines: function (lines) {
            return '<code>\n' +
                map(lines, function (line) {
                    return '  <div>' + line.content.join('') + '</div>';
                }).join('\n') + '\n' +
                '</code>';
        },
        block: function (content) {
            return '<div style="display: inline-block; vertical-align: top">' + content + '</div>';
        },
        space: function (count) {
            return duplicateText('&nbsp;', count || 1);
        }
    });

    var defaults = {
        mode: 'plain'
    };

    function MagicPen(mode) {
        if (this === global) {
            return new MagicPen(mode);
        }

        var that = this;

        extend(this, defaults, {
            indentationLevel: 0,
            output: [],
            styles: {}
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
        this.output.push([]);
        return this;
    };

    MagicPen.serializers = {
        plain: PlainSerializer,
        ansi: AnsiSerializer,
        html: HtmlSerializer
    };

    MagicPen.prototype.write = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length === 0) {
            return this;
        } else if (args.length === 1 && isOutputEntry(args[0])) {
            var options = args[0];
            if (this.styles[options.style]) {
                this.styles[options.style].apply(this, options.args);
                return this;
            }
            this.output[0] = this.output[0] || [];
            this.output[this.output.length - 1].push(options);
            return this;
        } else if (args.length === 1) {
            return this.write({ style: 'text', args: args });
        } else {
            return this.write({ style: args[0], args: args.slice(1) });
        }
    };

    MagicPen.prototype.indentLines = function () {
        this.indentationLevel += 1;
        this.newline();
        return this;
    };

    MagicPen.prototype.indent = MagicPen.prototype.i = function () {
        for (var i = 0; i < this.indentationLevel; i += 1) {
            this.space(2);
        }
        return this;
    };

    MagicPen.prototype.outdentLines = function () {
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

    MagicPen.prototype.ensurePenWithSameMode = function (pen) {
        if (!(pen instanceof MagicPen) || pen.mode !== this.mode) {
            throw new Error('Expected an instance of a MagicPen in ' + this.mode + ' mode');
        }
    };

    MagicPen.prototype.block = function (pen) {
        this.ensurePenWithSameMode(pen);
        return this.write('block', pen.toString());
    };

    MagicPen.prototype.append = function (pen) {
        this.ensurePenWithSameMode(pen);
        if (pen.output.length === 0) {
            return this;
        }

        this.output[0] = this.output[0] || [];
        this.output[0].push.apply(this.output[0], pen.output[0]);

        this.output.push.apply(this.output, pen.output.slice(1));

        return this;
    };

    MagicPen.prototype.prependLinesWith = function (pen) {
        this.ensurePenWithSameMode(pen);
        if (pen.output.length === 0 || this.output.length === 0) {
            return this;
        }
        var outputToPrepend = Array.prototype.concat.apply([], pen.output);

        this.output = map(this.output, function (line) {
            return outputToPrepend.concat(line);
        });

        return this;
    };

    MagicPen.prototype.clone = function () {
        function MagicPenClone() {}
        MagicPenClone.prototype = this;
        var clonedPen = new MagicPenClone();
        clonedPen.indentationLevel = 0;
        clonedPen.output = [];
        return clonedPen;
    };

    return MagicPen;
}));