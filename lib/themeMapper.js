module.exports = function (theme, styles) {
    if (styles.length === 1) {
        var count = 0;
        var stack = [];
        var themeMapping = styles[0];
        var themeStyles = theme.styles || {};
        while(typeof themeMapping === 'string' && themeStyles[themeMapping]) {
            themeMapping = themeStyles[themeMapping];
            count += 1;
            if (100 < count) {
                var index = stack.indexOf(themeMapping);
                stack.push(themeMapping);
                if (index !== -1) {
                    throw new Error('Your theme contains a loop: ' + stack.slice(index).join(' -> '));
                }
            }
        }

        return Array.isArray(themeMapping) ? themeMapping : [themeMapping];
    }

    return styles;
};
