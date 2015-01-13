module.exports = function themeEntryResolver(theme, name, mode) {
    var themeMapping = theme[name];
    if (themeMapping) {
        if (mode in themeMapping) {
            return [].concat(themeMapping[mode]);
        } else if (typeof themeMapping === 'string' || Array.isArray(themeMapping)) {
            return [].concat(themeMapping);
        } else {
            return null;
        }
    } else {
        return null;
    }
};
