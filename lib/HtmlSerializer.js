var cssStyles = require('./cssStyles');
var rgbRegexp = require('./rgbRegexp');
var themeMapper = require('./themeMapper');

function HtmlSerializer() {}

HtmlSerializer.prototype.format = 'html';

HtmlSerializer.prototype.serialize = function (lines) {
    return '<div style="font-family: monospace; white-space: nowrap">' + this.serializeLines(lines) + '</div>';
};

HtmlSerializer.prototype.serializeLines = function (lines) {
    return lines.map(function (line) {
        return '<div>' + (this.serializeLine(line).join('') || '&nbsp;') + '</div>';
    }, this).join('');
};

HtmlSerializer.prototype.serializeLine = function (line) {
    return line.map(function (outputEntry) {
        return this[outputEntry.style] ?
            this[outputEntry.style](outputEntry.args, outputEntry.themes) :
            '';
    }, this);
};

HtmlSerializer.prototype.block = function (content) {
    return '<div style="display: inline-block; vertical-align: top">' +
        this.serializeLines(content) +
        '</div>';
};

HtmlSerializer.prototype.text = function (options, themes) {
    var content = String(options.content);

    if (content === '') {
        return '';
    }

    content = content
        .replace(/&/g, '&amp;')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    var styles = themeMapper(themes.html || {}, options.styles);

    if (styles.length > 0) {
        var styleProperties = [];
        for (var j = 0; j < styles.length; j += 1) {
            var styleName = styles[j];
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

HtmlSerializer.prototype.raw = function (options) {
    return String(options.content(this));
};

module.exports = HtmlSerializer;
