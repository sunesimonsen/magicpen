function duplicateText(content, times) {
    var result = '';
    for (var i = 0; i < times; i += 1) {
        result += content;
    }
    return result;
}

module.exports = duplicateText;
