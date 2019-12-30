var utils = require('./utils');
var TextSerializer = require('./TextSerializer');
var colorDiff = require('color-diff');
var rgbRegexp = require('./rgbRegexp');
var themeMapper = require('./themeMapper');

var cacheSize = 0;
var maxColorCacheSize = 1024;

var ansiStyles = utils.extend({}, require('ansi-styles'));
Object.keys(ansiStyles).forEach(function (styleName) {
    ansiStyles[styleName.toLowerCase()] = ansiStyles[styleName];
});

function AnsiSerializer() {}

AnsiSerializer.prototype = new TextSerializer();

AnsiSerializer.prototype.format = 'ansi';

var colorPalettes = {
    16: {
        '#000000': 'black',
        '#ff0000': 'red',
        '#00ff00': 'green',
        '#ffff00': 'yellow',
        '#0000ff': 'blue',
        '#ff00ff': 'magenta',
        '#00ffff': 'cyan',
        '#ffffff': 'white',
        '#808080': 'gray'
    },
    256: {}
};

var diffPalettes = {};

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

diffPalettes[16] = Object.keys(colorPalettes[16]).map(convertColorToObject);
diffPalettes['bg16'] = Object.keys(colorPalettes[16]).filter(function (color) {
    return color !== "#808080";
}).map(convertColorToObject);
diffPalettes[256] = [].concat(diffPalettes[16]);
var nextAnsiColorNumber = 16;
function registerNext256PaletteEntry(obj) {
    diffPalettes[256].push(obj);
    colorPalettes[256][toHexColor(obj)] = nextAnsiColorNumber;
    nextAnsiColorNumber += 1;
}

for (var r = 0 ; r < 6 ; r += 1) {
    for (var g = 0 ; g < 6 ; g += 1) {
        for (var b = 0 ; b < 6 ; b += 1) {
            registerNext256PaletteEntry({
                R: Math.round(r * 256 / 6),
                G: Math.round(g * 256 / 6),
                B: Math.round(b * 256 / 6)
            });
        }
    }
}

[
    0x08, 0x12, 0x1c, 0x26, 0x30, 0x3a, 0x44, 0x4e, 0x58, 0x60, 0x66, 0x76,
    0x80, 0x8a, 0x94, 0x9e, 0xa8, 0xb2, 0xbc, 0xc6, 0xd0, 0xda, 0xe4, 0xee
].forEach(function (value) {
    registerNext256PaletteEntry({R: value, G: value, B: value});
});

AnsiSerializer.prototype.text = function (options, themes) {
    var content = String(options.content);
    if (content === '') {
        return '';
    }

    var styles = themeMapper(themes.ansi || {}, options.styles);

    if (styles.length > 0) {
        for (var i = styles.length -1; i >= 0; i -= 1) {
            var styleName = styles[i];

            if (ansiStyles[styleName]) {
                content = ansiStyles[styleName].open + content + ansiStyles[styleName].close;
            } else if (rgbRegexp.test(styleName)) {
                var originalStyleName = styleName;
                var isBackgroundColor = styleName.substring(0, 2) === 'bg';
                var colorName = isBackgroundColor ? styleName.substring(2) : styleName;

                var color16Hex = toHexColor(colorDiff.closest(convertColorToObject(colorName),
                                                              diffPalettes[isBackgroundColor ? 'bg16' : 16]));
                var closestColor16 = colorPalettes[16][color16Hex];

                var color256Hex = toHexColor(colorDiff.closest(convertColorToObject(colorName), diffPalettes[256]));
                var closest256ColorIndex = colorPalettes[256][color256Hex];

                if (isBackgroundColor) {
                    styleName = 'bg' + firstUp(closestColor16);
                } else {
                    styleName = closestColor16;
                }

                var open = ansiStyles[styleName].open;
                var close = ansiStyles[styleName].close;
                if (color16Hex !== color256Hex) {
                    open += '\x1b[' + (isBackgroundColor ? 48 : 38) + ';5;' + closest256ColorIndex + 'm';
                }
                if (cacheSize < maxColorCacheSize) {
                    ansiStyles[originalStyleName] = {open: open, close: close};
                    cacheSize += 1;
                }

                content = open + content + close;
            }
        }
    }

    return content;
};

module.exports = AnsiSerializer;
