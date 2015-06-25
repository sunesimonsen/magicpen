function RawContentConverter(serializer) {
    var that = this;

    that.convertOutputEntry = function(outputEntry) {
        var content = outputEntry.args[0];
        switch (outputEntry.style) {
        case 'raw':
            var format = serializer.format;
            if (format in content) {
                var result = content[format](serializer);
                if (result.isMagicPen) {
                    return { style: 'block', args: [that.convertLines(result.output)] };
                } else {
                    return { style: 'raw', args: [result] };
                }
            } else {
                return { style: 'block', args: [that.convertLines(content.fallback.output)] };
            }
            break;
        case 'block': return {
            style: 'block',
            args: [that.convertLines(content)]
        };
        default: return outputEntry;
        }
    };

    that.convertLine = function(line) {
        return line.map(that.convertOutputEntry);
    };

    that.convertLines = function(lines) {
        var that = this;
        return lines.map(that.convertLine);
    };
}

module.exports = RawContentConverter;
