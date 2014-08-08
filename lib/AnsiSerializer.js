var shim = require('./shim');
var utils = require('./utils');
var TextSerializer = require('./TextSerializer');
var forEach = shim.forEach;
var getKeys = shim.getKeys;
var colorDiff = require('color-diff');

var ansiStyles = utils.extend({}, require('ansi-styles'));
forEach(getKeys(ansiStyles), function (styleName) {
    ansiStyles[styleName.toLowerCase()] = ansiStyles[styleName];
});

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

function firstUp(text) {
    return text.substring(0, 1).toUpperCase() + text.substring(1);
}

var colorDiffPalette = shim.map(getKeys(colorPalette), convertColorToObject);

var rgbRegexp = /^(?:bg)?#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
AnsiSerializer.prototype.text = function (content) {
    if (arguments.length > 1) {
        var stylesString = Array.prototype.slice.call(arguments, 1).join(',');
        var styles = stylesString.split(/\s*,\s*/);
        forEach(styles, function (styleName) {
            if (!ansiStyles[styleName] && rgbRegexp.test(styleName)) {
                var originalStyleName = styleName;
                var backgroundColor = styleName.substring(0, 2) === 'bg';
                var color = backgroundColor ? styleName.substring(2) : styleName;
                var colorObject = colorDiff.closest(convertColorToObject(color), colorDiffPalette);
                var closestColor = colorPalette[toHexColor(colorObject)];
                if (backgroundColor) {
                    styleName = 'bg' + firstUp(closestColor);
                } else {
                    styleName = closestColor;
                }
                ansiStyles[originalStyleName] = ansiStyles[styleName];
            }
            if (ansiStyles[styleName]) {
                content = ansiStyles[styleName].open + content + ansiStyles[styleName].close;
            }
        });
    }

    return content;
};

module.exports = AnsiSerializer;
