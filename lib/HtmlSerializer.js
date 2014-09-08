var htmlStyles = {
    bold: 'font-weight: bold',
    dim: 'opacity: 0.7',
    italic: 'font-style: italic',
    underline: 'text-decoration: underline',
    inverse: '-webkit-filter: invert(%100); filter: invert(100%)',
    hidden: 'visibility: hidden',
    strikeThrough: 'text-decoration: line-through',

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

Object.keys(htmlStyles).forEach(function (styleName) {
    htmlStyles[styleName.toLowerCase()] = htmlStyles[styleName];
});

function HtmlSerializer() {}

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
    return '<div style="display: inline-block; vertical-align: top">' +
        this.serialize(content) +
        '</div>';
};

var rgbRegexp = /^(?:bg)?#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
HtmlSerializer.prototype.text = function (content) {
    content = String(content)
        .replace(/&/g, '&amp;')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    if (arguments.length > 1) {
        var stylesString = Array.prototype.slice.call(arguments, 1).join(',');
        var styleProperties = [];
        stylesString.split(/\s*,\s*/).forEach(function (styleName) {
            if (rgbRegexp.test(styleName)) {
                if (styleName.substring(0, 2) === 'bg') {
                    styleProperties.push('background-color: ' + styleName.substring(2));
                } else {
                    styleProperties.push('color: ' + styleName);
                }
            } else if (htmlStyles[styleName]) {
                styleProperties.push(htmlStyles[styleName]);
            }
        });

        content = '<span style="' + styleProperties.join('; ') + '">' + content + '</span>';
    }
    return content;
};

module.exports = HtmlSerializer;
