var utils = require('./utils');

function replaceSplittersInLine(line, delimiter) {
    return line.map(function (outputEntry) {
        switch (outputEntry.style) {
        case 'split': return { style: 'text', args: { content: delimiter } };
        case 'block': return { style: 'block', args: replaceSplittersInLines(outputEntry.args, delimiter) }
        default: return outputEntry;
        }
    })
}

function replaceSplittersInLines(lines, delimiter) {
    return lines.map(function (line) {
        return replaceSplittersInLine(line, delimiter);
    });
}

function squeezeLine(line, preferredWidth) {
    var lineWidth = utils.calculateLineSize(line).width;
    if (lineWidth.width <= preferredWidth) {
        return replaceSplittersInLine(line, ' ');
    } else {
        return replaceSplittersInLine(line, ' ');
    }
}

function squeezeLines(lines, preferredWidth) {
    return lines.map(function (line) {
        return squeezeLine(line, preferredWidth);
    });
}

module.exports = squeezeLines;
