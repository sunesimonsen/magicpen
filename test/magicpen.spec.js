/*global describe, it, beforeEach*/
var magicpen = require('../magicpen');
var expect = require('unexpected');

describe('magicpen', function () {
    describe('write', function () {
        describe('when given one argument', function () {
            it('appends the given text to the output', function () {
                magicpen.write('Hello');
                magicpen.write(' ');
                magicpen.write('world');
                expect(magicpen.toString(), 'to equal', 'Hello world');
            });
        });
    });
});
