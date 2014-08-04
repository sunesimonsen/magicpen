var shim = require('./shim');
var map = shim.map;
var forEach = shim.forEach;
var duplicateText = require('./duplicateText');

// copied from https://github.com/sindresorhus/ansi-regex
// License https://raw.githubusercontent.com/sindresorhus/ansi-regex/master/license
var ansiRegex = /\u001b\[(?:[0-9]{1,3}(?:;[0-9]{1,3})*)?[m|K]/g;
function stripAnsi(text) {
    return text.replace(ansiRegex, '');
}

function TextSerializer() {}

TextSerializer.prototype.serialize = function (lines) {
    return map(lines, this.serializeLine, this).join('\n');
};

TextSerializer.prototype.serializeLine = function (line) {
    var serializedLines = [''];

    var startIndex = 0;
    forEach(line, function (outputEntry, blockIndex) {
        var inlineBlock = this[outputEntry.style] ?
            this[outputEntry.style].apply(this, outputEntry.args) :
            '';

        var blockLines = map(String(inlineBlock).split('\n'), function (serializedBlockLine) {
            return {
                content: serializedBlockLine,
                length: stripAnsi(serializedBlockLine).length
            };
        });
        var longestBlockLine = 0;
        forEach(blockLines, function (blockLine) {
            longestBlockLine = Math.max(longestBlockLine, blockLine.length);
        });

        forEach(blockLines, function (blockLine, index) {
            serializedLines[index] = serializedLines[index] || '';
            var padding = duplicateText(' ', startIndex - stripAnsi(serializedLines[index]).length);
            serializedLines[index] += padding + blockLine.content;
        });
        startIndex += longestBlockLine;
    }, this);

    return serializedLines.join('\n');
};

TextSerializer.prototype.text = function (content) {
    return content;
};

TextSerializer.prototype.block = function (content) {
    return this.serialize(content);
};

module.exports = TextSerializer;
