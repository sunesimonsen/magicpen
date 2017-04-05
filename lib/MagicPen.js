/*global window*/
var utils = require('./utils');
var extend = utils.extend;
var duplicateText = require('./duplicateText');
var rgbRegexp = require('./rgbRegexp');
var cssStyles = require('./cssStyles');

var builtInStyleNames = [
    'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden',
    'strikeThrough', 'black', 'red', 'green', 'yellow', 'blue',
    'magenta', 'cyan', 'white', 'gray', 'bgBlack', 'bgRed',
    'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan',
    'bgWhite'
];

function MagicPen(options) {
    if (!(this instanceof MagicPen)) {
        return new MagicPen(options);
    }

    options = options || {};

    if (typeof options === "string") {
        options = {format: options };
    }

    var indentationWidth = 'indentationWidth' in options ?
        options.indentationWidth : 2;
    this.indentationWidth = Math.max(indentationWidth, 0);

    this.indentationLevel = 0;
    this.output = [[]];
    this.styles = Object.create(null);
    this.installedPlugins = [];
    // Ready to be cloned individually:
    this._themes = {};
    Object.keys(MagicPen.serializers).forEach(function (serializerName) {
        this._themes[serializerName] = { styles: {} };
    }, this);
    this.preferredWidth = (!process.browser && process.stdout.columns) || 80;
    if (options.format) {
        this.format = options.format;
    }
}

if (typeof exports === 'object' && typeof exports.nodeName !== 'string' && require('supports-color')) {
    MagicPen.defaultFormat = 'ansi'; // colored console
} else if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    if (window._phantom || window.mochaPhantomJS || (window.__karma__ && window.__karma__.config.captureConsole)) {
        MagicPen.defaultFormat = 'ansi'; // colored console
    } else {
        MagicPen.defaultFormat = 'html'; // Browser
    }
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

MagicPen.serializers = {};
[
    require('./TextSerializer'),
    require('./HtmlSerializer'),
    require('./AnsiSerializer'),
    require('./ColoredConsoleSerializer')
].forEach(function (serializer) {
    MagicPen.serializers[serializer.prototype.format] = serializer;
});

function hasSameTextStyling(a, b) {
    if (!a || !b || a.style !== 'text' || b.style !== 'text') {
        return false;
    }

    return utils.arrayEquals(a.args.styles, b.args.styles);
}

function normalizeLine(line) {
    if (line.length === 0) {
        return line;
    }

    var result = [line[0]];
    for (var i = 1; i < line.length; i += 1) {
        var lastEntry = result[result.length - 1];
        var entry = line[i];
        if (entry.style === 'text' && entry.args.content === '') {
            continue;
        }

        if (hasSameTextStyling(lastEntry, entry)) {
            result[result.length - 1] = {
                style: lastEntry.style,
                args: {
                    content: lastEntry.args.content + entry.args.content,
                    styles: lastEntry.args.styles
                }
            };
        } else {
            result.push(entry);
        }
    }

    return result;
}

MagicPen.prototype.write = function (options) {
    if (this.styles[options.style]) {
        this.styles[options.style].apply(this, options.args);
        return this;
    }
    var lastLine = this.output[this.output.length - 1];
    var lastEntry = lastLine[lastLine.length - 1];
    if (hasSameTextStyling(lastEntry, options)) {
        lastLine[lastLine.length - 1] = {
            style: lastEntry.style,
            args: {
                content: lastEntry.args.content + options.args.content,
                styles: lastEntry.args.styles
            }
        };
    } else {
        lastLine.push(options);
    }

    return this;
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
    if (this[style] === false || ((this.hasOwnProperty(style) || MagicPen.prototype[style]) && !Object.prototype.hasOwnProperty.call(this.styles, style) && builtInStyleNames.indexOf(style) === -1)) {
        throw new Error('"' + style + '" style cannot be defined, it clashes with a built-in attribute');
    }

    // Refuse to redefine a built-in style or a style already defined directly on this pen unless allowRedefinition is true:
    if (this.hasOwnProperty(style) || builtInStyleNames.indexOf(style) !== -1) {
        var existingType = typeof this[style];
        if (existingType === 'function') {
            if (!allowRedefinition) {
                throw new Error('"' + style + '" style is already defined, set 3rd arg (allowRedefinition) to true to define it anyway');
            }
        }
    }
    if (this._stylesHaveNotBeenClonedYet) {
        this.styles = Object.create(this.styles);
        this._stylesHaveNotBeenClonedYet = false;
    }

    this.styles[style] = handler;
    this[style] = function () {
        handler.apply(this, arguments);
        return this;
    };
    return this;
};

