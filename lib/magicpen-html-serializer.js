/*global namespace*/
(function () {
    var shim = namespace.shim;
    var forEach = shim.forEach;
    var map = shim.map;
    var filter = shim.filter;

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

    function HtmlSerializer() {}

    HtmlSerializer.prototype.serialize = function (lines) {
        return '<code>\n' + this.serializeLines(lines) + '\n</code>';
    };

    HtmlSerializer.prototype.serializeLines = function (lines) {
        return map(lines, function (line) {
            return '  <div>' + this.serializeLine(line).join('') + '</div>';
        }, this).join('\n');
    };

    HtmlSerializer.prototype.serializeLine = function (line) {
        return map(line, function (outputEntry) {
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

    HtmlSerializer.prototype.text = function (content) {
        content = String(content)
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

            content = '<span style="' + map(styles, function (styleName) {
                return htmlStyles[styleName];
            }).join('; ') + '">' + content + '</span>';
        }
        return content;
    };

    namespace.magicpen.serializers.html = namespace.HtmlSerializer = HtmlSerializer;
}());
