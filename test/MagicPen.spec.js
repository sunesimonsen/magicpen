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

    describe('Fib example', function () {
        function writeFibWithPen(pen) {
            pen.addStyle('keyword', function (text) {
                this.text(text);
            });
            pen.addStyle('functionName', function (text) {
                this.text(text);
            });
            pen.addStyle('number', function (text) {
                this.text(text);
            });
            pen.keyword('function').sp().functionName('fib').text(' {')
                .indentLines()
                    .i().keyword('var').text(' i=0, fibs = [').number(0).text(', ').number(1).text('];').nl()
                    .i().keyword('for').text(' (; i < n; i += ').number(1).text(') {')
                    .indentLines()
                        .i().text('fibs.push(fibs[').number(0).text('] + fibs[').number(1).text(']);').nl()
                        .i().text('fibs.shift();')
                    .outdentLines()
                    .i().text('}').nl()
                    .i().keyword('return').text(' fibs[').number(0).text('];')
                .outdentLines()
                .text('}');
        }

        it('in plain mode', function () {
            var pen = new MagicPen();
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
            var pen = new MagicPen('ansi');
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
            expect(pen.toString(), 'to equal',
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
            var pen = new MagicPen('html');
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
            expect(pen.toString(), 'to equal', '<code>\n' +
                   '  <div><span style="color: black; font-weight: bold">function</span>&nbsp;<span style="color: red; font-weight: bold">fib</span>&nbsp;{</div>\n' +
                   '  <div>&nbsp;&nbsp;<span style="color: black; font-weight: bold">var</span>&nbsp;i=0,&nbsp;fibs&nbsp;=&nbsp;[<span style="color: cyan">0</span>,&nbsp;<span style="color: cyan">1</span>];</div>\n' +
                   '  <div>&nbsp;&nbsp;<span style="color: black; font-weight: bold">for</span>&nbsp;(;&nbsp;i&nbsp;&lt;&nbsp;n;&nbsp;i&nbsp;+=&nbsp;<span style="color: cyan">1</span>)&nbsp;{</div>\n' +
                   '  <div>&nbsp;&nbsp;&nbsp;&nbsp;fibs.push(fibs[<span style="color: cyan">0</span>]&nbsp;+&nbsp;fibs[<span style="color: cyan">1</span>]);</div>\n' +
                   '  <div>&nbsp;&nbsp;&nbsp;&nbsp;fibs.shift();</div>\n' +
                   '  <div>&nbsp;&nbsp;}</div>\n' +
                   '  <div>&nbsp;&nbsp;<span style="color: black; font-weight: bold">return</span>&nbsp;fibs[<span style="color: cyan">0</span>];</div>\n' +
                   '  <div>}</div>\n' +
                   '</code>');
        });
    });
});
