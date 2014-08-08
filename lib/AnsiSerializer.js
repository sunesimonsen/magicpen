var shim = require('./shim');
var TextSerializer = require('./TextSerializer');
var forEach = shim.forEach;
var colorDiff = require('color-diff');

var ansiStyles = require('ansi-styles');

function AnsiSerializer() {}

AnsiSerializer.prototype = new TextSerializer();

var colorPalette = {
    '#000000': 'black',
    '#ff0000': 'red',
    '#00ff00': 'green',
    '#ffff00': 'yellow',
    '#0000ff': 'blue',
    '#ff00ff': 'magenta',
    '#00ffff': 'cyan',
    '#ffffff': 'white',
    '#808080': 'gray'
};

function convertColorToObject(color) {
    if (color.length < 6) {
        // Allow CSS shorthand
        color = color.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i, '$1$1$2$2$3$3');
    }
    // Split color into red, green, and blue components
    var hexMatch = color.match(/^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i);
    if (hexMatch) {
        return {
            R: parseInt(hexMatch[1], 16),
            G: parseInt(hexMatch[2], 16),
            B: parseInt(hexMatch[3], 16)
        };
    }
}

function toHexColor(colorObject) {
    var hexString = (Math.round(colorObject.R) * 0x10000 + Math.round(colorObject.G) * 0x100 + Math.round(colorObject.B)).toString(16);
    return '#' + ('00000'.substr(0, 6 - hexString.length)) + hexString;
}

var colorDiffPalette = shim.map(shim.getKeys(colorPalette), convertColorToObject);

var rgbRegexp = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
AnsiSerializer.prototype.text = function (content) {
    if (arguments.length > 1) {
        var stylesString = Array.prototype.slice.call(arguments, 1).join(',');
        var styles = stylesString.split(/\s*,\s*/);
        forEach(styles, function (styleName) {
            if (rgbRegexp.test(styleName)) {
                var colorObject = colorDiff.closest(convertColorToObject(styleName), colorDiffPalette);
                styleName = colorPalette[toHexColor(colorObject)];
            }
            if (ansiStyles[styleName]) {
                content = ansiStyles[styleName].open + content + ansiStyles[styleName].close;
            }
        });
    }

    return content;
};

module.exports = AnsiSerializer;
