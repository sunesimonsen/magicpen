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
    this.output = [];
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

    this.output[0] = this.output[0] || [];

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
        this.output[0] = this.output[0] || [];
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
        result.output[index] = line.map(function (outputEntry) {
            return outputEntry.style === 'text' ?
                { style: 'text', args: [outputEntry.args[0]] } :
                outputEntry;
        });
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

    if (pen.output.length === 0) {
        return this;
    }

    this.output[0] = this.output[0] || [];
    var lastLine = this.output[this.output.length - 1];
    Array.prototype.push.apply(lastLine, pen.output[0]);

    this.output.push.apply(this.output, pen.output.slice(1));

    return this;
};

MagicPen.prototype.prependLinesWith = function () {
    if (this.output.length === 0) {
        return this;
    }

    var pen = this.getContentFromArguments(arguments);

    if (pen.output.length === 0) {
        return this;
    }

    if (pen.output.length > 1) {
        throw new Error('PrependLinesWith only supports a pen with single line content');
    }

    var outputToPrepend = [].concat(pen.output[0]);

    this.output = this.output.map(function (line) {
        return outputToPrepend.concat(line);
    });

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
    clonedPen.output = [];
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


module.exports = MagicPen;
