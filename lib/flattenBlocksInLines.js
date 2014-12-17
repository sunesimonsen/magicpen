var utils = require('./utils');
var duplicateText = require('./duplicateText');

function createPadding(length) {
    return { style: 'text', args: [duplicateText(' ', length)] };
}

function lineContainsBlocks(line) {
    return line.some(function (outputEntry) {
        return outputEntry.style === 'block' ||
            (outputEntry.style === 'text' && String(outputEntry.args[0]).indexOf('\n') !== -1);
    });
}

function flattenBlocksInOutputEntry(outputEntry) {
    switch (outputEntry.style) {
    case 'text': return String(outputEntry.args[0]).split('\n').map(function (line) {
        var args = [line].concat(outputEntry.args.slice(1));
        return [{ style: 'text', args: args }];
    });
    case 'block': return flattenBlocksInLines(outputEntry.args[0]);
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

    var startIndex = 0;
    line.forEach(function (outputEntry, blockIndex) {
        var blockLines = flattenBlocksInOutputEntry(outputEntry);
        var blockLinesLengths = blockLines.map(function (line) {
            return utils.calculateLineSize(line).width;
        });

        var longestLineLength = Math.max.apply(null, blockLinesLengths);

        var padLines = blockIndex < line.length - 1;

        blockLines.forEach(function (blockLine, index) {
            if (!result[index]) {
                result[index] = [createPadding(startIndex)];
            }

            Array.prototype.push.apply(result[index], blockLine);

            var paddingLength = longestLineLength - blockLinesLengths[index];
            if (padLines && paddingLength > 0) {
                result[index].push(createPadding(paddingLength));
            }
        });

        if (padLines) {
            for (var i = blockLines.length; i < result.length; i += 1) {
                result[i].push(createPadding(longestLineLength));
            }
        }

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
