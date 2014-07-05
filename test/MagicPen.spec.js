/*global describe, it, beforeEach, before*/
var MagicPen = require('../MagicPen');
var expect = require('unexpected');

describe('MagicPen', function () {
    var pen;

    describe('in plain mode', function () {
        beforeEach(function () {
            pen = new MagicPen();
        });

        describe('write', function () {
            describe('when given one argument', function () {
                it('appends the given text to the output', function () {
                    pen.write('Hello');
                    pen.write(' ');
                    pen.write('world');
                    expect(pen.toString(), 'to equal', 'Hello world');
                });
            });

            describe('when given a style as the first argument', function () {
                it('appends the given text to the output with the specified styles', function () {
                    pen.write('red', 'Hello');
                    pen.write(' ');
                    pen.write('green', 'world');
                    expect(pen.toString(), 'to equal', 'Hello world');
                });
            });

            it('handles multi line output', function () {
                pen.red('Hello').nl().green('world');
                expect(pen.toString(), 'to equal', 'Hello\nworld');
            });

            it('handles indented lines', function () {
                pen.red('Hello')
                   .indentLines()
                   .indent().text('beautiful')
                   .outdentLines()
                   .green('world');
                expect(pen.toString(), 'to equal',
                       'Hello\n' +
                       '  beautiful\n' +
                       'world');
            });

            it('gutter can be set for and reset', function () {
                pen.red('Hello')
                   .indentLines()
                   .indent().text('beautiful')
                   .outdentLines()
                   .green('world');
                expect(pen.toString(), 'to equal',
                       'Hello\n' +
                       '  beautiful\n' +
                       'world');
            });

            it('styles an be called as methods', function () {
                pen.red('Hello').sp().green('world').write('red, bold', '!');
                expect(pen.toString(), 'to equal', 'Hello world!');
            });

            it('the content of a pen can be appended in a block', function () {
                pen.red('Hello').block(
                    pen.clone()
                        .gray(' // ').text('This is a')
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
                   .text('Second line')
                   .indentLines()
                   .indent().text('Third line')
                   .prependLinesWith(pen.clone().gray(' // '));

                expect(pen.toString(), 'to equal',
                       ' // First line\n' +
                       ' // Second line\n' +
                       ' //   Third line');
            });
        });
    });

    describe('in ansi mode', function () {
        beforeEach(function () {
            pen = new MagicPen('ansi');
        });

        describe('write', function () {
            describe('when given one argument', function () {
                it('appends the given text to the output', function () {
                    pen.write('Hello');
                    pen.write(' ');
                    pen.write('world');
                    expect(pen.toString(), 'to equal', 'Hello world');
                });
            });

            describe('when given a style as the first argument', function () {
                it('appends the given text to the output with the specified styles', function () {
                    pen.write('red', 'Hello');
                    pen.write(' ');
                    pen.write('green', 'world');
                    expect(pen.toString(), 'to equal', '\x1B[31mHello\x1B[39m \x1B[32mworld\x1B[39m');
                });
            });

            it('handles multi line output', function () {
                pen.red('Hello').nl().green('world');
                expect(pen.toString(), 'to equal',
                       '\x1B[31mHello\x1B[39m' +
                       '\n' +
                       '\x1B[32mworld\x1B[39m');
            });

            it('handles indented lines', function () {
                pen.red('Hello')
                   .indentLines()
                   .indent().text('beautiful')
                   .outdentLines()
                   .green('world');
                expect(pen.toString(), 'to equal',
                       '\x1B[31mHello\x1B[39m\n' +
                       '  beautiful\n' +
                       '\x1B[32mworld\x1B[39m');
            });

            it('styles an be called as methods', function () {
                pen.red('Hello').sp().green('world').text('!', 'red, bold');
                expect(pen.toString(), 'to equal',
                       '\x1B[31mHello\x1B[39m' +
                       ' ' +
                       '\x1B[32mworld\x1B[39m' +
                       '\x1B[1m\x1B[31m!\x1B[39m\x1B[22m');
            });
        });
    });

    describe('in html mode', function () {
        beforeEach(function () {
            pen = new MagicPen('html');
        });

        describe('write', function () {
            describe('when given one argument', function () {
                it('appends the given text to the output', function () {
                    pen.write('Hello');
                    pen.write(' ');
                    pen.write('world');
                    expect(pen.toString(), 'to equal',
                           '<code>\n' +
                           '  <div>Hello&nbsp;world</div>\n' +
                           '</code>');
                });
            });

            describe('when given a style as the first argument', function () {
                it('appends the given text to the output with the specified styles', function () {
                    pen.write('red', 'Hello');
                    pen.write(' ');
                    pen.write('green', 'world');
                    expect(pen.toString(), 'to equal',
                           '<code>\n' +
                           '  <div><span style="color: red">Hello</span>&nbsp;<span style="color: green">world</span></div>\n' +
                           '</code>');
                });
            });
        });

        it('styles an be called as methods', function () {
            pen.red('Hello').sp().green('world').text('!', 'red, bold');
            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div><span style="color: red">Hello</span>' +
                   '&nbsp;' +
                   '<span style="color: green">world</span>' +
                   '<span style="color: red; font-weight: bold">!</span></div>\n' +
                   '</code>');
        });

        it('handles multi line output', function () {
            pen.red('Hello').nl().green('world');
            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div><span style="color: red">Hello</span></div>\n' +
                   '  <div><span style="color: green">world</span></div>\n' +
                   '</code>');
        });

        it('handles indented lines', function () {
            pen.red('Hello')
               .indentLines()
               .indent().text('beautiful')
               .outdentLines()
               .green('world');
            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div><span style="color: red">Hello</span></div>\n' +
                   '  <div>&nbsp;&nbsp;beautiful</div>\n' +
                   '  <div><span style="color: green">world</span></div>\n' +
                   '</code>');
        });

        it('encodes text inserted in tags', function () {
            pen.red('<foo & "bar">');
            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div><span style="color: red">&lt;foo&nbsp;&amp;&nbsp;&quot;bar&quot;&gt;</span></div>\n' +
                   '</code>');
        });

        it('handles custom styles', function () {
            pen.addStyle('error', function (text) {
                this.red(text);
            });

            pen.error('Danger').sp().write('error', 'danger');
            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div><span style="color: red">Danger</span>&nbsp;<span style="color: red">danger</span></div>\n' +
                   '</code>');
        });

        it('the content of a pen can be appended to the end of the output', function () {
            pen.text('Hello').sp().append(
                pen.clone()
                    .red('world!'));
            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div>Hello&nbsp;<span style="color: red">world!</span></div>\n' +
                   '</code>');
        });

        it('the content of a pen can be prepended to the start of each line', function () {
            pen.text('First line').nl()
                .text('Second line')
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(pen.clone().gray(' // '));

            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>First&nbsp;line</div>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>Second&nbsp;line</div>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>&nbsp;&nbsp;Third&nbsp;line</div>\n' +
                   '</code>');
        });

        it('the content of a pen can be appended in a block', function () {
            pen.red('Hello').block(
                pen.clone()
                    .gray(' // ').text('This is a')
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment'));
            expect(pen.toString(), 'to equal',
                   '<code>\n' +
                   '  <div><span style="color: red">Hello</span><div style="display: inline-block; vertical-align: top"><code>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>This&nbsp;is&nbsp;a</div>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>&nbsp;&nbsp;multiline&nbsp;comment</div>\n' +
                   '</code></div></div>\n' +
                   '</code>');
        });
    });
});
