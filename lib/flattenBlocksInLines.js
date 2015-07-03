var utils = require('./utils');
var duplicateText = require('./duplicateText');

function createPadding(length) {
    return { style: 'text', args: { content: duplicateText(' ', length), styles: [] } };
}

function lineContainsBlocks(line) {
    return line.some(function (outputEntry) {
        return outputEntry.style === 'block' ||
            (outputEntry.style === 'text' && String(outputEntry.args.content).indexOf('\n') !== -1);
    });
}

function flattenBlocksInOutputEntry(outputEntry) {
    switch (outputEntry.style) {
    case 'text': return String(outputEntry.args.content).split('\n').map(function (line) {
        if (line === '') {
            return [];
        }

        var args = { content: line, styles: outputEntry.args.styles };
        return [{ style: 'text', args: args }];
    });
    case 'block': return flattenBlocksInLines(outputEntry.args);
    default: return [];
    }
}

function flattenBlocksInLine(line) {
    if (line.length === 0) {
       return [[]];
    }

    if (!lineContainsBlocks(line)) {
        return [line];
    }

    var result = [];
    var linesLengths = [];

    var startIndex = 0;
    line.forEach(function (outputEntry, blockIndex) {
        var blockLines = flattenBlocksInOutputEntry(outputEntry);

        var blockLinesLengths = blockLines.map(function (line) {
            return utils.calculateLineSize(line).width;
        });

        var longestLineLength = Math.max.apply(null, blockLinesLengths);

        blockLines.forEach(function (blockLine, index) {
            var resultLine = result[index];

            if (!resultLine) {
                result[index] = resultLine = [];
                linesLengths[index] = 0;
            }

            if (blockLine.length) {
                var paddingLength = startIndex - linesLengths[index];
                resultLine.push(createPadding(paddingLength));
                Array.prototype.push.apply(resultLine, blockLine);
                linesLengths[index] = startIndex + blockLinesLengths[index];
            }
        });

        startIndex += longestLineLength;
    }, this);
    return result;
}

function flattenBlocksInLines(lines) {
    var result = [];
    lines.forEach(function (line) {
        flattenBlocksInLine(line).forEach(function (line) {
            result.push(line);
        });
    });
    return result;
}

module.exports = flattenBlocksInLines;
