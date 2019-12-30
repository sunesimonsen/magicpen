var cssStyles = require('./cssStyles');
var flattenBlocksInLines = require('./flattenBlocksInLines');
var rgbRegexp = require('./rgbRegexp');
var themeMapper = require('./themeMapper');

function ColoredConsoleSerializer() {}

ColoredConsoleSerializer.prototype.format = 'coloredConsole';

ColoredConsoleSerializer.prototype.serialize = function (lines) {
    var formatString = '';
    var styleStrings = [];
    this.serializeLines(flattenBlocksInLines(lines)).forEach(function (entry) {
        if (entry) {
            formatString += entry[0];
            if (entry.length > 1) {
                styleStrings.push(entry[1]);
            }
        }
    });
    return [formatString].concat(styleStrings);
};

ColoredConsoleSerializer.prototype.serializeLines = function (lines) {
    var result = [];
    lines.forEach(function (line, i) {
        if (i > 0) {
            result.push(['%c\n ', '']);
        }
        Array.prototype.push.apply(result, this.serializeLine(line));
    }, this);
    return result;
};

ColoredConsoleSerializer.prototype.serializeLine = function (line) {
    var result = [];
    line.forEach(function (outputEntry) {
        if (this[outputEntry.style]) {
            result.push(this[outputEntry.style](outputEntry.args, outputEntry.themes));
        }
    }, this);
    return result;
};

ColoredConsoleSerializer.prototype.block = function (content) {
    return this.serializeLines(content);
};

ColoredConsoleSerializer.prototype.text = function (options, themes) {
    var content = String(options.content);
    if (content === '') {
        return '';
    }

    var styles = themeMapper(themes.coloredConsole || {}, options.styles);

    var result = ['%c' + content.replace(/%/g, '%%')];
    var styleProperties = [];

    if (styles.length > 0) {
        for (var i = 0; i < styles.length; i += 1) {
            var styleName = styles[i];
            if (rgbRegexp.test(styleName)) {
                if (styleName.substring(0, 2) === 'bg') {
                    styleProperties.push('background-color: ' + styleName.substring(2));
                } else {
                    styleProperties.push('color: ' + styleName);
                }
            } else if (cssStyles[styleName]) {
                styleProperties.push(cssStyles[styleName]);
            }
        }
    }
    result.push(styleProperties.join('; '));
    return result;
};

ColoredConsoleSerializer.prototype.raw = function (options) {
    return String(options.content(this));
};

module.exports = ColoredConsoleSerializer;
