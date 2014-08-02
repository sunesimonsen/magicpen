/*global namespace*/
(function () {
    var TextSerializer = namespace.TextSerializer;
    var forEach = namespace.shim.forEach;

    var ansiStyles = (function () {
        // Copied from https://github.com/sindresorhus/ansi-styles/
        // License: raw.githubusercontent.com/sindresorhus/ansi-styles/master/license
        var styles = {};

        var codes = {
            bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
            dim: [2, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            hidden: [8, 28],
            strikeThrough: [9, 29],

            black: [30, 39],
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            white: [37, 39],
            gray: [90, 39],

            bgBlack: [40, 49],
            bgRed: [41, 49],
            bgGreen: [42, 49],
            bgYellow: [43, 49],
            bgBlue: [44, 49],
            bgMagenta: [45, 49],
            bgCyan: [46, 49],
            bgWhite: [47, 49]
        };

        Object.keys(codes).forEach(function (key) {
            var val = codes[key];
            var style = styles[key] = {};
            style.open = '\x1B[' + val[0] + 'm';
            style.close = '\x1B[' + val[1] + 'm';
        });

        return styles;
    }());

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

    namespace.magicpen.serializers.ansi = namespace.AnsiSerializer = AnsiSerializer;
}());
