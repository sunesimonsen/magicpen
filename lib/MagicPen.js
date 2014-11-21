/*global window*/
var utils = require('./utils');
var extend = utils.extend;
var duplicateText = require('./duplicateText');

function MagicPen(options) {
    if (!(this instanceof MagicPen)) {
        return new MagicPen(options);
    }

    options = options || {};

    var indentationWidth = 'indentationWidth' in options ?
        options.indentationWidth : 2;
    this.indentationWidth = Math.max(indentationWidth, 0);

    this.indentationLevel = 0;
    this.output = [[]];
    this.styles = {};
}

if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    MagicPen.defaultFormat = 'html'; // Browser
} else if (require('supports-color')) {
    MagicPen.defaultFormat = 'ansi'; // colored console
} else {
    MagicPen.defaultFormat = 'text'; // Plain text
}

MagicPen.prototype.newline = MagicPen.prototype.nl = function (count) {
    if (typeof count === 'undefined') {
        count = 1;
    }

    if (count === 0) {
        return this;
    }

    for (var i = 0; i < count; i += 1) {
        this.output.push([]);
    }
    return this;
};

MagicPen.serializers = {
    text: require('./TextSerializer'),
    html: require('./HtmlSerializer'),
    ansi: require('./AnsiSerializer')
};

function hasSameTextStyling(a, b) {
    if (!a || !b || a.style !== 'text' || b.style !== 'text') {
        return false;
    }

    return utils.arrayEquals(Array.prototype.slice.call(a.args, 1),
                             Array.prototype.slice.call(b.args, 1));
}

function normalizeLine(line) {
    if (line.length === 0) {
        return line;
    }

    var result = [line[0]];
    for (var i = 1; i < line.length; i += 1) {
        var lastEntry = result[result.length - 1];
        var entry = line[i];
        if (entry.style === 'text' && entry.args[0] === '') {
            continue;
        }

        if (hasSameTextStyling(lastEntry, entry)) {
            result[result.length - 1] = {
                style: entry.style,
                args: [lastEntry.args[0] + entry.args[0]].concat(entry.args.slice(1))
            };
        } else {
            result.push(entry);
        }
    }

    return result;
}

MagicPen.prototype.write = function () {
    if (typeof arguments[0] === 'string') {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.write({ style: arguments[0], args: args });
    } else {
        var options = arguments[0];
        if (this.styles[options.style]) {
            this.styles[options.style].apply(this, options.args);
            return this;
        }
        var lastLine = this.output[this.output.length - 1];
        var lastEntry = lastLine[lastLine.length - 1];
        if (hasSameTextStyling(lastEntry, options)) {
            options.args[0] = lastEntry.args[0] + options.args[0];
            lastLine[lastLine.length - 1] = options;
        } else {
            lastLine.push(options);
        }

        return this;
    }
};

MagicPen.prototype.indentLines = function () {
    this.indentationLevel += 1;
    return this;
};

MagicPen.prototype.indent = MagicPen.prototype.i = function () {
    for (var i = 0; i < this.indentationLevel; i += 1) {
        this.space(this.indentationWidth);
    }
    return this;
};

MagicPen.prototype.outdentLines = function () {
    this.indentationLevel = Math.max(0, this.indentationLevel - 1);
    return this;
};

MagicPen.prototype.addStyle = function (style, handler, allowRedefinition) {
    if (this[style] && !allowRedefinition) {
        throw new Error('"' + style + '" style is already defined, set 3rd arg (allowRedefinition) to true to define it anyway');
    }
    this.styles[style] = handler;
    this[style] = function () {
        handler.apply(this, arguments);
        return this;
    };
    return this;
};

MagicPen.prototype.toString = function (format) {
    format = format || 'text';
    if (format === 'auto') {
        format = MagicPen.defaultFormat;
    }
    var serializer = new MagicPen.serializers[format]();
    return serializer.serialize(this.output);
};

MagicPen.prototype.text = function (content) {
    if (content === '') {
        return this;
    }

    var args = Array.prototype.slice.call(arguments, 0);
    content = String(content);
    if (content.indexOf('\n') !== -1) {
        args = args.slice(1);
        var lines = content.split(/\n/);
        lines.forEach(function (lineContent, index) {
            this.write({ style: 'text', args: [lineContent].concat(args) });
            if (index < lines.length - 1) {
                this.nl();
            }
        }, this);
        return this;
    } else {
        return this.write({ style: 'text', args: args });
    }
};

MagicPen.prototype.removeFormatting = function () {
    var result = this.clone();
    this.output.forEach(function (line, index) {
        result.output[index] = normalizeLine(line.map(function (outputEntry) {
            return outputEntry.style === 'text' ?
                { style: 'text', args: [outputEntry.args[0]] } :
                outputEntry;
        }));
    });
    result.indentationLevel = this.indentationLevel;
    return result;
};

MagicPen.prototype.getContentFromArguments = function (args) {
    var clone;
    if (args[0].isMagicPen) {
        return args[0];
    } else if (typeof args[0] === 'function') {
        clone = this.clone();
        args[0].call(clone, clone);
        return clone;
    } else if (typeof args[0] === 'string') {
        clone = this.clone();
        clone[args[0]].apply(clone, Array.prototype.slice.call(args, 1));
        return clone;
    } else {
        throw new Error('Requires the arguments to be:\n' +
                        'a pen or\n' +
                        'a callback append content to a penor\n' +
                        'a style and arguments for that style');
    }
};

