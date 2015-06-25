var flattenBlocksInLines = require('./flattenBlocksInLines');

function TextSerializer() {}

TextSerializer.prototype.format = 'text';

TextSerializer.prototype.serialize = function (lines) {
    lines = flattenBlocksInLines(lines);
    return lines.map(this.serializeLine, this).join('\n');
};

TextSerializer.prototype.serializeLine = function (line) {
    return line.map(function (outputEntry) {
        return this[outputEntry.style] ?
            String(this[outputEntry.style].apply(this, outputEntry.args)) :
            '';
    }, this).join('');
};

TextSerializer.prototype.text = function (content) {
    return content;
};

TextSerializer.prototype.block = function (content) {
    return this.serialize(content);
};

TextSerializer.prototype.raw = function (content) {
    return String(content);
};


module.exports = TextSerializer;
