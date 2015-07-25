var utils = {
    extend: function (target) {
        for (var i = 1; i < arguments.length; i += 1) {
            var source = arguments[i];
            Object.keys(source).forEach(function (key) {
                target[key] = source[key];
            });
        }
        return target;
    },

    calculateOutputEntrySize: function (outputEntry) {
        switch (outputEntry.style) {
        case 'text':
            return { width: String(outputEntry.args.content).length, height: 1 };
        case 'block':
            return utils.calculateSize(outputEntry.args);
        case 'raw':
            var arg = outputEntry.args;
            return { width: arg.width, height: arg.height };
        default: return { width: 0, height: 0 };
        }
    },

    calculateLineSize: function (line) {
        var size = { height: 1, width: 0 };
        line.forEach(function (outputEntry) {
            var outputEntrySize = utils.calculateOutputEntrySize(outputEntry);
            size.width += outputEntrySize.width;
            size.height = Math.max(outputEntrySize.height, size.height);
        });
        return size;
    },

    calculateSize: function (lines) {
        var size = { height: 0, width: 0 };
        lines.forEach(function (line) {
            var lineSize = utils.calculateLineSize(line);
            size.height += lineSize.height;
            size.width = Math.max(size.width, lineSize.width);
        });
        return size;
    },

    arrayEquals: function (a, b) {
        if (a === b) {
            return true;
        }

        if (!a || a.length !== b.length) {
            return false;
        }

        for (var i = 0; i < a.length; i += 1) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;

    },

    escapeRegExp: function (text){
        return text.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    },

    findFirst: function (arr, predicate, thisObj) {
        var scope = thisObj || null;
        for (var i = 0 ; i < arr.length ; i += 1) {
            if (predicate.call(scope, arr[i], i, arr)) {
                return arr[i];
            }
        }
        return null;
    },

    getFunctionName: function (f) {
        if (typeof f.name === 'string') {
            return f.name;
        }
        var matchFunctionName = Function.prototype.toString.call(f).match(/function ([^\(]+)/);
        if (matchFunctionName) {
            return matchFunctionName[1];
        }

        if (f === Object) {
            return 'Object';
        }
        if (f === Function) {
            return 'Function';
        }
    }
};

module.exports = utils;
