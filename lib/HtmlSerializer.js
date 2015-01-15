var cssStyles = require('./cssStyles');
var rgbRegexp = require('./rgbRegexp');
var themeMapper = require('./themeMapper');

function HtmlSerializer(theme) {
    this.theme = theme;
}

HtmlSerializer.prototype.serialize = function (lines) {
    return '<div style="font-family: monospace; white-space: nowrap">\n' + this.serializeLines(lines) + '\n</div>';
};

HtmlSerializer.prototype.serializeLines = function (lines) {
    return lines.map(function (line) {
        return '  <div>' + (this.serializeLine(line).join('') || '&nbsp;') + '</div>';
    }, this).join('\n');
};

HtmlSerializer.prototype.serializeLine = function (line) {
    return line.map(function (outputEntry) {
        return this[outputEntry.style] ?
            this[outputEntry.style].apply(this, outputEntry.args) :
            '';
    }, this);
};

HtmlSerializer.prototype.block = function (content) {
    return '<div style="display: inline-block; vertical-align: top">\n' +
        this.serializeLines(content) +
        '\n</div>';
};

HtmlSerializer.prototype.text = function () {
    var args = themeMapper(this.theme, arguments);

    var content = String(args[0])
        .replace(/&/g, '&amp;')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    if (args.length > 1) {
        var styleProperties = [];
        for (var j = 1; j < args.length; j += 1) {
            var styleName = args[j];
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

        if (styleProperties.length > 0) {
            content = '<span style="' + styleProperties.join('; ') + '">' + content + '</span>';
        }
    }
    return content;
};

module.exports = HtmlSerializer;
