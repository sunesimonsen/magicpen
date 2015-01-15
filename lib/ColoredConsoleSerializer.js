var cssStyles = require('./cssStyles');
var flattenBlocksInLines = require('./flattenBlocksInLines');
var rgbRegexp = require('./rgbRegexp');
var themeMapper = require('./themeMapper');

function ColoredConsoleSerializer(theme) {
    this.theme = theme;
}

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
            result.push(this[outputEntry.style].apply(this, outputEntry.args));
        }
    }, this);
    return result;
};

ColoredConsoleSerializer.prototype.block = function (content) {
    return this.serializeLines(content);
};

ColoredConsoleSerializer.prototype.text = function () {
    var args = themeMapper(this.theme, arguments);
    var content = String(args[0]);
    if (content === '') {
        return null;
    }

    var result = ['%c' + content.replace(/%/g, '%%')];
    var styleProperties = [];

    if (args.length > 1) {
        for (var i = 1; i < args.length; i += 1) {
            var styleName = args[i];
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

module.exports = ColoredConsoleSerializer;
