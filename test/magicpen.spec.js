/*global describe, it, beforeEach*/
var magicpen = require('..');
var expect = require('unexpected');
var sinon = require('sinon');
expect.use(require('unexpected-sinon'));

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

    it('throws when attempting to define a style that clashes with a falsy property', function () {
        expect(function () {
            magicpen().addStyle('indentationLevel', function () {});
        }, 'to throw', '"indentationLevel" style cannot be defined, it clashes with a built-in attribute');
    });

    it('allows redefining a style if allowRedefinition is set to true', function () {
        var pen = magicpen();
        pen.addStyle('red', function (content) {
            this.blue(content);
        }, true);
        expect(pen.red('wat'), 'to equal', magicpen().blue('wat'));
    });

    it('throw when prepending lines with multi line pen', function () {
        expect(function () {
            var multiLinePen = magicpen().text('Multiple').nl().text('Lines');
            magicpen().text('Hello').nl().text('world').prependLinesWith(multiLinePen);
        }, 'to throw', 'PrependLinesWith only supports a pen with single line content');
    });

    describe('use', function () {
        var pen;
        beforeEach(function () {
            pen = magicpen();
        });
        it('calls the given plugin with the magicpen instance as the parameter', function (done) {
            var plugin = {
                name: 'test',
                installInto: function (magicpenInstance) {
                    expect(magicpenInstance, 'to be', pen);
                    done();
                }
            };
            pen.use(plugin);
        });

        it('supports installPlugin as a legacy alias', function (done) {
            var plugin = {
                name: 'test',
                installInto: function (magicpenInstance) {
                    expect(magicpenInstance, 'to be', pen);
                    done();
                }
            };
            pen.installPlugin(plugin);
        });

        it('throws if the given arguments do not adhere to the plugin interface', function () {
            expect(function () {
                pen.use({});
            }, 'to throw', 'Plugins must be functions or adhere to the following interface\n' +
                   '{\n' +
                   '  name: <an optional plugin name>,\n' +
                   '  version: <an optional semver version string>,\n' +
                   '  dependencies: <an optional list of dependencies>,\n' +
                   '  installInto: <a function that will update the given magicpen instance>\n' +
                   '}');
        });

        it('allows the installation of a plugin given as an anonymous function', function () {
            var callCount = 0;
            var plugin = function () {
                callCount += 1;
            };
            pen.use(plugin);
            expect(callCount, 'to equal', 1);
            pen.use(plugin);
            expect(callCount, 'to equal', 1);
        });

        it('allows the installation of a plugin given as a named function', function () {
            var callCount = 0;
            var plugin = function myPlugin() {
                callCount += 1;
            };
            pen.use(plugin);
            expect(callCount, 'to equal', 1);
            pen.use(plugin);
            expect(callCount, 'to equal', 1);
        });

        it('fails if identically named, but different functions are installed', function () {
            pen.use(function myPlugin() {});
            expect(function () {
                pen.use(function myPlugin() {});
            }, 'to throw', "Another instance of the plugin 'myPlugin' is already installed. Please check your node_modules folder for unmet peerDependencies.");
        });

        it('does not fail if all plugin dependencies has been fulfilled', function (done) {
            var pluginA = {
                name: 'PluginA',
                installInto: function (expect) {}
            };
            var pluginB = {
                name: 'PluginB',
                dependencies: ['PluginA'],
                installInto: function (expect) {
                    done();
                }
            };
            pen.use(pluginA);
            pen.use(pluginB);
        });

        it('throws if the plugin has unfulfilled plugin dependencies', function () {
            var pluginB = {
                name: 'PluginB',
                dependencies: ['PluginA'],
                installInto: function (expect) {}
            };

            expect(function () {
                pen.use(pluginB);
            }, 'to throw', 'PluginB requires plugin PluginA');

            var pluginC = {
                name: 'PluginC',
                dependencies: ['PluginA', 'PluginB'],
                installInto: function (expect) {}
            };

            expect(function () {
                pen.use(pluginC);
            }, 'to throw', 'PluginC requires plugins PluginA and PluginB');

            var pluginD = {
                name: 'PluginD',
                dependencies: ['PluginA', 'PluginB', 'PluginC'],
                installInto: function (expect) {}
            };

            expect(function () {
                pen.use(pluginD);
            }, 'to throw', 'PluginD requires plugins PluginA, PluginB and PluginC');
        });

        it('dependencies can be fulfilled across clones', function (done) {
            var pluginA = {
                name: 'PluginA',
                installInto: function (expect) {}
            };
            var pluginB = {
                name: 'PluginB',
                dependencies: ['PluginA'],
                installInto: function (expect) {
                    done();
                }
            };
            pen.use(pluginA);
            var clonedPen = pen.clone();
            clonedPen.use(pluginB);
        });

        it('installing a plugin more than once is a no-op', function () {
            var callCount = 0;
            var plugin = {
                name: 'plugin',
                installInto: function () {
                    callCount += 1;
                }
            };
            pen.use(plugin);
            pen.use(plugin);
            pen.use(plugin);
            expect(callCount, 'to be', 1);
        });

        it('installing two different plugins that are identically named and have the same version (but not ===) will only install the first one', function () {
            var callCount1 = 0;
            var plugin1 = {
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {
                    callCount1 += 1;
                }
            };
            var callCount2 = 0;
            var plugin2 = {
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {
                    callCount2 += 1;
                }
            };
            pen.use(plugin1).use(plugin2);
            expect(callCount1, 'to be', 1);
            expect(callCount2, 'to be', 0);
        });

        it('should throw an error when installing two different plugins that are identically named and have different versions', function () {
            pen.use({
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {}
            });
            expect(function () {
                pen.use({
                    name: 'plugin',
                    version: '1.5.6',
                    installInto: function () {}
                });
            }, 'to throw', "Another instance of the plugin 'plugin' is already installed (version 1.2.3, trying to install 1.5.6). Please check your node_modules folder for unmet peerDependencies.");
        });

        it('should throw an error when two identically named plugins where the first one has a version number', function () {
            pen.use({
                name: 'plugin',
                version: '1.2.3',
                installInto: function () {}
            });
            expect(function () {
                pen.use({
                    name: 'plugin',
                    installInto: function () {}
                });
            }, 'to throw', "Another instance of the plugin 'plugin' is already installed (version 1.2.3). Please check your node_modules folder for unmet peerDependencies.");
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

        it('can be called with style arguments', function () {
            pen.red('Hello').block('text', ' // This is a\n // multiline comment');
            expect(pen.toString(), 'to equal',
                   'Hello // This is a\n' +
                   '      // multiline comment');
        });

        it('can be nested abitrarily', function () {
            pen.text('level 1').nl().text('=======').block(function () {
                this.text('level 2').nl().text('=======').block(function () {
                    this.text('level 3').nl().text('=======').block(function () {
                        this.text('level 4').nl().text('=======');
                    });
                });
            });
            expect(pen.toString(), 'to equal',
                   'level 1\n' +
                   '=======level 2\n' +
                   '       =======level 3\n' +
                   '              =======level 4\n' +
                   '                     =======');
        });

        it('can be appended after each other', function () {
            var spaceships = pen.clone()
                .text('>').nl()
                .text(' >').nl()
                .text('  >').nl()
                .text(' >').nl()
                .text('>');

            pen.block(spaceships).sp().block(spaceships).sp().block(spaceships).sp().block(spaceships);
            expect(pen.toString(), 'to equal',
                   '>   >   >   >\n' +
                   ' >   >   >   >\n' +
                   '  >   >   >   >\n' +
                   ' >   >   >   >\n' +
                   '>   >   >   >');

        });

        it('does not create trailing whitespace', function () {
            pen.block('text', 'tic')
               .block('text', '\ntac')
               .block('text', '\n\ntoe');

            expect(pen.toString(), 'to equal',
                   'tic\n' +
                   '   tac\n' +
                   '      toe');
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

        it('can be called with style arguments', function () {
            pen.text('Hello').sp().append('red', 'world!');
            expect(pen.toString(), 'to equal',
                   'Hello world!');
        });

        it('can be called with text arguments', function () {
            pen.text('Hello').sp().append('world!');
            expect(pen.toString(), 'to equal',
                   'Hello world!');
        });
    });

    describe('amend', function () {
        it('appends the given pen to the end of the output if the last entry is not a block', function () {
            expect(pen.text('Hello').amend(pen.clone().text('!')).toString(), 'to equal', 'Hello!');
        });

        it('appends the given pen to the last text entry in the output', function () {
            expect(pen.block('text', 'Hello\nworld').amend(function () {
                this.text('!');
            }).toString(), 'to equal', 'Hello\nworld!');
        });

        it('works with abitrary nesting', function () {
            expect(pen.block(function () {
                this.text('block1').block(function () {
                    this.nl().text('block2').block(function () {
                        this.nl().text('block3').block(function () {
                            this.nl().text('Hello');
                        });
                    });
                });
            }).amend(function () {
                this.text('!');
            }).toString(), 'to equal',
                   "block1\n" +
                   "      block2\n" +
                   "            block3\n" +
                   "                  Hello!");
        });

        it('can be called with a function as argument', function () {
            expect(pen.block('text', 'Hello\nworld').amend(function () {
                this.text('!');
            }).toString(), 'to equal', 'Hello\nworld!');
        });

        it('can be called with style arguments', function () {
            expect(pen.block('text', 'Hello\nworld').amend('text', '!').toString(),
                   'to equal', 'Hello\nworld!');
        });
    });

    describe('replaceText', function () {
        describe('with only a callback', function () {
            it('replaces all region with same styling', function () {
                pen.red('Hello').sp().green('world!').replaceText(function (styles, text) {
                    var args = [text.toUpperCase()].concat(styles);
                    this.text.apply(this, args);
                });
                expect(pen, 'to equal',
                       magicpen().red('HELLO').sp().green('WORLD!'));
            });
        });

        describe('with given a pattern and a callback', function () {
            it('replaces text content maching pattern', function () {
                pen.red('Hello').sp().green('world!').replaceText(/[a-z]{3}/, function (styles, text) {
                    var args = [text.toUpperCase()].concat(styles);
                    this.text.apply(this, args);
                });
                expect(pen, 'to equal',
                       magicpen().red('HELLo').sp().green('WORld!'));
            });
        });

        describe('with given a pattern and a string', function () {
            it('replaces text content maching pattern', function () {
                pen.text('Hello ').green('<placeholder>!').replaceText(/<placeholder>/, 'Jane Doe');
                expect(pen, 'to equal',
                       magicpen().text('Hello ').green('Jane Doe!'));
            });
        });

        describe('with given a string and a string', function () {
            it('replaces text content maching string', function () {
                pen.text('Hello ').green('<placeholder>!').replaceText('<placeholder>', 'Jane Doe');
                expect(pen, 'to equal',
                       magicpen().text('Hello ').green('Jane Doe!'));
            });
        });

        it('collapses entries with similar styles', function () {
            pen.green('Hello').sp().green('world!').replaceText(/ /, function (styles, text) {
                this.text(text, 'green');
            });
            expect(pen, 'to equal',
                   magicpen().green('Hello world!'));
        });

        it('is capable of introducing newlines from callback', function () {
            pen.text('Hello <placeholder>!').replaceText(/<placeholder>/, function (styles, text) {
                this.green('Jane Doe').nl().red('the incredible');
            });
            expect(pen, 'to equal',
                   magicpen().text('Hello').sp().green('Jane Doe').nl()
                             .red('the incredible').text('!'));
        });

        it('group matches are given as arguments to the replace callback', function () {
            pen.text('foo@example.com').replaceText(/(.+)@(.+)/, function (styles, text, user, domain) {
                this.text(user + ' at ' + domain);
            });
            expect(pen, 'to equal',
                   magicpen().text('foo at example.com'));
        });

        it('replace in complex output', function () {
            pen.addStyle('lightGray', function (content) {
                this.text(content, '#AAA');
            });
            writeComplicatedExampleWithPen(pen).replaceText(/\//g, function (styles, text) {
                this.lightGray(text);
            });
            expect(pen, 'to equal',
                   pen.clone().blue('This').sp().red('will').nl()
                       .green('output').sp().yellow('a').sp().cyan('dragon:')
                       .sp().block(function () {
                            this.gray("          ").lightGray("/").gray("           ").lightGray("/").nl()
                                .gray("         ").lightGray("/").gray("' .,,,,  .").lightGray("/").nl()
                                .gray("        ").lightGray("/").gray("';'     ,").lightGray("/").nl()
                                .gray("       ").lightGray("/").gray(" ").lightGray("/").gray("   ,,").text("//", "#AAA").gray(",`'`").nl()
                                .gray("      ( ,, '_,  ,,,' ``").nl()
                                .gray("      |    ").lightGray("/").red("@").gray("  ,,, ;\" `").nl()
                                .gray("     ").lightGray("/").gray("    .   ,''").lightGray("/").gray("' `,``").nl()
                                .gray("    ").lightGray("/").gray("   .     .").lightGray("/").gray(", `,, ` ;").nl()
                                .gray(" ,.").lightGray("/").gray("  .   ,-,',` ,,").lightGray("/").gray("''\\,'").nl()
                                .gray("|   ").lightGray("/").gray("; .").lightGray("/").gray(",,'`,,'' |   |").nl()
                                .gray("|     ").lightGray("/").gray("   ','    ").lightGray("/").gray("    |").nl()
                                .gray(" \\___").lightGray("/").gray("'   '     |     |").nl()
                                .gray("   `,,'  |      ").lightGray("/").gray("     `\\").nl()
                                .gray("        ").lightGray("/").gray("      |        ~\\").nl()
                                .gray("       '       (").nl()
                                .gray("      :").nl()
                                .gray("     ; .         \\--").nl()
                                .gray("   :   \\         ; ").blue('Ooyamaneko');
                        }).append(function () {
                            this.nl(2).text('stolen from the interwebs.');
                        }).prependLinesWith('text', '  '));
        });
    });

    describe('prependLinesWith', function () {
        it('prepends all lines with the the content of the given pen', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(pen.clone().sp().gray('//').sp());

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

        it('can be called with style arguments', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith('gray', ' // ');

            expect(pen.toString(), 'to equal',
                   ' // First line\n' +
                   ' // Second line\n' +
                   ' //   Third line');
        });

        it('works with blocks', function () {
            pen.block(function () {
                this.text('Hello\nworld');
            }).prependLinesWith(function () {
                this.text('> ');
            });

            expect(pen.toString(), 'to equal', '> Hello\n> world');
        });
    });

    describe('alt', function () {
        beforeEach(function () {
            pen = magicpen('ansi');
        });

        it('fails if the format of the pen is not set', function () {
            expect(function () {
                magicpen().alt({
                    fallback: 'wat'
                });
            }, 'to throw','The alt method is only supported on pen where the format has already been set');
        });

        it('assumes a noop if the alt does not specify the specific output format or a fallback', function () {
            expect(pen.alt({ html: 'wat' }).isEmpty(), 'to be true');
        });

        it('fails if the argument is not of the right type', function () {
            expect(function () {
                pen.alt({
                    ansi: { wat: 'wat' }
                });
            }, 'to throw',
                   'Requires the arguments to be:\n' +
                   'a pen or\n' +
                   'a callback appending content to a pen or\n' +
                   'a style and arguments for that style or\n' +
                   'just a string.');
        });

        describe('in text mode', function () {
            beforeEach(function () {
                pen = magicpen('text');
            });

            it('chooses the text output from alt blocks', function () {
                pen.alt({
                    fallback: function () { this.text('foo'); },
                    ansi: 'bar',
                    html: function () {
                        return '<img src="..." style="width: 100em">';
                    }
                });
                expect(pen.toString(), 'to equal', 'foo');
            });
        });

        describe('in ansi mode', function () {
            beforeEach(function () {
                pen = magicpen('ansi');
            });

            it('chooses the ansi output from alt blocks', function () {
                pen.alt({
                    fallback: function () { this.text('foo'); },
                    ansi: 'bar',
                    html: function () {
                        return '<img src="..." style="width: 100em">';
                    }
                });
                expect(pen.toString(), 'to equal', 'bar');
            });
        });

        describe('in html mode', function () {
            beforeEach(function () {
                pen = magicpen('html');
            });

            it('chooses the html output from alt blocks', function () {
                pen.alt({
                    fallback: function () { this.text('foo'); },
                    ansi: 'bar',
                    html: {
                        height: 5,
                        width: 100,
                        content: function () {
                            return '<img src="..." style="width: 100em, height: 5em">';
                        }
                    }
                });
                expect(pen.toString(), 'to equal',
                       '<div style="font-family: monospace; white-space: nowrap">\n' +
                       '  <div><img src="..." style="width: 100em, height: 5em"></div>\n' +
                       '</div>');
            });
        });

        it('custom content for modes can be specified as a string', function () {
            pen.alt({
                fallback: function () {},
                ansi: '\u001b[31m'
            });
            pen.text('foo');
            pen.alt({
                fallback: function () {},
                ansi: '\u001b[39m'
            });

            pen.alt({
                fallback: function () {
                    this.text('bar');
                },
                ansi: function () {
                    this.raw('\u001b[31m');
                    this.text('bar');
                    this.raw('\u001b[39m');
                }
            });
            expect(pen.toString(), 'to equal', '\x1B[31mfoo\x1B[39m\x1B[31mbar\x1B[39m');
        });

        it('custom content for modes can write to a magicpen bound to this', function () {
            pen.alt({
                fallback: function () {
                    this.text('foo');
                },
                ansi: function () { this.red('bar'); }
            });
            expect(pen.toString(), 'to equal', '\x1B[31mbar\x1B[39m');
        });

        it('custom content for modes can write to a magicpen recieved as the first argument', function () {
            pen.alt({
                fallback: function () {
                    this.text('foo');
                },
                ansi: function (output) { output.red('bar'); }
            });
            expect(pen.toString('ansi'), 'to equal', '\x1B[31mbar\x1B[39m');
        });

        it('the fallback content can be specified as a string', function () {
            pen.alt({
                fallback: 'foo'
            });
            expect(pen.toString(), 'to equal', 'foo');
        });

        it('the fallback content can be specified as a function that appends the output', function () {
            pen.alt({
                fallback: function () {
                    this.red('foo');
                }
            });
            expect(pen.toString('ansi'), 'to equal', '\x1B[31mfoo\x1B[39m');
        });

        it('the fallback content can be specified as a pen', function () {
            pen.alt({
                fallback: pen.clone().red('foo')
            });
            expect(pen.toString('ansi'), 'to equal', '\x1B[31mfoo\x1B[39m');
        });

        it('falls back to the fallback content if there is no override for the mode that is being serialized', function () {
            pen.alt({
                fallback: function (output) {
                    output.text('fallback');
                },
                text: 'wat'
            });
            expect(pen.toString(), 'to equal', 'fallback');
        });

        it('can be used inside a block', function () {
            function examplePen(format) {
                return magicpen(format)
                    .text('------------------------').nl()
                    .indentLines()
                    .i().block(function () {
                        this.alt({
                            fallback: function (output) {
                                output.text('fallback');
                            },
                            text: {
                                height: 3,
                                width: 22,
                                content: 'This will be\n' +
                                    'inserted in the output\n' +
                                    'without modifications'
                            },
                            ansi: function (output) {
                                this.text('serializing:').nl()
                                    .red(this.format);
                            },
                            html: function () {
                                this.text('wat').nl()
                                    .text('is').nl()
                                    .text('this');
                            }
                        });
                    }).nl()
                    .outdentLines()
                    .text('------------------------');
            }

            expect(examplePen('text').toString(), 'to equal',
                   '------------------------\n' +
                   '  This will be\n' +
                   'inserted in the output\n' +
                   'without modifications\n' +
                   '------------------------');
            expect(examplePen('ansi').toString(), 'to equal',
                   '------------------------\n' +
                   '  serializing:\n' +
                   '  \x1B[31mansi\x1B[39m\n' +
                   '------------------------');
            expect(examplePen('html').toString(), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div>------------------------</div>\n' +
                   '  <div>&nbsp;&nbsp;<div style="display: inline-block; vertical-align: top">\n' +
                   '  <div>wat</div>\n' +
                   '  <div>is</div>\n' +
                   '  <div>this</div>\n' +
                   '</div></div>\n' +
                   '  <div>------------------------</div>\n' +
                   '</div>');
        });

        it('should support fallback-less .alt within an existing alt context', function () {
            function examplePen(format) {
                return magicpen(format).alt({
                    html: function () {
                        this.text('Hello');
                        this.raw({
                            height: 20,
                            width: 20,
                            content: '<canvas id="whoa"></canvas>'
                        });
                        this.alt({
                            html: '<b>Nested alt with raw content</b>',
                            fallback: 'wat'
                        }).nl();
                        this.indentLines();
                        this.i().block(function () {
                            this.raw('raw content inside a block');
                        });
                    },
                    fallback: 'foo'
                });
            }


            expect(
                examplePen('html').toString(),
                'to equal',
                '<div style="font-family: monospace; white-space: nowrap">\n' +
                    '  <div>Hello<canvas id="whoa"></canvas><b>Nested alt with raw content</b></div>\n' +
                    '  <div>&nbsp;&nbsp;<div style="display: inline-block; vertical-align: top">\n' +
                    '  <div>raw content inside a block</div>\n' +
                    '</div></div>\n' +
                    '</div>'
            );

            expect(examplePen('text').toString(), 'to equal', 'foo');
        });
    });

    describe('clone', function () {
        describe('when given a format', function () {
            it('can be cloned to another format when the format is not specified yet', function () {
                pen = pen.clone('text');
                expect(pen.format, 'to equal', 'text');
            });

            it('can be cloned to another format when the pen is empty', function () {
                pen = pen.clone('text').clone('html');
                expect(pen.format, 'to equal', 'html');
            });

            it('fails when given an incompatible format', function () {
                expect(function () {
                    pen.clone('text').text('foobar').clone('html');
                }, 'to throw', 'This pen is only compatible with the format: text');
            });
        });
    });

    describe('in text mode', function () {
        it('ignores unknown styles', function () {
            pen.text('>').write({ style: 'test', args: ['text'] }).text('<');
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
            pen.red('Hello').sp().green('world').text('!', 'red', 'bold');
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
                .prependLinesWith(pen.clone().sp().gray('//').sp());

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
            pen.text('>').write({ style: 'test', args: ['text'] }).text('<');
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

        it('merges adjacent text entries with the same styling', function () {
            pen.red('Hello').red(' ').red('world').append('red', '!');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mHello world!\x1B[39m');
        });

        it('handles custom styles', function () {
            pen.addStyle('error', function (text) {
                this.red(text);
            });

            pen.error('Danger').sp().write({ style: 'error', args: ['danger'] });
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mDanger\x1B[39m \x1B[31mdanger\x1B[39m');
        });

        it('the content of a pen can be prepended to the start of each line', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(pen.clone().sp().gray('//').sp());

            expect(pen.toString('ansi'), 'to equal',
                   ' \u001b[90m//\u001b[39m First line\n' +
                   ' \u001b[90m//\u001b[39m Second line\n' +
                   ' \u001b[90m//\u001b[39m   Third line');
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
            pen.red('Hello').sp().green('world').text('!', 'red', 'bold');
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[31mHello\x1B[39m' +
                   ' ' +
                   '\x1B[32mworld\x1B[39m' +
                   '\x1B[31m\x1B[1m!\x1B[22m\x1B[39m');
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
                   '\x1b[40m\x1b[48;5;236mHello world\x1b[49m');
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
            pen.text('>').write({ style: 'test', args: ['text'] }).text('<');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div>&gt;&lt;</div>\n' +
                   '</div>'
                  );
        });

        it('styles an be called as methods', function () {
            pen.red('Hello').sp().green('world').text('!', 'red', 'bold');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: red">Hello</span>' +
                   '&nbsp;' +
                   '<span style="color: green">world</span>' +
                   '<span style="color: red; font-weight: bold">!</span></div>\n' +
                   '</div>');
        });

        it('handles multi line output', function () {
            pen.red('Hello').nl().green('world');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: red">Hello</span></div>\n' +
                   '  <div><span style="color: green">world</span></div>\n' +
                   '</div>');
        });

        it('handles multi line input', function () {
            pen.red('Hello\nworld');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
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
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: red">Hello</span></div>\n' +
                   '  <div>&nbsp;&nbsp;beautiful</div>\n' +
                   '  <div><span style="color: green">world</span></div>\n' +
                   '</div>');
        });

        it('encodes text inserted in tags', function () {
            pen.red('<foo & "bar">');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: red">&lt;foo&nbsp;&amp;&nbsp;&quot;bar&quot;&gt;</span></div>\n' +
                   '</div>');
        });

        it('merges adjacent text entries with the same styling', function () {
            pen.red('Hello').red(' ').red('world').append('red', '!');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: red">Hello&nbsp;world!</span></div>\n' +
                   '</div>');
        });

        it('handles custom styles', function () {
            pen.addStyle('error', function (text) {
                this.red(text);
            });

            pen.error('Danger').sp().write({ style: 'error', args: ['danger'] });
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: red">Danger</span>&nbsp;<span style="color: red">danger</span></div>\n' +
                   '</div>');
        });

        it('the content of a pen can be appended to the end of the output', function () {
            pen.text('Hello').sp().append(
                pen.clone()
                    .red('world!'));
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div>Hello&nbsp;<span style="color: red">world!</span></div>\n' +
                   '</div>');
        });

        it('the content of a pen can be prepended to the start of each line', function () {
            pen.text('First line').nl()
                .text('Second line').nl()
                .indentLines()
                .indent().text('Third line')
                .prependLinesWith(pen.clone().sp().gray('//').sp());

            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><div style="display: inline-block; vertical-align: top">\n' +
                   '  <div>&nbsp;<span style="color: gray">//</span>&nbsp;</div>\n' +
                   '  <div>&nbsp;<span style="color: gray">//</span>&nbsp;</div>\n' +
                   '  <div>&nbsp;<span style="color: gray">//</span>&nbsp;</div>\n' +
                   '</div><div style="display: inline-block; vertical-align: top">\n' +
                   '  <div>First&nbsp;line</div>\n' +
                   '  <div>Second&nbsp;line</div>\n' +
                   '  <div>&nbsp;&nbsp;Third&nbsp;line</div>\n' +
                   '</div></div>\n' +
                   '</div>');
        });

        it('the content of a pen can be appended in a block', function () {
            pen.red('Hello').block(
                pen.clone()
                    .gray(' // ').text('This is a').nl()
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment'));

            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: red">Hello</span><div style="display: inline-block; vertical-align: top">\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>This&nbsp;is&nbsp;a</div>\n' +
                   '  <div><span style="color: gray">&nbsp;//&nbsp;</span>&nbsp;&nbsp;multiline&nbsp;comment</div>\n' +
                   '</div></div>\n' +
                   '</div>');
        });

        it('knows the size of the output', function () {
            writeComplicatedExampleWithPen(pen);
            expect(pen.size(), 'to equal', { height: 21, width: 48 });
        });

        it('supports RGB text colors', function () {
            pen.text('Hello world', '#bada55');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: #bada55">Hello&nbsp;world</span></div>\n' +
                   '</div>');
        });

        it('supports RGB background colors', function () {
            pen.text('Hello world', 'bg#333');
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="background-color: #333">Hello&nbsp;world</span></div>\n' +
                   '</div>');
        });

        it('is capable of removing text formatting from the output', function () {
            pen.red('Hello').sp().green('world');
            expect(pen.removeFormatting().toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
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
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
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
                this.text(text, 'blue', 'bold');
            });
            pen.addStyle('functionName', function (text) {
                this.text(text, 'white', 'bold');
            });
            pen.addStyle('number', function (text) {
                this.text(text, 'cyan');
            });
            writeFibWithPen(pen);
            expect(pen.toString('ansi'), 'to equal',
                   '\u001b[34m\u001b[1mfunction\u001b[22m\u001b[39m \u001b[37m\u001b[1mfib\u001b[22m\u001b[39m {\n' +
                   '  \u001b[34m\u001b[1mvar\u001b[22m\u001b[39m i=0, fibs = [\u001b[36m0\u001b[39m, \u001b[36m1\u001b[39m];\n' +
                   '  \u001b[34m\u001b[1mfor\u001b[22m\u001b[39m (; i < n; i += \u001b[36m1\u001b[39m) {\n' +
                   '    fibs.push(fibs[\u001b[36m0\u001b[39m] + fibs[\u001b[36m1\u001b[39m]);\n' +
                   '    fibs.shift();\n' +
                   '  }\n' +
                   '  \u001b[34m\u001b[1mreturn\u001b[22m\u001b[39m fibs[\u001b[36m0\u001b[39m];\n' +
                   '}');
        });

        it('in html mode', function () {
            var pen = magicpen();
            pen.addStyle('keyword', function (text) {
                this.text(text, 'black', 'bold');
            });
            pen.addStyle('functionName', function (text) {
                this.text(text, 'red', 'bold');
            });
            pen.addStyle('number', function (text) {
                this.text(text, 'cyan');
            });
            writeFibWithPen(pen);
            expect(pen.toString('html'), 'to equal', '<div style="font-family: monospace; white-space: nowrap">\n' +
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

    describe('link example', function () {
        beforeEach(function () {
            pen.addStyle('link', function (label, url) {
                this.alt({
                    fallback: function () {
                        this.text(label).sp().text('(').blue(url).text(')');
                    },
                    html: {
                        height: 1,
                        width: label.length,
                        content: '<a href="' + url + '" alt="' + label + '">' + label + '</a>'
                    }
                });
            });
        });

        it('in text mode', function () {
            expect(pen.clone('text').text('This is a link:').nl().link('magicpen', 'https://github.com/sunesimonsen/magicpen').toString(), 'to equal',
                   'This is a link:\n' +
                   'magicpen (https://github.com/sunesimonsen/magicpen)');
        });

        it('in ansi mode', function () {
            expect(pen.clone('ansi').text('This is a link:').nl().link('magicpen', 'https://github.com/sunesimonsen/magicpen').toString(), 'to equal',
                   'This is a link:\n' +
                   'magicpen (\x1B[34mhttps://github.com/sunesimonsen/magicpen\x1B[39m)');
        });

        it('in html mode', function () {
            var examplePen = pen.clone('html').text('This is a link:').sp().link('magicpen', 'https://github.com/sunesimonsen/magicpen');
            expect(examplePen.size(), 'to equal', {
                height: 1,
                width: 'This is a link: magicpen'.length
            });

            expect(examplePen.toString(), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div>This&nbsp;is&nbsp;a&nbsp;link:&nbsp;<a href="https://github.com/sunesimonsen/magicpen" alt="magicpen">magicpen</a></div>\n' +
                   '</div>');
        });
    });

    describe('ColoredConsoleSerializer', function () {
        it('should output an array', function () {
            var pen = magicpen();
            pen.red('Hello, world!');
            expect(pen.toString('coloredConsole'), 'to equal', [
                '%cHello, world!',
                'color: red'
            ]);
        });

        it('should support blocks', function () {
            var pen = magicpen();
            pen.red('Hello').block(function () {
                this.gray(' // ').text('This is a').nl()
                    .indentLines()
                    .gray(' // ').indent().text('multiline comment');
            });
            expect(pen.toString('coloredConsole'), 'to equal', [
                '%cHello%c // %cThis is a%c\n %c     %c // %c  multiline comment',
                'color: red', 'color: gray', '', '', '', 'color: gray', ''
            ]);
        });

        it('should escape literal percent signs', function () {
            expect(magicpen().text('%').toString('coloredConsole'), 'to equal', [
                '%c%%', ''
            ]);
        });
    });

    describe('themes can be specified using the installTheme method', function () {
        var pen;
        beforeEach(function () {
            pen = magicpen();
            pen.installTheme('html', {
                accentColors: ['#D50000', '#C51162', '#AA00FF'],
                styles: {
                    comment: ['#969896', 'italic'],
                    keyword: '#bf41ea',
                    string: 'keyword'
                }
            });

            pen.text('// This is a comment', 'comment').nl();
            pen.keyword('function').sp().text('wat', 'methodDefinition').text('() {').nl();
            pen.indentLines();
            pen.i().text('console.').text('log', 'method').text('(').string('"wat"').text(');').nl();
            pen.outdentLines();
            pen.text('}');

            pen.installTheme('ansi', {
                accentColors: ['#F44336', '#E91E63', '#9C27B0'],
                styles: {
                    comment: 'grey',
                    keyword: 'cyan'
                }
            });
        });

        describe('retrieving theme information', function () {
            describe('without specifying the format', function () {
                it('fails if the format of the pen is not decided', function () {
                    expect(function () {
                        pen.theme();
                    }, 'to throw',
                           "Could not detect which format you want to retrieve " +
                           "theme information for. Set the format of the pen or " +
                           "provide it as an argument to the theme method.");
                });

                it('retrieves the theme information for the format of the pen', function () {
                    pen.format = 'html';
                    expect(pen.theme(), 'to equal', {
                        accentColors: ['#D50000', '#C51162', '#AA00FF'],
                        styles: {
                            comment: ['#969896', 'italic'],
                            keyword: '#bf41ea',
                            string: 'keyword'
                        }
                    });
                });
            });

            describe('for at specific format', function () {
                it('returns the theme information for the specified format', function () {
                    expect(pen.theme('ansi'), 'to equal', {
                        accentColors: ['#F44336', '#E91E63', '#9C27B0'],
                        styles: {
                            comment: 'grey',
                            keyword: 'cyan'
                        }
                    });
                });
            });
        });

        it('when serializing to text the theme has no effect', function () {
            expect(pen.toString('text'), 'to equal',
                   '// This is a comment\n' +
                   'function wat() {\n' +
                   '  console.log("wat");\n' +
                   '}');
        });

        it('when serializing to html the output uses the html theme', function () {
            expect(pen.toString('html'), 'to equal',
                   '<div style="font-family: monospace; white-space: nowrap">\n' +
                   '  <div><span style="color: #969896; font-style: italic">//&nbsp;This&nbsp;is&nbsp;a&nbsp;comment</span></div>\n' +
                   '  <div><span style="color: #bf41ea">function</span>&nbsp;wat()&nbsp;{</div>\n' +
                   '  <div>&nbsp;&nbsp;console.log(<span style="color: #bf41ea">&quot;wat&quot;</span>);</div>\n' +
                   '  <div>}</div>\n' +
                   '</div>');
        });

        it('when serializing to ansi the output uses the ansi theme', function () {
            expect(pen.toString('ansi'), 'to equal',
                   '\x1B[90m// This is a comment\x1B[39m\n'+
                   '\x1B[36mfunction\x1B[39m wat() {\n'+
                   '  console.log("wat");\n'+
                   '}');
        });

        describe('when the theme is extended', function () {
            beforeEach(function () {
                pen.installTheme(['ansi', 'html'], {
                    methodDefinition: '#55ab40'
                });

                pen.installTheme('html', {
                    comment: ['#969896', 'italic']
                });

                pen.installTheme('ansi', {
                    comment: '#969896'
                });

                pen.installTheme({
                    method: ['#55ab40', 'bold']
                });
            });

            describe('retrieving theme information', function () {
                it('returns the theme information for the extended theme for the specified format', function () {
                    expect(pen.theme('ansi'), 'to equal', {
                        accentColors: ['#F44336', '#E91E63', '#9C27B0'],
                        styles: {
                            comment: '#969896',
                            keyword: 'cyan',
                            methodDefinition: '#55ab40',
                            method: ['#55ab40', 'bold']
                        }
                    });
                });
            });

            it('when serializing to html the output uses the extended html theme', function () {
                expect(pen.toString('html'), 'to equal',
                       '<div style="font-family: monospace; white-space: nowrap">\n' +
                       '  <div><span style="color: #969896; font-style: italic">//&nbsp;This&nbsp;is&nbsp;a&nbsp;comment</span></div>\n' +
                       '  <div><span style="color: #bf41ea">function</span>&nbsp;<span style="color: #55ab40">wat</span>()&nbsp;{</div>\n' +
                       '  <div>&nbsp;&nbsp;console.<span style="color: #55ab40; font-weight: bold">log</span>(<span style="color: #bf41ea">&quot;wat&quot;</span>);</div>\n' +
                       '  <div>}</div>\n' +
                       '</div>');
            });

            it('when serializing to ansi the output uses the extended ansi theme', function () {
                expect(pen.toString('ansi'), 'to equal',
                       '\x1B[90m\u001b[38;5;246m// This is a comment\x1B[39m\n'+
                       '\x1B[36mfunction\x1B[39m \x1B[32m\x1B[38;5;113mwat\x1B[39m() {\n'+
                       '  console.\x1B[32m\x1B[38;5;113m\x1B[1mlog\x1B[22m\x1B[39m("wat");\n'+
                       '}');
            });
        });

        describe('when the theme has a loop', function () {
            beforeEach(function () {
                pen.installTheme({
                    comment: 'foo',
                    foo: 'bar',
                    bar: 'baz',
                    baz: 'qux',
                    qux: 'bar'
                });
            });

            it('throw when the theme is applied', function () {
                expect(function () {
                    pen.toString('ansi');
                }, 'to throw', 'Your theme contains a loop: bar -> baz -> qux -> bar');
            });
        });
    });

    describe('isBlock', function () {
        it('should return false for an empty pen', function () {
            expect(magicpen().isBlock(), 'to be false');
        });

        it('should return true for a pen with only a block', function () {
            expect(magicpen().block(function () {
                this.text('foo');
            }).isBlock(), 'to be true');
        });

        it('should return false for a pen with a block and then some', function () {
            expect(magicpen().block(function () {
                this.text('foo');
            }).text(',').isBlock(), 'to be false');
        });

        it('should return false for a pen with two blocks', function () {
            expect(magicpen().block(function () {
                this.text('foo');
            }).block(function () {
                this.text('bar');
            }).isBlock(), 'to be false');
        });
    });

    describe('isMultiline', function () {
        it('returns false if the output is empty', function () {
            expect(magicpen().isMultiline(), 'to be false');
        });

        it('returns false if the output is one line', function () {
            expect(magicpen().text('line 1').isMultiline(), 'to be false');
        });

        it('returns true if the output is multiple lines', function () {
            expect(magicpen().text('line 1\nline 2').isMultiline(), 'to be true');
        });

        it('returns true if the output is one line containing multiline block', function () {
            expect(magicpen().block('text', 'line 1\nline 2').isMultiline(), 'to be true');
        });
    });

    describe('isAtStartOfLine', function () {
        it('should return true for an empty pen', function () {
            expect(magicpen().isAtStartOfLine(), 'to be true');
        });

        it('should return true for a non-empty pen that ends with a newline', function () {
            expect(magicpen().text('foo').nl().isAtStartOfLine(), 'to be true');
        });

        it('should return false for a non-empty pen that does not end with a newline', function () {
            expect(magicpen().text('foo').isAtStartOfLine(), 'to be false');
        });
    });
});
