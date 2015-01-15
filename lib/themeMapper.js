var rgbRegexp = require('./rgbRegexp');
var cssStyles = require('./cssStyles');

module.exports = function (theme, args) {
    var themeKey = args[1];
    if (args.length === 2 && typeof themeKey === 'string') {
        var themeMapping = theme[themeKey];
        if (themeMapping && !rgbRegexp.test(themeKey) && !cssStyles[themeKey]) {
            return [args[0]].concat(themeMapping);
        }
    }

    return args;
};
