# MagicPen

![This sucker is spraying rainbows and unicorns right and left](images/magic-pen-6-colours.jpg "This sucker is spraying rainbows and unicorns right and left")

Create composable extensible styled text in both consoles and
browsers.

[![NPM version](https://badge.fury.io/js/magicpen.png)](http://badge.fury.io/js/magicpen)
[![Build Status](https://travis-ci.org/sunesimonsen/magicpen.png)](https://travis-ci.org/sunesimonsen/magicpen)
[![Coverage Status](https://coveralls.io/repos/sunesimonsen/magicpen/badge.png)](https://coveralls.io/r/sunesimonsen/magicpen)
[![Dependency Status](https://david-dm.org/sunesimonsen/magicpen.png)](https://david-dm.org/sunesimonsen/magicpen)

## Installation

### Node

Install it with NPM or add it to your `package.json`:

```
$ npm install magicpen
```

Then:

```js
var magicpen = require('magicpen');
var pen = magicpen();
pen.red('Hello').sp().green('world!');
console.log(pen.toString('ansi'));
```

### Browser

Include `magicpen.js`.

```html
<script src="magicpen.js"></script>
```

this will expose the `magicpen` function under the following namespace:

```js
var magicpen = weknowhow.magicpen;
var pen = magicpen();
pen.red('Hello').sp().green('world!');
document.getElementById('output').innerHTML = pen.toString('html');
```

### RequireJS

Include the library with RequireJS the following way:

```js
require.config({
    paths: {
        magicpen: 'path/to/magicpen'
    }
});

define(['magicpen'], function (magicpen) {
    var pen = magicpen();
    pen.red('Hello').sp().green('world!');
    document.getElementById('output').innerHTML = pen.toString('html');
});
```

## Usage

You create a new `magicpen` instance by calling the `magicpen`
function. Then you can use methods on the instance to append content to
the output. Finally when you created the desired output you can
serialize it to plain `text`, `ansi` encoded text or `html`.

Let's try to create our first `magicpen` and serialize the output to
text to `ansi` encoding:

```js
var pen = magicpen();
pen.red('Hello').sp().green('world!');
console.log(pen.toString('ansi'));
```

The above snippet create a new `magicpen` and writes _Hello_ in red,
space and _world!_ in green and prints the formatted output to the
console. This will produce the following output:

![Hello world!](images/Hello world - ansi.png)

Let's try to create the same output but format it as html:

```js
var pen = magicpen();
pen.red('Hello').sp().green('world!');
document.getElementById('output').innerHTML = pen.toString('html');
```

You will get the following output it the browser:

![Hello world!](images/Hello world - html.png)

## API

### magicpen(options) or new MagicPen(options)

Creates a new instance of MagicPen with the given options.

Currently there is only on option: `indentationWidth` which defaults
to 2.

Example:

```js
// Pen with indentation width 2
magicpen();
// Pen with indentation width 4
magicpen({ indentationWidth: 4 });
```

### text(content, styleString...)

Append the given content to the output with the styles specified in the style strings.

#### Supported styles are:

*Text properties*:

![Text properties](images/text_properties.png)

*Foreground colors*:

![Foreground colors](images/text_colors.png)

*Background colors*:

![Background colors](images/background_colors.png)

#### Example:

```js
var pen = magicpen();
pen.text('Hello', 'red')
   .text(' ')
   .text('colorful', 'yellow, bold')
   .text(' ')
   .text('world', 'green', 'underline')
   .text('!', 'bgYellow, blue');
console.log(pen.toString('ansi'));
```

![Hello colorful world](images/Hello colorful world.png)

Notice that special characters might get escaped by this method. The
example below shows how special html characters is escaped by the html
format.

```js
var pen = magicpen();
pen.text('<strong>Hello world!</strong>');
expect(pen.toString('html'), 'to equal',
    '<code>\n' +
    '  <div>&lt;strong&gt;Hello&nbsp;world!&lt;/strong&gt;</div>\n' +
    '</code>');
```

### toString(format = 'text')

Returns the content of the pen in the specified format.

Accepted formats are `text`, `ansi` and `html`.

### newline(count = 1), nl(count = 1)

Starts the given number of new lines.

### Indentation

Example:

```js
pen.text('Hello').nl()
    .indentLines()
        .indent().text('beautiful').nl()
    .outdentLines()
    .text('world');
expect(pen.toString(), 'to equal',
    'Hello\n' +
    '  beautiful\n' +
    'world');
```

#### indentLines()

Increments the indentation level.

#### outdentLines()

Decrements the indentation level.

#### indent(), i()

Appends the indentation to the output.

#### indentationWidth

You can control the indentation size by setting `indentationWidth`
option when creating the pen.


```js
var pen = magicpen({ indentationWidth: 4 });
```

### append(pen)

Appends the content of the given pen to the end of this pen.

Example:

```js
var pen = magicpen();
var otherPen = pen.clone().text('world!');
pen.text('Hello').sp().append(otherPen);
expect(pen.toString(), 'to equal', 'Hello world!');
```

### block(pen)

Appends the content of the given pen to the end of this pen in an
inline block.

Example:

```js
var pen = magicpen();
var otherPen = pen.clone()
    .text(' // This is a').nl()
    .text(' // multiline block');
pen.text('Text before block').block(otherPen);
expect(pen.toString(), 'to equal',
    'Text before block // This is a\n' +
    '                  // multiline block');
```

### prependLinesWith(pen)

Prepends each line of this pen with the content of the given pen.

Example:

```js
var pen = magicpen();
var otherPen = pen.clone().text('> ');
pen.text('Line').nl()
   .text('after line').nl()
   .text('after line');
expect(pen.toString(), 'to equal',
    '> Line\n' +
    '> after line\n' +
    '> after line');
```

### size()

Returns the dimensions of the content of this pen.

Example:

```js
var pen = magicpen();
pen.text('First line').nl()
   .text('Second line');
expect(pen.size(), 'to equal', {
    height: 2,
    width: 11
});
```

### clone()

Returns a clone of the current pen with an empty output buffer. This
operation is very cheap, so don't hesitate to use it when it makes
sense.

### addStyle(style, handler)

Defines a new style for the magicpen. The usage is best explained by
an example:

```js
var pen = magicpen();

pen.addStyle('rainbow', function (text, rainbowColors) {
    rainbowColors = rainbowColors ||
        ['gray', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
    for (var i = 0; i < text.length; i += 1) {
        var color = rainbowColors[i % rainbowColors.length];
        this.text(text[i], color);
    }
});

pen.rainbow('The unicorns are flying low today').nl();
   .rainbow('The unicorns are flying low today', ['green', 'red', 'cyan']);
console.log(pen.toString('ansi'));
```

![The unicors are flying low today](images/rainbows.png)

As you can see in the example above, a custom style can produce any
kind of output using an instance of a magicpen.

### removeFormatting()

Creates a new pen with the content of this pen where all text formatting is removed.

Example:

```js
var pen = magicpen();
pen.red('Hello').sp().green('world');
console.log(pen.toString('ansi'));
console.log(pen.removeFormatting().toString('ansi'));
```

![Remove text formatting](images/Hello world - removeFormatting.png)

### installPlugin(plugin)

MagicPen plugins are just functions that uses the `addStyle`
method to add new custom styles to the MagicPen instance.

```js
var pen = magicpen();
function starPlugin(pen) {
    pen.addStyle('stars', function (content) {
        this.text(String(content).replace(/./g, '*'));
    });
}
pen.installPlugin(starPlugin);
pen.stars('secret');
expect(pen.toString(), 'to equal', '******');
```

## Aliases

### space(count = 1), sp(count = 1)
Alias for `text(duplicate(' ', count))`.

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

## License

MIT, see the `LICENSE` file for details.