MagicPen.prototype.toString = function (format) {
    if (format && this.format && format !== this.format) {
        throw new Error('A pen with format: ' + this.format + ' cannot be serialized to: ' + format);
    }

    format = this.format || format || 'text';
    if (format === 'auto') {
        format = MagicPen.defaultFormat;
    }
    var theme = this._themes[format] || {};
    var serializer = new MagicPen.serializers[format](theme);
    return serializer.serialize(this.output);
};

MagicPen.prototype.text = function () {
    var content = arguments[0];
    if (content === '') {
        return this;
    }

    var styles = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i += 1) {
        styles[i - 1] = arguments[i];
    }

    content = String(content);
    if (content.indexOf('\n') !== -1) {
        var lines = content.split(/\n/);
        lines.forEach(function (lineContent, index) {
            if (lineContent.length) {
                this.write({
                    style: 'text',
                    args: { content: lineContent, styles: styles }
                });
            }
            if (index < lines.length - 1) {
                this.nl();
            }
        }, this);
        return this;
    } else {
        return this.write({
            style: 'text',
            args: { content: content, styles: styles }
        });
    }
};

MagicPen.prototype.removeFormatting = function () {
    var result = this.clone();
    this.output.forEach(function (line, index) {
        result.output[index] = normalizeLine(line.map(function (outputEntry) {
            return outputEntry.style === 'text' ?
                { style: 'text', args: { content: outputEntry.args.content, styles: [] } } :
                outputEntry;
        }));
    });
    result.indentationLevel = this.indentationLevel;
    return result;
};

MagicPen.prototype.getContentFromArguments = function (args) {
    var clone;
    if (args[0].isMagicPen) {
        this.ensureCompatibleFormat(args[0].format);
        return args[0];
    } else if (typeof args[0] === 'function') {
        clone = this.clone();
        args[0].call(clone, clone);
        return clone;
    } else if (typeof args[0] === 'string' && args.length === 1) {
        clone = this.clone();
        clone.text(args[0]);
        return clone;
    } else if (typeof args[0] === 'string') {
        clone = this.clone();
        clone[args[0]].apply(clone, Array.prototype.slice.call(args, 1));
        return clone;
    } else {
        throw new Error('Requires the arguments to be:\n' +
                        'a pen or\n' +
                        'a callback appending content to a pen or\n' +
                        'a style and arguments for that style or\n' +
                        'just a string.');
    }
};

MagicPen.prototype.isMultiline = function () {
    return this.output.length > 1 || this.size().height > 1;
};

MagicPen.prototype.isAtStartOfLine = function () {
    return this.output.length === 0 || this.output[this.output.length - 1].length === 0;
};

MagicPen.prototype.isBlock = function () {
    return this.output.length === 1 &&
        this.output[0].length === 1 &&
        this.output[0][0].style === 'block';
};

MagicPen.prototype.ensureCompatibleFormat = function (format) {
    if (format && this.format && format !== this.format) {
        throw new Error('This pen is only compatible with the format: ' + this.format);
    }
};

MagicPen.prototype.block = function () {
    var pen = this.getContentFromArguments(arguments);

    var blockOutput = pen.output.map(function (line) {
        return [].concat(line);
    });
    return this.write({ style: 'block', args: blockOutput });
};
function isRawOutput(options) {
    return options &&
        typeof options === 'object' &&
        typeof options.width === 'number' &&
        typeof options.height === 'number' && (
            typeof options.content === 'function' ||
                typeof options.content === 'string'
        );
}

MagicPen.prototype.alt = function (options) {
    var format = this.format;
    if (!format) {
        throw new Error('The alt method is only supported on pen where the format has already been set');
    }

    var outputProperty = options[format];

    if (typeof outputProperty === 'undefined') {
        if (options.fallback) {
            return this.append(options.fallback);
        } else {
            // Nothing to do for this format, just NOOP:
            return this;
        }
    }

    if (typeof outputProperty === 'string' || isRawOutput(outputProperty)) {
        return this.raw(outputProperty);
    } else {
        return this.append(outputProperty);
    }
};