MagicPen.prototype.block = function () {
    var pen = this.getContentFromArguments(arguments);

    var blockOutput = pen.output.map(function (line) {
        return [].concat(line);
    });
    return this.write('block', blockOutput);
};

MagicPen.prototype.append = function () {
    var pen = this.getContentFromArguments(arguments);

    if (pen.isEmpty()) {
        return this;
    }

    var lastLine = this.output[this.output.length - 1];
    Array.prototype.push.apply(lastLine, pen.output[0]);
    this.output[this.output.length - 1] = normalizeLine(lastLine);

    this.output.push.apply(this.output, pen.output.slice(1));

    return this;
};

MagicPen.prototype.prependLinesWith = function () {
    var pen = this.getContentFromArguments(arguments);

    if (pen.isEmpty()) {
        return this;
    }

    if (pen.output.length > 1) {
        throw new Error('PrependLinesWith only supports a pen with single line content');
    }

    var height = this.size().height;
    var output = this.clone();
    output.block(function () {
        for (var i = 0; i < height; i += 1) {
            if (0 < i) {
                this.nl();
            }
            this.append(pen);
        }
    });
    output.block(this);

    this.output = output.output;
    return this;
};

MagicPen.prototype.space = MagicPen.prototype.sp = function (count) {
    if (count === 0) {
        return this;
    }

    if (typeof count === 'undefined') {
        count = 1;
    }

    this.text(duplicateText(' ', count));
    return this;
};

[
    'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden',
    'strikeThrough', 'black', 'red', 'green', 'yellow', 'blue',
    'magenta', 'cyan', 'white', 'gray', 'bgBlack', 'bgRed',
    'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan',
    'bgWhite'
].forEach(function (textStyle) {
    MagicPen.prototype[textStyle] = MagicPen.prototype[textStyle.toLowerCase()] = function (content) {
        return this.text.call(this, content, textStyle);
    };
});

MagicPen.prototype.clone = function () {
    function MagicPenClone() {}
    MagicPenClone.prototype = this;
    var clonedPen = new MagicPenClone();
    clonedPen.styles = extend({}, this.styles);
    clonedPen.indentationLevel = 0;
    clonedPen.output = [[]];
    return clonedPen;
};

MagicPen.prototype.isMagicPen = true;

MagicPen.prototype.size = function () {
    return utils.calculateSize(this.output);
};

MagicPen.prototype.installPlugin = function (plugin) {
    if (typeof plugin !== 'function') {
        throw new Error('Expected first argument given to installPlugin to be a function');
    }

    plugin(this);
    return this;
};

function replaceText(output, outputArray, regexp, cb) {
    var replacedOutput = output;
    outputArray.forEach(function (line, i) {
        if (0 < i) {
            replacedOutput.nl();
        }

        line.forEach(function (outputEntry, j) {
            if (outputEntry.style === 'block') {
                return replacedOutput.output[replacedOutput.output.length - 1].push({
                    style: 'block',
                    args: [replaceText(output.clone(), outputEntry.args[0], regexp, cb)]
                });
            } else if (outputEntry.style !== 'text') {
                return replacedOutput.output[replacedOutput.output.length - 1].push(outputEntry);
            }

            if (regexp.global) {
                regexp.lastIndex = 0;
            }
            var styles = outputEntry.args.slice(1);
            var m;
            var first = true;
            var lastIndex = 0;
            var text = outputEntry.args[0];
            while ((m = regexp.exec(text)) !== null && (regexp.global || first)) {
                if (lastIndex < m.index) {
                    replacedOutput.text.apply(replacedOutput, [text.substring(lastIndex, m.index)].concat(styles));
                }

                cb.apply(replacedOutput, [styles].concat(m));
                first = false;
                lastIndex = m.index + m[0].length;
            }

            if (lastIndex === 0) {
                var lastLine;
                if (replacedOutput.output.length === 0) {
                    lastLine = replacedOutput.output[0] = [];
                } else {
                    lastLine = replacedOutput.output[replacedOutput.output.length - 1];
                }

                lastLine.push(outputEntry);
            } else if (lastIndex < text.length) {
                replacedOutput.text.apply(replacedOutput, [text.substring(lastIndex, text.length)].concat(styles));
            }
        }, this);
    }, this);

    return replacedOutput.output.map(normalizeLine);
}

MagicPen.prototype.isEmpty = function () {
    return this.output.length === 1 && this.output[0].length === 0;
};


MagicPen.prototype.replaceText = function (regexp, cb) {
    if (this.isEmpty()) {
        return this;
    }

    if (typeof regexp === 'string') {
        regexp = new RegExp(utils.escapeRegExp(regexp), 'g');
    }

    if (typeof cb === 'string') {
        var text = cb;
        cb = function (styles, _) {
            var args = [text].concat(styles);
            this.text.apply(this, args);
        };
    }


    if (arguments.length === 1) {
        cb = regexp;
        regexp = /.*/;
    }

    this.output = replaceText(this.clone(), this.output, regexp, cb);

    return this;
};

module.exports = MagicPen;
