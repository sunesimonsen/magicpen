module.exports = function (theme, args) {
    if (args.length === 2) {
        var count = 0;
        var stack = [];
        var themeMapping = args[1];
        while(typeof themeMapping === 'string' && theme[themeMapping]) {
            themeMapping = theme[themeMapping];
            count += 1;
            if (100 < count) {
                var index = stack.indexOf(themeMapping);
                stack.push(themeMapping);
                if (index !== -1) {
                    throw new Error('Your theme contains a loop: ' + stack.slice(index).join(' -> '));
                }
            }
        }

        return [args[0]].concat(themeMapping);
    }

    return args;
};