MagicPen.prototype.raw = function (options) {
    var format = this.format;
    if (!format) {
        throw new Error('The alt method is only supported on pen where the format has already been set');
    }

    if (typeof options === 'string') {
        return this.write({ style: 'raw', args: {
            height: 0,
            width: 0,
            content: function () {
                return options;
            }
        }});
    }

    if (isRawOutput(options)) {
        if (typeof options.content === 'string') {
            options = extend({}, options);
            var content = options.content;
            options.content = function () {
                return content;
            };
        }

        return this.write({ style: 'raw', args: options });
    }

    throw new Error('Raw ' + this.format + ' content needs to adhere to one of the following forms:\n' +
                    'a string of raw content\n' +
                    'a function returning a string of raw content or\n' +
                    'an object with the following form { width: <number>, height: <number>, content: <string function() {}|string> }');
};

function amend(output, pen) {
    var lastLine = output[output.length - 1].slice();
    var newOutput = output.slice(0, -1);
    var lastEntry = lastLine[lastLine.length - 1];
    if (lastEntry && lastEntry.style === 'block') {
        lastLine[lastLine.length - 1] = {
            style: 'block',
            args: amend(lastEntry.args, pen)
        };
        newOutput[output.length - 1] = lastLine;
    } else {
        Array.prototype.push.apply(lastLine, pen.output[0]);
        newOutput[output.length - 1] = normalizeLine(lastLine);
        newOutput.push.apply(newOutput, pen.output.slice(1));
    }

    return newOutput;
}

MagicPen.prototype.amend = function () {
    var pen = this.getContentFromArguments(arguments);

    if (pen.isEmpty()) {
        return this;
    }

    this.output = amend(this.output, pen);

    return this;
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

    return this.text(duplicateText(' ', count));
};

builtInStyleNames.forEach(function (textStyle) {
    MagicPen.prototype[textStyle] = MagicPen.prototype[textStyle.toLowerCase()] = function (content) {
        return this.text(content, textStyle);
    };
});

MagicPen.prototype.clone = function (format) {
    if (!this.isEmpty()) {
        this.ensureCompatibleFormat(format);
    }

    function MagicPenClone() {}
    MagicPenClone.prototype = this;
    var clonedPen = new MagicPenClone();
    clonedPen.styles = this.styles;
    clonedPen._stylesHaveNotBeenClonedYet = true;
    clonedPen.indentationLevel = 0;
    clonedPen.output = [[]];
    clonedPen.installedPlugins = [];
    clonedPen._themes = this._themes;
    clonedPen._themesHaveNotBeenClonedYet = true;
    clonedPen.format = format || this.format;
    clonedPen.parent = this;
    return clonedPen;
};

MagicPen.prototype.isMagicPen = true;

MagicPen.prototype.size = function () {
    return utils.calculateSize(this.output);
};

