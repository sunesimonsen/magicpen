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

    calculateLineSize: function (line) {
        var size = { height: 1, width: 0 };
        line.forEach(function (outputEntry) {
            switch (outputEntry.style) {
            case 'text':
                size.width += String(outputEntry.args[0]).length;
                break;
            case 'block':
                var blockSize = utils.calculateSize(outputEntry.args[0]);
                size.width += blockSize.width;
                size.height = Math.max(blockSize.height, size.height);
                break;
            }
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

    }
};

module.exports = utils;
