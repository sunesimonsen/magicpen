var cssStyles = {
    bold: 'font-weight: bold',
    dim: 'opacity: 0.7',
    italic: 'font-style: italic',
    underline: 'text-decoration: underline',
    inverse: '-webkit-filter: invert(%100); filter: invert(100%)',
    hidden: 'visibility: hidden',
    strikeThrough: 'text-decoration: line-through',

    black: 'color: black',
    red: 'color: red',
    green: 'color: green',
    yellow: 'color: yellow',
    blue: 'color: blue',
    magenta: 'color: magenta',
    cyan: 'color: cyan',
    white: 'color: white',
    gray: 'color: gray',

    bgBlack: 'background-color: black',
    bgRed: 'background-color: red',
    bgGreen: 'background-color: green',
    bgYellow: 'background-color: yellow',
    bgBlue: 'background-color: blue',
    bgMagenta: 'background-color: magenta',
    bgCyan: 'background-color: cyan',
    bgWhite: 'background-color: white'
};

Object.keys(cssStyles).forEach(function (styleName) {
    cssStyles[styleName.toLowerCase()] = cssStyles[styleName];
});

module.exports = cssStyles;
