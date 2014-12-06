var whitespaceCacheLength = 256;
var whitespaceCache = [''];
for (var i = 1; i <= whitespaceCacheLength; i += 1) {
    whitespaceCache[i] = whitespaceCache[i - 1] + ' ';
}

function duplicateText(content, times) {
    if (times < 0) {
        return '';
    }

    var result = '';

    if (content === ' ') {
        if (times <= whitespaceCacheLength) {
            return whitespaceCache[times];
        }

        var segment = whitespaceCache[whitespaceCacheLength];
        var numberOfSegments = Math.floor(times / whitespaceCacheLength);
        for (var i = 0; i < numberOfSegments; i += 1) {
            result += segment;
        }
        result += whitespaceCache[times % whitespaceCacheLength];
    } else {
        for (var j = 0; j < times; j += 1) {
            result += content;
        }
    }

    return result;
}

module.exports = duplicateText;
