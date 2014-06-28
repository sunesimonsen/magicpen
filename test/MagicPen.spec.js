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
                    expect(pen.toString(), 'to equal', 'Hello&nbsp;world');
                });
            });

            describe('when given a style as the first argument', function () {
                it('appends the given text to the output with the specified styles', function () {
                    pen.write('red', 'Hello');
                    pen.write(' ');
                    pen.write('green', 'world');
                    expect(pen.toString(), 'to equal', '<span style="color: red">Hello</span>&nbsp;<span style="color: green">world</span>');
                });
            });
        });

        it('styles an be called as methods', function () {
            pen.red('Hello').sp().green('world').write('red, bold', '!');
            expect(pen.toString(), 'to equal',
                   '<span style="color: red">Hello</span>' +
                   '&nbsp;' +
                   '<span style="color: green">world</span>' +
                   '<span style="color: red"><span style="font-weight: bold">!</span></span>');
        });

        it('encodes text inserted in tags', function () {
            pen.red('<foo & "bar">');
            expect(pen.toString(), 'to equal',
                   '<span style="color: red">&lt;foo&nbsp;&amp;&nbsp;&quot;bar&quot;&gt;</span>');
        });
    });
});
