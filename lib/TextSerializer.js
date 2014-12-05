var duplicateText = require('./duplicateText');
var utils = require('./utils');
var ansiRegex = require('ansi-regex');

function stripAnsi(text) {
    return text.replace(ansiRegex, '');
}

function TextSerializer() {}

TextSerializer.prototype.serialize = function (lines) {
    return lines.map(this.serializeLine, this).join('\n');
};

TextSerializer.prototype.serializeLine = function (line) {
    var serializedLines = [''];

    var startIndex = 0;
    line.forEach(function (outputEntry, blockIndex) {
        var outputEntrySize = utils.calculateOutputEntrySize(outputEntry);
        var inlineBlock = this[outputEntry.style] ?
            this[outputEntry.style].apply(this, outputEntry.args) :
            '';

        var blockLines = String(inlineBlock).split('\n');
        var padLines = blockIndex < line.length - 1;

        blockLines.forEach(function (blockLine, index) {
            if (!serializedLines[index]) {
                serializedLines[index] = duplicateText(' ', startIndex);
            }

            var padding = '';
            if (padLines) {
                padding = duplicateText(' ', outputEntrySize.width - stripAnsi(blockLine).length);
            }

            serializedLines[index] += blockLine + padding;
        });

        if (padLines) {
            for (var i = blockLines.length; i < serializedLines.length; i += 1) {
                var padding = duplicateText(' ', outputEntrySize.width);
                serializedLines[i] += padding;
            }
        }

        startIndex += outputEntrySize.width;
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
