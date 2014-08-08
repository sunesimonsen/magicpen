var TextSerializer = require('./TextSerializer');
var forEach = require('./shim').forEach;

var ansiStyles = require('ansi-styles');

function AnsiSerializer() {}

AnsiSerializer.prototype = new TextSerializer();

AnsiSerializer.prototype.text = function (content) {
    if (arguments.length > 1) {
        var stylesString = Array.prototype.slice.call(arguments, 1).join(',');
        var styles = stylesString.split(/\s*,\s*/);
        forEach(styles, function (style) {
            if (ansiStyles[style]) {
                content = ansiStyles[style].open + content + ansiStyles[style].close;
            }
        });
    }

    return content;
};

module.exports = AnsiSerializer;
