/*global describe, it, beforeEach*/
var magicpen = require('..');
var expect = require('unexpected');
var sinon = require('sinon');
expect.installPlugin(require('unexpected-sinon'));

describe('magicpen', function () {
    var pen;

    beforeEach(function () {
        pen = magicpen();
    });

    function forEach(arr, callback, that) {
        for (var i = 0, n = arr.length; i < n; i += 1)
            if (i in arr)
                callback.call(that, arr[i], i, arr);
    }

    function writeComplicatedExampleWithPen(pen) {
        pen.addStyle('dragon', function (author) {
            this.gray("          /           /").nl()
                .gray("         /' .,,,,  ./").nl()
                .gray("        /';'     ,/").nl()
                .gray("       / /   ,,//,`'`").nl()
                .gray("      ( ,, '_,  ,,,' ``").nl()
                .gray("      |    /").red("@").gray("  ,,, ;\" `").nl()
                .gray("     /    .   ,''/' `,``").nl()
                .gray("    /   .     ./, `,, ` ;").nl()
                .gray(" ,./  .   ,-,',` ,,/''\\,'").nl()
                .gray("|   /; ./,,'`,,'' |   |").nl()
                .gray("|     /   ','    /    |").nl()
                .gray(" \\___/'   '     |     |").nl()
                .gray("   `,,'  |      /     `\\").nl()
                .gray("        /      |        ~\\").nl()
                .gray("       '       (").nl()
                .gray("      :").nl()
                .gray("     ; .         \\--").nl()
                .gray("   :   \\         ; ").blue(author);
        });
        pen.blue('This').sp().red('will').nl()
            .green('output').sp().yellow('a').sp().cyan('dragon:')
            .sp().block(pen.clone().dragon('Ooyamaneko')).append(
                pen.clone().nl(2).text('stolen from the interwebs.'))
            .prependLinesWith(pen.clone().text('  '));
        return pen;
    }

    it('throws when creating a custom style with a name that already exists', function () {
        forEach(['red', 'write', 'addStyle'], function (name) {
            expect(function () {
                magicpen().addStyle(name, function () {});
            }, 'to throw', '"' + name + '" style is already defined, set 3rd arg (allowRedefinition) to true to define it anyway');
        });
    });

    it('allows redefining a style if allowRedefinition is set to true', function () {
        forEach(['red', 'write', 'addStyle'], function (name) {
            magicpen().addStyle(name, function () {}, true);
        });
    });

    it('throw when prepending lines with multi line pen', function () {
        expect(function () {
            var multiLinePen = magicpen().text('Multiple').nl().text('Lines');
            magicpen().text('Hello').nl().text('world').prependLinesWith(multiLinePen);
        }, 'to throw', 'PrependLinesWith only supports a pen with single line content');
    });

    describe('installPlugin', function () {
        it('calls the given plugin with the magicpen instance as the parameter', function (done) {
            var pen = magicpen();
            var plugin = function (magicpenInstance) {
                expect(magicpenInstance, 'to be', pen);
                done();
            };
            pen.installPlugin(plugin);
        });

        it('throws if the given arguments is not a function', function () {
            expect(function () {
                magicpen().installPlugin({});
            }, 'to throw', 'Expected first argument given to installPlugin to be a function');
        });
    });

    describe('block', function () {
        it('all lines in the block are indented', function () {
            pen.red('Hello').block(
                pen.clone()
                    .gray(' // ').text('This is a').nl()
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment'));
            expect(pen.toString(), 'to equal',
                   'Hello // This is a\n' +
                   '      //   multiline comment');
        });

        it('can be called with a function as argument', function () {
            pen.red('Hello').block(function () {
                this.gray(' // ').text('This is a').nl()
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment');
            });
            expect(pen.toString(), 'to equal',
                   'Hello // This is a\n' +
                   '      //   multiline comment');
        });
    });

    describe('append', function () {
        it('appends the given pen to the end of the output', function () {
            pen.text('Hello').sp().append(
                pen.clone()
                    .red('world!'));
            expect(pen.toString(), 'to equal',
                   'Hello world!');
        });

        it('can be called with a function as argument', function () {
            pen.text('Hello').sp().append(function () {
                this.red('world!');
            });
            expect(pen.toString(), 'to equal',
                   'Hello world!');
        });
    });

    describe('prependLinesWith', function () {
        it('prepends all lines with the the content of the given pen', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(pen.clone().gray(' // '));

            expect(pen.toString(), 'to equal',
                   ' // First line\n' +
                   ' // Second line\n' +
                   ' //   Third line');
        });

        it('can be called with a function as argument', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(function () {
                    this.gray(' // ');
                });

            expect(pen.toString(), 'to equal',
                   ' // First line\n' +
                   ' // Second line\n' +
                   ' //   Third line');
        });
    });

    describe('in text mode', function () {
        it('ignores unknown styles', function () {
            pen.text('>').write('test', 'text').text('<');
            expect(pen.toString(), 'to equal', '><');
        });

        it('handles multi line output', function () {
            pen.red('Hello').nl().green('world');
            expect(pen.toString(), 'to equal', 'Hello\nworld');
        });

        it('handles multi line input', function () {
            pen.red('Hello\nworld');
            expect(pen.toString(), 'to equal', 'Hello\nworld');
        });

        it('handles indented lines', function () {
            pen.red('Hello').nl()
                .indentLines()
                .indent().text('beautiful').nl()
                .outdentLines()
                .green('world');
            expect(pen.toString(), 'to equal',
                   'Hello\n' +
                   '  beautiful\n' +
                   'world');
        });

        it('gutter can be set for and reset', function () {
            pen.red('Hello').nl()
                .indentLines()
                .indent().text('beautiful').nl()
                .outdentLines()
                .green('world');
            expect(pen.toString(), 'to equal',
                   'Hello\n' +
                   '  beautiful\n' +
                   'world');
        });

        it('styles an be called as methods', function () {
            pen.red('Hello').sp().green('world').text('!', 'red, bold');
            expect(pen.toString(), 'to equal', 'Hello world!');
        });

        it('the content of a pen can be appended in a block', function () {
            pen.red('Hello').block(
                pen.clone()
                    .gray(' // ').text('This is a').nl()
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment'));
            expect(pen.toString(), 'to equal',
                   'Hello // This is a\n' +
                   '      //   multiline comment');
        });

        it('the content of a pen can be appended to the end of the output', function () {
            pen.text('Hello').sp().append(
                pen.clone()
                    .red('world!'));
            expect(pen.toString(), 'to equal',
                   'Hello world!');
        });

        it('the content of a pen can be prepended to the start of each line', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(pen.clone().gray(' // '));

            expect(pen.toString(), 'to equal',
                   ' // First line\n' +
                   ' // Second line\n' +
                   ' //   Third line');
        });

        it('handles custom styles', function () {
            pen.addStyle('error', function (text) {
                this.red(text);
            });

            pen.error('Danger').sp().error('danger');
            expect(pen.toString(), 'to equal',
                   'Danger danger');
        });

        it('knows the size of the output', function () {
            writeComplicatedExampleWithPen(pen);
            expect(pen.size(), 'to equal', { height: 21, width: 48 });
        });

        it('is capable of removing text formatting from the output', function () {
            pen.red('Hello').sp().green('world');
            expect(pen.removeFormatting().toString('text'), 'to equal',
                   'Hello world');
        });
    });

    describe('in ansi mode', function () {
        beforeEach(function () {
            pen = magicpen();
        });

        it('ignores unknown styles', function () {
            pen.text('>').write('test', 'text').text('<');
            expect(pen.toString('ansi'), 'to equal', '><');
        });

        it('handles multi line output', function () {
            pen.red('Hello').nl().green('world');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mHello\x1B[39m' +
                   '\n' +
                   '\x1B[32mworld\x1B[39m');
        });

        it('handles multi line input', function () {
            pen.red('Hello\nworld');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mHello\x1B[39m' +
                   '\n' +
                   '\x1B[31mworld\x1B[39m');
        });

        it('handles indented lines', function () {
            pen.red('Hello').nl()
                .indentLines()
                .indent().text('beautiful').nl()
                .outdentLines()
                .green('world');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mHello\x1B[39m\n' +
                   '  beautiful\n' +
                   '\x1B[32mworld\x1B[39m');
        });

        it('handles custom styles', function () {
            pen.addStyle('error', function (text) {
                this.red(text);
            });

            pen.error('Danger').sp().write('error', 'danger');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mDanger\x1B[39m \x1B[31mdanger\x1B[39m');
        });

        it('the content of a pen can be appended in a block', function () {
            pen.red('Hello').block(
                pen.clone()
                    .gray(' // ').text('This is a').nl()
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment'));
            expect(pen.toString('ansi'), 'to equal',
                   '\u001b[31mHello\u001b[39m\u001b[90m // \u001b[39mThis is a\n' +
                   '     \u001b[90m // \u001b[39m  multiline comment');
        });


        it('styles an be called as methods', function () {
            pen.red('Hello').sp().green('world').text('!', 'red, bold');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mHello\x1B[39m' +
                   ' ' +
                   '\x1B[32mworld\x1B[39m' +
                   '\x1B[1m\x1B[31m!\x1B[39m\x1B[22m');
        });

        it('knows the size of the output', function () {
            writeComplicatedExampleWithPen(pen);
            expect(pen.size(), 'to equal', { height: 21, width: 48 });
        });

        it('converts RGB colors to ansi colors', function () {
            pen.text('Hello world', '#bada55');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1b[33m\x1b[38;5;192mHello world\x1b[39m');
        });

        it('converts RGB background colors to ansi colors', function () {
            pen.text('Hello world', 'bg#333');
            expect(pen.toString('ansi'), 'to equal',
                  '\x1b[40m\x1b[48;5;236mHello world\x1b[49m' );
        });

        it('is capable of removing text formatting from the output', function () {
            pen.red('Hello').sp().green('world');
            expect(pen.removeFormatting().toString('ansi'), 'to equal',
                   'Hello world');
        });
    });

    describe('in html mode', function () {
        beforeEach(function () {
            pen = magicpen();
        });

        it('ignores unknown styles', function () {
            pen.text('>').write('test', 'text').text('<');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div>&gt;&lt;</div>\n' +
                   '</div>'
                  );
        });

        it('styles an be called as methods', function () {
            pen.red('Hello').sp().green('world').text('!', 'red, bold');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: red">Hello</span>' +
                   '&nbsp;' +
                   '<span style="color: green">world</span>' +
                   '<span style="color: red; font-weight: bold">!</span></div>\n' +
                   '</div>');
        });

        it('handles multi line output', function () {
            pen.red('Hello').nl().green('world');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: red">Hello</span></div>\n' +
                   '  <div><span style="color: green">world</span></div>\n' +
                   '</div>');
        });

        it('handles multi line input', function () {
            pen.red('Hello\nworld');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: red">Hello</span></div>\n' +
                   '  <div><span style="color: red">world</span></div>\n' +
                   '</div>');
        });

        it('handles indented lines', function () {
            pen.red('Hello').nl()
                .indentLines()
                .indent().text('beautiful').nl()
                .outdentLines()
                .green('world');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: red">Hello</span></div>\n' +
                   '  <div>&nbsp;&nbsp;beautiful</div>\n' +
                   '  <div><span style="color: green">world</span></div>\n' +
                   '</div>');
        });

        it('encodes text inserted in tags', function () {
            pen.red('<foo & "bar">');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: red">&lt;foo&nbsp;&amp;&nbsp;&quot;bar&quot;&gt;</span></div>\n' +
                   '</div>');
        });

        it('handles custom styles', function () {
            pen.addStyle('error', function (text) {
                this.red(text);
            });

            pen.error('Danger').sp().write('error', 'danger');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: red">Danger</span>&nbsp;<span style="color: red">danger</span></div>\n' +
                   '</div>');
        });

        it('the content of a pen can be appended to the end of the output', function () {
            pen.text('Hello').sp().append(
                pen.clone()
                    .red('world!'));
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div>Hello&nbsp;<span style="color: red">world!</span></div>\n' +
                   '</div>');
        });

        it('the content of a pen can be prepended to the start of each line', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(pen.clone().gray(' // '));

            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>First&nbsp;line</div>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>Second&nbsp;line</div>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>&nbsp;&nbsp;Third&nbsp;line</div>\n' +
                   '</div>');
        });

        it('the content of a pen can be appended in a block', function () {
            pen.red('Hello').block(
                pen.clone()
                    .gray(' // ').text('This is a').nl()
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment'));
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: red">Hello</span><div style="display: inline-block; vertical-align: top"><div style="font-family: monospace">\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>This&nbsp;is&nbsp;a</div>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>&nbsp;&nbsp;multiline&nbsp;comment</div>\n' +
                   '</div></div></div>\n' +
                   '</div>');
        });

        it('knows the size of the output', function () {
            writeComplicatedExampleWithPen(pen);
            expect(pen.size(), 'to equal', { height: 21, width: 48 });
        });

        it('supports RGB text colors', function () {
            pen.text('Hello world', '#bada55');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: #bada55">Hello&nbsp;world</span></div>\n' +
                   '</div>');
        });

        it('supports RGB background colors', function () {
            pen.text('Hello world', 'bg#333');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div><span style="background-color: #333">Hello&nbsp;world</span></div>\n' +
                   '</div>');
        });

        it('is capable of removing text formatting from the output', function () {
            pen.red('Hello').sp().green('world');
            expect(pen.removeFormatting().toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div>Hello&nbsp;world</div>\n' +
                   '</div>');
        });
    });

    describe('aliases', function () {
        forEach(['space', 'sp'], function (methodName) {
            it(methodName + '() is an alias for text(" ")', function () {
                pen.text = sinon.spy();
                pen[methodName]();
                expect(pen.text, 'was called with', ' ');
            });

            it(methodName + '(1) is an alias for text(" ")', function () {
                pen.text = sinon.spy();
                pen[methodName](1);
                expect(pen.text, 'was called with', ' ');
            });

            it(methodName + '(2) is an alias for text("  ")', function () {
                pen.text = sinon.spy();
                pen[methodName](2);
                expect(pen.text, 'was called with', '  ');
            });
        });

        forEach([
            'bold', 'dim', 'italic', 'underline', 'inverse', 'hidden',
            'strikeThrough', 'black', 'red', 'green', 'yellow',
            'blue', 'magenta', 'cyan', 'white', 'gray', 'bgBlack',
            'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta',
            'bgCyan', 'bgWhite'
        ], function (textStyle) {
            it(textStyle + '(content) is an alias for text(content, "' + textStyle + '")', function () {
                pen.text = sinon.spy();
                pen[textStyle]('test');
                expect(pen.text, 'was called with', 'test', textStyle);
            });
        });
    });

    describe('Rainbow example', function () {
        var rainbowColors = ['gray', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
        function writeRainbowWithPen(pen) {
            pen.addStyle('rainbow', function (text) {
                for (var i = 0; i < text.length; i += 1) {
                    var color = rainbowColors[i % rainbowColors.length];
                    this.text(text[i], color);
                }
            });

            pen.rainbow('Hello world');
        }

        it('in text mode', function () {
            var pen = magicpen();
            writeRainbowWithPen(pen);
            expect(pen.toString(), 'to equal', 'Hello world');
        });

        it('in ansi mode', function () {
            var pen = magicpen();
            writeRainbowWithPen(pen);
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[90mH\x1B[39m' +
                   '\x1B[31me\x1B[39m' +
                   '\x1B[32ml\x1B[39m' +
                   '\x1B[33ml\x1B[39m' +
                   '\x1B[34mo\x1B[39m' +
                   '\x1B[35m \x1B[39m' +
                   '\x1B[36mw\x1B[39m' +
                   '\x1B[90mo\x1B[39m' +
                   '\x1B[31mr\x1B[39m' +
                   '\x1B[32ml\x1B[39m' +
                   '\x1B[33md\x1B[39m');
        });

        it('in html mode', function () {
            var pen = magicpen();
            writeRainbowWithPen(pen);
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace">\n' +
                   '  <div>' +
                   '<span style="color: gray">H</span>' +
                   '<span style="color: red">e</span>' +
                   '<span style="color: green">l</span>' +
                   '<span style="color: yellow">l</span>' +
                   '<span style="color: blue">o</span>' +
                   '<span style="color: magenta">&nbsp;</span>' +
                   '<span style="color: cyan">w</span>' +
                   '<span style="color: gray">o</span>' +
                   '<span style="color: red">r</span>' +
                   '<span style="color: green">l</span>' +
                   '<span style="color: yellow">d</span></div>\n' +
                   '</div>');
        });
    });

    describe('Recursive custom style example', function () {
        function writeObjectWithPen(pen) {
            pen.addStyle('object', function (obj) {
                if (obj && typeof obj === 'object') {
                    this.text('{').nl()
                        .indentLines();
                    var keys = [];
                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            keys.push(prop);
                        }
                    }
                    for (var i = 0; i < keys.length; i += 1) {
                        var key = keys[i];
                        this.i().cyan(key).text(': ').object(obj[key]);
                        if (i < keys.length - 1) {
                            this.text(',');
                        }
                        this.nl();
                    }
                    this.outdentLines()
                        .i().text('}');
                } else if (typeof obj === 'string') {
                    this.yellow('"' + obj + '"');
                } else {
                    this.text(obj);
                }
            });

            pen.object({
                1337: 'leet',
                3: {
                    37: 'eet',
                    7: 'et'
                },
                7: 't'
            });
        }

        it('in text mode', function () {
            var pen = magicpen();
            writeObjectWithPen(pen);
            expect(pen.toString(), 'to equal',
                   '{\n' +
                   '  3: {\n' +
                   '    7: "et",\n' +
                   '    37: "eet"\n' +
                   '  },\n' +
                   '  7: "t",\n' +
                   '  1337: "leet"\n' +
                   '}');
        });
    });

    describe('Fib example', function () {
        function writeFibWithPen(pen) {
            pen.keyword('function').sp().functionName('fib').text(' {').nl()
                .indentLines()
                    .i().keyword('var').text(' i=0, fibs = [').number(0).text(', ').number(1).text('];').nl()
                    .i().keyword('for').text(' (; i < n; i += ').number(1).text(') {').nl()
                    .indentLines()
                        .i().text('fibs.push(fibs[').number(0).text('] + fibs[').number(1).text(']);').nl()
                        .i().text('fibs.shift();').nl()
                    .outdentLines()
                    .i().text('}').nl()
                    .i().keyword('return').text(' fibs[').number(0).text('];').nl()
                .outdentLines()
                .text('}');
        }

        it('in text mode', function () {
            var pen = magicpen();
            pen.addStyle('keyword', function (text) {
                this.text(text);
            });
            pen.addStyle('functionName', function (text) {
                this.text(text);
            });
            pen.addStyle('number', function (text) {
                this.text(text);
            });
            writeFibWithPen(pen);
            expect(pen.toString(), 'to equal',
                   'function fib {\n' +
                   '  var i=0, fibs = [0, 1];\n' +
                   '  for (; i < n; i += 1) {\n' +
                   '    fibs.push(fibs[0] + fibs[1]);\n' +
                   '    fibs.shift();\n' +
                   '  }\n' +
                   '  return fibs[0];\n' +
                   '}');
        });

        it('in ansi mode', function () {
            var pen = magicpen();
            pen.addStyle('keyword', function (text) {
                this.text(text, 'blue, bold');
            });
            pen.addStyle('functionName', function (text) {
                this.text(text, 'white, bold');
            });
            pen.addStyle('number', function (text) {
                this.text(text, 'cyan');
            });
            writeFibWithPen(pen);
            expect(pen.toString('ansi'), 'to equal',
                   '\u001b[1m\u001b[34mfunction\u001b[39m\u001b[22m \u001b[1m\u001b[37mfib\u001b[39m\u001b[22m {\n' +
                   '  \u001b[1m\u001b[34mvar\u001b[39m\u001b[22m i=0, fibs = [\u001b[36m0\u001b[39m, \u001b[36m1\u001b[39m];\n' +
                   '  \u001b[1m\u001b[34mfor\u001b[39m\u001b[22m (; i < n; i += \u001b[36m1\u001b[39m) {\n' +
                   '    fibs.push(fibs[\u001b[36m0\u001b[39m] + fibs[\u001b[36m1\u001b[39m]);\n' +
                   '    fibs.shift();\n' +
                   '  }\n' +
                   '  \u001b[1m\u001b[34mreturn\u001b[39m\u001b[22m fibs[\u001b[36m0\u001b[39m];\n' +
                   '}');
        });

        it('in html mode', function () {
            var pen = magicpen();
            pen.addStyle('keyword', function (text) {
                this.text(text, 'black, bold');
            });
            pen.addStyle('functionName', function (text) {
                this.text(text, 'red, bold');
            });
            pen.addStyle('number', function (text) {
                this.text(text, 'cyan');
            });
            writeFibWithPen(pen);
            expect(pen.toString('html'), 'to equal', '<div style="font-family: monospace">\n' +
                   '  <div><span style="color: black; font-weight: bold">function</span>&nbsp;<span style="color: red; font-weight: bold">fib</span>&nbsp;{</div>\n' +
                   '  <div>&nbsp;&nbsp;<span style="color: black; font-weight: bold">var</span>&nbsp;i=0,&nbsp;fibs&nbsp;=&nbsp;[<span style="color: cyan">0</span>,&nbsp;<span style="color: cyan">1</span>];</div>\n' +
                   '  <div>&nbsp;&nbsp;<span style="color: black; font-weight: bold">for</span>&nbsp;(;&nbsp;i&nbsp;&lt;&nbsp;n;&nbsp;i&nbsp;+=&nbsp;<span style="color: cyan">1</span>)&nbsp;{</div>\n' +
                   '  <div>&nbsp;&nbsp;&nbsp;&nbsp;fibs.push(fibs[<span style="color: cyan">0</span>]&nbsp;+&nbsp;fibs[<span style="color: cyan">1</span>]);</div>\n' +
                   '  <div>&nbsp;&nbsp;&nbsp;&nbsp;fibs.shift();</div>\n' +
                   '  <div>&nbsp;&nbsp;}</div>\n' +
                   '  <div>&nbsp;&nbsp;<span style="color: black; font-weight: bold">return</span>&nbsp;fibs[<span style="color: cyan">0</span>];</div>\n' +
                   '  <div>}</div>\n' +
                   '</div>');
        });
    });
});
