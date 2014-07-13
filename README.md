# MagicPen

![This sucker is spraying unicorns and rainbows](images/magic-pen-6-colours.jpg "This sucker is spraying unicorns and rainbows")

Create composable extensible styled text in both consoles and
browsers.

## Installation

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install magicpen
```

Then:

```js
var magicpen = require('magicpen');
pen = magicpen('ansi');
pen.red('Hello').sp().green('world!');
console.log(pen.toString());
```

### Browser

Include `magicpen.js`.

```html
<script src="magicpen.js"></script>
```

this will expose the `magicpen` function under the following namespace:

```js
var expect = weknowhow.magicpen;
pen.red('Hello').sp().green('world!');
console.log(pen.toString());
```

### RequireJS

Include the library with RequireJS the following way:

```js
require.config({
    paths: {
        magicpen: 'path/to/magicpen
    }
});

define(['magicpen'], function (expect) {
    pen = magicpen('ansi');
    pen.red('Hello').sp().green('world!');
    console.log(pen.toString());
});
```

## Usage

You create a new `magicpen` instance by calling the `magicpen`
function. The function takes one parameter, the output mode. By
default the `plain` mode is console output without colors. You can
also choose the `ansi` mode or the `html` mode. The `ansi` mode will
format the output for the console with colors and basic styling. The
`html` mode will format the output in html with colors and basic
styling.

Let's try to create our first `magicpen` in `ansi` mode:

```js
magicpen('ansi');
pen.red('Hello').sp().green('world!');
console.log(pen.toString());
```

The above snippet create a new `magicpen` in `ansi` mode and writes
_Hello_ in red, space and _world!_ in green and prints the formatted
output to the console. This will produce the following output:

![Hello world!](images/Hello world - ansi.png)

Let's try to create the same output but format it as html:

```js
magicpen('html');
pen.red('Hello').sp().green('world!');
document.getElementById('output').innerHTML = pen.toString();
```

You will get the following output it the browser:

![Hello world!](images/Hello world - html.png)

## API

### text(content, styleString...)

Append the given content to the output with the styles specified in the style strings.

*Supported styles are:*

Text properties: bold, dim, italic, underline, inverse, hidden, strikeThrough.

Foreground colors: black, red, green, yellow, blue, magenta, cyan, white, gray.

Background colors: bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite.

*Example:*

```js
var pen = magicpen('ansi');
pen.text('Hello', 'red')
   .text(' ')
   .text('colorful', 'yellow, bold')
   .text(' ')
   .text('world', 'green', 'underline')
   .text('!', 'bgYellow, blue');
console.log(pen.toString());
```

![Hello colorful world](images/Hello colorful world.png)

## Aliases

### bold(content)
Alias for `text(content, 'bold')`.

### dim(content)
Alias for `text(content, 'dim')`.

### italic(content)
Alias for `text(content, 'italic')`.

### underline(content)
Alias for `text(content, 'underline')`.

### inverse(content)
Alias for `text(content, 'inverse')`.

### hidden(content)
Alias for `text(content, 'hidden')`.

### strikeThrough(content)
Alias for `text(content, 'strikeThrough')`.

### black(content)
Alias for `text(content, 'black')`.

### red(content)
Alias for `text(content, 'red')`.

### green(content)
Alias for `text(content, 'green')`.

### yellow(content)
Alias for `text(content, 'yellow')`.

### blue(content)
Alias for `text(content, 'blue')`.

### magenta(content)
Alias for `text(content, 'magenta')`.

### cyan(content)
Alias for `text(content, 'cyan')`.

### white(content)
Alias for `text(content, 'white')`.

### gray(content)
Alias for `text(content, 'gray')`.

### bgBlack(content)
Alias for `text(content, 'bgBlack')`.

### bgRed(content)
Alias for `text(content, 'bgRed')`.

### bgGreen(content)
Alias for `text(content, 'bgGreen')`.

### bgYellow(content)
Alias for `text(content, 'bgYellow')`.

### bgBlue(content)
Alias for `text(content, 'bgBlue')`.

### bgMagenta(content)
Alias for `text(content, 'bgMagenta')`.

### bgCyan(content)
Alias for `text(content, 'bgCyan')`.

### bgWhite(content)
Alias for `text(content, 'bgWhite')`.
