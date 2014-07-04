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
                   .indent()
                   .text('beautiful')
                   .outdent()
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

            it('output is appended in blocks', function () {
                pen.red('Hello').sp().block(
                    new MagicPen()
                        .text('This is a').nl()
                        .text('multiline comment'));
                expect(pen.toString(), 'to equal',
                       'Hello This is a\n' +
                       '      multiline comment');
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
                   .indent()
                   .text('beautiful')
                   .outdent()
                   .green('world');
                expect(pen.toString(), 'to equal',
                       '\x1B[31mHello\x1B[39m\n' +
                       '  beautiful\n' +
                       '\x1B[32mworld\x1B[39m');
            });

            it('styles an be called as methods', function () {
                pen.red('Hello').sp().green('world').write('red, bold', '!');
                expect(pen.toString(), 'to equal',
                       '\x1B[31mHello\x1B[39m' +
                       ' ' +
                       '\x1B[32mworld\x1B[39m' +
                       '\x1B[31m\x1B[1m!\x1B[22m\x1B[39m');
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
                    expect(pen.toString(), 'to equal', '<div>Hello&nbsp;world</div>');
                });
            });

            describe('when given a style as the first argument', function () {
                it('appends the given text to the output with the specified styles', function () {
                    pen.write('red', 'Hello');
                    pen.write(' ');
                    pen.write('green', 'world');
                    expect(pen.toString(), 'to equal', '<div><span style="color: red">Hello</span>&nbsp;<span style="color: green">world</span></div>');
                });
            });
        });

        it('styles an be called as methods', function () {
            pen.red('Hello').sp().green('world').write('red, bold', '!');
            expect(pen.toString(), 'to equal',
                   '<div><span style="color: red">Hello</span>' +
                   '&nbsp;' +
                   '<span style="color: green">world</span>' +
                   '<span style="color: red"><span style="font-weight: bold">!</span></span></div>');
        });

        it('handles multi line output', function () {
            pen.red('Hello').nl().green('world');
            expect(pen.toString(), 'to equal',
                   '<div><span style="color: red">Hello</span></div>\n' +
                   '<div><span style="color: green">world</span></div>');
        });

        it('handles indented lines', function () {
            pen.red('Hello')
               .indent()
               .text('beautiful')
               .outdent()
               .green('world');
            expect(pen.toString(), 'to equal',
                   '<div><span style="color: red">Hello</span></div>\n' +
                   '<div style="padding-left: 10px">beautiful</div>\n' +
                   '<div><span style="color: green">world</span></div>');
        });

        it('encodes text inserted in tags', function () {
            pen.red('<foo & "bar">');
            expect(pen.toString(), 'to equal',
                   '<div><span style="color: red">&lt;foo&nbsp;&amp;&nbsp;&quot;bar&quot;&gt;</span></div>');
        });

        it('handles custom styles', function () {
            pen.addStyle('error', function (text) {
                this.red(text);
            });

            pen.error('Danger').sp().write('error', 'danger');
            expect(pen.toString(), 'to equal',
                   '<div><span style="color: red">Danger</span>&nbsp;<span style="color: red">danger</span></div>');
        });
    });
});