MagicPen.prototype.use = function (plugin) {
    var existingPlugin = utils.findFirst(this.installedPlugins, function (installedPlugin) {
        if (installedPlugin === plugin) {
            return true;
        } else if (typeof plugin === 'function' && typeof installedPlugin === 'function') {
            var pluginName = utils.getFunctionName(plugin);
            return pluginName !== '' && pluginName === utils.getFunctionName(installedPlugin);
        } else {
            return installedPlugin.name === plugin.name;
        }
    });

    if (existingPlugin) {
        if (existingPlugin === plugin || (typeof plugin.version !== 'undefined' && plugin.version === existingPlugin.version)) {
            // No-op
            return this;
        } else {
            throw new Error("Another instance of the plugin '" + plugin.name + "' " +
                            "is already installed" +
                            (typeof existingPlugin.version !== 'undefined' ?
                                ' (version ' + existingPlugin.version +
                                (typeof plugin.version !== 'undefined' ?
                                    ', trying to install ' + plugin.version : '') +
                                ')' : '') +
                            ". Please check your node_modules folder for unmet peerDependencies.");
        }
    }

    if ((typeof plugin !== 'function' && (typeof plugin !== 'object' || typeof plugin.installInto !== 'function')) ||
        (typeof plugin.name !== 'undefined' && typeof plugin.name !== 'string') ||
        (typeof plugin.dependencies !== 'undefined' && !Array.isArray(plugin.dependencies))) {
        throw new Error('Plugins must be functions or adhere to the following interface\n' +
                        '{\n' +
                        '  name: <an optional plugin name>,\n' +
                        '  version: <an optional semver version string>,\n' +
                        '  dependencies: <an optional list of dependencies>,\n' +
                        '  installInto: <a function that will update the given magicpen instance>\n' +
                        '}');
    }

    if (plugin.dependencies) {
        var instance = this;
        var thisAndParents = [];
        do {
            thisAndParents.push(instance);
            instance = instance.parent;
        } while (instance);
        var unfulfilledDependencies = plugin.dependencies.filter(function (dependency) {
            return !thisAndParents.some(function (instance) {
                return instance.installedPlugins.some(function (plugin) {
                    return plugin.name === dependency;
                });
            });
        });

        if (unfulfilledDependencies.length === 1) {
            throw new Error(plugin.name + ' requires plugin ' + unfulfilledDependencies[0]);
        } else if (unfulfilledDependencies.length > 1) {
            throw new Error(plugin.name + ' requires plugins ' +
                            unfulfilledDependencies.slice(0, -1).join(', ') +
                            ' and ' + unfulfilledDependencies[unfulfilledDependencies.length - 1]);
        }
    }

    this.installedPlugins.push(plugin);
    if (typeof plugin === 'function') {
        plugin(this);
    } else {
        plugin.installInto(this);
    }

    return this; // for chaining
};

MagicPen.prototype.installPlugin = MagicPen.prototype.use; // Legacy alias

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
                    args: replaceText(output.clone(), outputEntry.args, regexp, cb)
                });
            } else if (outputEntry.style !== 'text') {
                return replacedOutput.output[replacedOutput.output.length - 1].push(outputEntry);
            }

            if (regexp.global) {
                regexp.lastIndex = 0;
            }
            var m;
            var first = true;
            var lastIndex = 0;
            var text = outputEntry.args.content;
            var styles = outputEntry.args.styles;
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

MagicPen.prototype.theme = function (format) {
    format = format || this.format;
    if (!format) {
        throw new Error("Could not detect which format you want to retrieve " +
                        "theme information for. Set the format of the pen or " +
                        "provide it as an argument to the theme method.");
    }

    return this._themes[format];
};

MagicPen.prototype.installTheme = function (formats, theme) {
    var that = this;
    if (arguments.length === 1) {
        theme = formats;
        formats = Object.keys(MagicPen.serializers);
    }

    if (typeof formats === 'string') {
        formats = [formats];
    }

    if (
        typeof theme !== 'object' ||
        !Array.isArray(formats) ||
        formats.some(function (format) {
            return typeof format !== 'string';
        })
    ) {
        throw new Error("Themes must be installed the following way:\n" +
                        "Install theme for all formats: pen.installTheme({ comment: 'gray' })\n" +
                        "Install theme for a specific format: pen.installTheme('ansi', { comment: 'gray' }) or\n" +
                        "Install theme for a list of formats: pen.installTheme(['ansi', 'html'], { comment: 'gray' })");
    }

    if (!theme.styles || typeof theme.styles !== 'object') {
        theme = {
            styles: theme
        };
    }

    if (that._themesHaveNotBeenClonedYet) {
        var clonedThemes = {};
        Object.keys(that._themes).forEach(function (format) {
            clonedThemes[format] = Object.create(that._themes[format]);
        });
        that._themes = clonedThemes;
        that._themesHaveNotBeenClonedYet = false;
    }

    Object.keys(theme.styles).forEach(function (themeKey) {
        if (rgbRegexp.test(themeKey) || cssStyles[themeKey]) {
            throw new Error("Invalid theme key: '" + themeKey + "' you can't map build styles.");
        }

        if (!that[themeKey]) {
            that.addStyle(themeKey, function (content) {
                this.text(content, themeKey);
            });
        }
    });

    formats.forEach(function (format) {
        var baseTheme = that._themes[format] || { styles: {} };
        var extendedTheme = extend({}, baseTheme, theme);
        extendedTheme.styles = extend({}, baseTheme.styles, theme.styles);
        that._themes[format] = extendedTheme;
    });


    return this;
};

module.exports = MagicPen;
