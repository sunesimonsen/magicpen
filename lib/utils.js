var utils = {
    extend: function (target) {
        var sources = Array.prototype.slice.call(arguments, 1);
        sources.forEach(function (source) {
            Object.keys(source).forEach(function (key) {
                target[key] = source[key];
            });
        });
        return target;
    },

    calculateOutputEntrySize: function (outputEntry) {
        switch (outputEntry.style) {
        case 'text':
            return { width: String(outputEntry.args[0]).length, height: 1 };
        case 'block':
            return utils.calculateSize(outputEntry.args[0]);
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

    lineContainsBlocks: function (line) {
        return line.some(function (outputEntry) {
            return outputEntry.style === 'block' ||
                (outputEntry.style === 'text' && String(outputEntry.args[0]).indexOf('\n') !== -1);
        });
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
    }
};

module.exports = utils;
