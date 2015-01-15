var rgbRegexp = require('./rgbRegexp');
var cssStyles = require('./cssStyles');

module.exports = function (theme, args) {
    var themeKey = args[1];
    if (
        args.length === 2 &&
        typeof themeKey === 'string' &&
        !rgbRegexp.test(themeKey) &&
        !cssStyles[themeKey]
    ) {
        var themeMapping = theme[themeKey];
        if (themeMapping) {
            return [args[0]].concat(themeMapping);
        }
    }

    return args;
};
