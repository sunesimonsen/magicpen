/*global namespace*/
(function () {
    var shim = namespace.shim;
    var map = shim.map;
    var forEach = shim.forEach;
    var utils = namespace.utils;
    var extend = utils.extend;

    function duplicateText(content, times) {
        var result = '';
        for (var i = 0; i < times; i += 1) {
            result += content;
        }
        return result;
    }
    namespace.duplicateText = duplicateText;

    function isOutputEntry(obj) {
        return typeof obj === 'object' && 'style' in obj && 'args' in obj;
    }

    function MagicPen(options) {
        if (!(this instanceof MagicPen)) {
            return new MagicPen(options);
        }

        if (typeof options === 'string') {
            var mode = options;
            options = {
                mode: mode
            };
        }

        options = options || {};

        var indentationWidth = 'indentationWidth' in options ?
            options.indentationWidth : 2;
        this.indentationWidth = Math.max(indentationWidth, 0);
        this.mode = options.mode || 'text';

        this.indentationLevel = 0;
        this.output = [];
        this.styles = {};

        this.serializer = new MagicPen.serializers[this.mode]();
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

    MagicPen.serializers = {};

    MagicPen.prototype.write = function () {
        if (arguments.length === 1 && isOutputEntry(arguments[0])) {
            var options = arguments[0];
            if (this.styles[options.style]) {
                this.styles[options.style].apply(this, options.args);
                return this;
            }
            this.output[0] = this.output[0] || [];
            this.output[this.output.length - 1].push(options);
            return this;
        } else {
            var args = Array.prototype.slice.call(arguments, 1);
            return this.write({ style: arguments[0], args: args });
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

    MagicPen.prototype.addStyle = function (style, handler) {
        if (this[style]) {
            throw new Error('"' + style + '" style is already defined');
        }
        this.styles[style] = handler;
        this[style] = function () {
            handler.apply(this, arguments);
            return this;
        };
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

    MagicPen.prototype.text = function () {
        var args = Array.prototype.slice.call(arguments);
        return this.write({ style: 'text', args: args });
    };

    MagicPen.prototype.block = function (pen) {
        this.ensurePenWithSameMode(pen);
        var blockOutput = map(pen.output, function (line) {
            return [].concat(line);
        });
        return this.write('block', blockOutput);
    };

    MagicPen.prototype.append = function (pen) {
        this.ensurePenWithSameMode(pen);
        if (pen.output.length === 0) {
            return this;
        }

        this.output[0] = this.output[0] || [];
        var lastLine = this.output[this.output.length - 1];
        Array.prototype.push.apply(lastLine, pen.output[0]);

        this.output.push.apply(this.output, pen.output.slice(1));

        return this;
    };

    MagicPen.prototype.prependLinesWith = function (pen) {
        this.ensurePenWithSameMode(pen);
        if (pen.output.length === 0 || this.output.length === 0) {
            return this;
        }

        if (pen.output.length > 1) {
            throw new Error('PrependLinesWith only supports a pen with single line content');
        }

        var outputToPrepend = [].concat(pen.output[0]);

        this.output = map(this.output, function (line) {
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

    forEach([
        'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden',
        'strikeThrough', 'black', 'red', 'green', 'yellow', 'blue',
        'magenta', 'cyan', 'white', 'gray', 'bgBlack', 'bgRed',
        'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan',
        'bgWhite'
    ], function (textStyle) {
        MagicPen.prototype[textStyle] = function (content) {
            return this.text.call(this, content, textStyle);
        };
    });

    MagicPen.prototype.clone = function () {
        function MagicPenClone() {}
        MagicPenClone.prototype = this;
        var clonedPen = new MagicPenClone();
        clonedPen.serializer = new MagicPen.serializers[this.mode]();
        clonedPen.styles = extend({}, this.styles);
        clonedPen.indentationLevel = 0;
        clonedPen.output = [];
        return clonedPen;
    };

    MagicPen.prototype.size = function () {
        return this.serializer.size(this.output);
    };

    namespace.MagicPen = MagicPen;
    namespace.magicpen = MagicPen;
}());
